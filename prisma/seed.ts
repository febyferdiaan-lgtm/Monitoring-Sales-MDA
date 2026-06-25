// prisma/seed.ts
// Migrasi data dari Monitoring_Sales_FEBY.xlsx (sheet RAW) ke database baru.
// Jalankan: npm run prisma:seed -- /path/to/Monitoring_Sales_FEBY.xlsx

import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import path from "path";

const prisma = new PrismaClient();

const COLS = [
  "no","customer","location","transaction","project",
  "rfq_date","rfq_no","rfq_part","rfq_desc","rfq_qty","rfq_uom",
  "quot_date","quot_no","quot_part","quot_desc","quot_qty","quot_uom","quot_price","quot_amount",
  "po_date","po_no","po_part","po_desc","po_qty","po_uom","po_price","po_amount",
  "sj_date","sj_no",
  "inv_date","inv_no","inv_part","inv_desc","inv_qty","inv_uom","dpp","amount_dpp","ppn","amount","pph23","total_ar",
  "type","termin","due_date_invoice","aging_invoice","due_date_received","nominal_payment","transfer_date","status","selisih_payment","note",
];

function rowToObj(row: any[]): Record<string, any> {
  const obj: Record<string, any> = {};
  COLS.forEach((c, i) => (obj[c] = row[i + 1])); // data starts at column B (index 1)
  return obj;
}

async function main() {
  const filePath = process.argv[2] || path.join(__dirname, "../data/Monitoring_Sales_FEBY.xlsx");
  console.log("Reading:", filePath);

  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets["RAW"];
  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false });

  const dataRows = rows.slice(5).filter((r) => r[1]); // skip header rows, require customer column
  console.log(`Found ${dataRows.length} data rows`);

  const customerCache = new Map<string, string>(); // name -> id
  const productCache = new Map<string, string>(); // partNumber -> id

  for (const raw of dataRows) {
    const r = rowToObj(raw);

    // ---- Customer ----
    let customerId = customerCache.get(r.customer);
    if (!customerId) {
      const customer = await prisma.customer.upsert({
        where: { name: r.customer },
        update: {},
        create: { name: r.customer, address: r.location || null },
      });
      customerId = customer.id;
      customerCache.set(r.customer, customerId);
    }

    // ---- Product (optional, from any stage) ----
    const partNo = r.rfq_part || r.quot_part || r.po_part || r.inv_part;
    if (partNo && !productCache.has(String(partNo))) {
      const product = await prisma.product.upsert({
        where: { partNumber: String(partNo) },
        update: {},
        create: {
          partNumber: String(partNo),
          description: r.rfq_desc || r.quot_desc || r.po_desc || r.inv_desc || null,
          uom: r.rfq_uom || r.quot_uom || r.po_uom || r.inv_uom || null,
        },
      });
      productCache.set(String(partNo), product.id);
    }

    // ---- RFQ ----
    if (r.rfq_no) {
      await prisma.rfq.upsert({
        where: { no: String(r.rfq_no) },
        update: {},
        create: {
          no: String(r.rfq_no),
          date: r.rfq_date ? new Date(r.rfq_date) : new Date(),
          customerId,
          description: r.rfq_desc || null,
          estimatedValue: r.quot_amount || null,
          status: r.quot_no ? "QUOTED" : "OPEN",
        },
      });
    }

    // ---- Quotation ----
    if (r.quot_no) {
      const quotation = await prisma.quotation.upsert({
        where: { no: String(r.quot_no) },
        update: {},
        create: {
          no: String(r.quot_no),
          date: r.quot_date ? new Date(r.quot_date) : new Date(),
          customerId,
          status: r.po_no ? "DISETUJUI" : "TERKIRIM",
        },
      });
      if (r.quot_part) {
        await prisma.quotationItem.create({
          data: {
            quotationId: quotation.id,
            productId: productCache.get(String(partNo)) || null,
            description: r.quot_desc || null,
            qty: r.quot_qty || 0,
            uom: r.quot_uom || null,
            price: r.quot_price || 0,
            amount: r.quot_amount || 0,
          },
        });
      }
    }

    // ---- Purchase Order ----
    if (r.po_no) {
      await prisma.purchaseOrder.upsert({
        where: { no: String(r.po_no) },
        update: {},
        create: {
          no: String(r.po_no),
          date: r.po_date ? new Date(r.po_date) : new Date(),
          customerId,
          value: r.po_amount || 0,
          status: r.inv_no ? "SELESAI" : "PROSES",
        },
      });
    }

    // ---- Delivery Order ----
    if (r.sj_no) {
      await prisma.deliveryOrder.upsert({
        where: { no: String(r.sj_no) },
        update: {},
        create: {
          no: String(r.sj_no),
          date: r.sj_date ? new Date(r.sj_date) : new Date(),
          customerId,
          status: r.inv_no ? "DITERIMA_CUSTOMER" : "TERKIRIM",
        },
      });
    }

    // ---- Invoice + Payment ----
    if (r.inv_no) {
      const invoice = await prisma.invoice.upsert({
        where: { no: String(r.inv_no) },
        update: {},
        create: {
          no: String(r.inv_no),
          date: r.inv_date ? new Date(r.inv_date) : new Date(),
          customerId,
          value: r.total_ar || r.amount || 0,
          top: r.termin ? Number(r.termin) || 30 : 30,
          dueDate: r.due_date_invoice ? new Date(r.due_date_invoice) : null,
          status: r.nominal_payment ? "LUNAS" : "BELUM_DIBAYAR",
        },
      });

      if (r.inv_part) {
        await prisma.invoiceItem.create({
          data: {
            invoiceId: invoice.id,
            productId: productCache.get(String(partNo)) || null,
            description: r.inv_desc || null,
            qty: r.inv_qty || 0,
            uom: r.inv_uom || null,
            dpp: r.dpp || 0,
            ppn: r.ppn || 0,
            amount: r.amount_dpp || r.amount || 0,
          },
        });
      }

      if (r.transfer_date && r.nominal_payment) {
        await prisma.payment.create({
          data: {
            invoiceId: invoice.id,
            date: new Date(r.transfer_date),
            amount: r.nominal_payment,
            method: r.type || null,
          },
        });
      }
    }
  }

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
