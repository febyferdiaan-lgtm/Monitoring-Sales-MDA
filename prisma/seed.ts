// prisma/seed.ts
// Migrasi data dari Excel ke database baru.
// Jalankan: npm run prisma:seed -- /path/to/file.xlsx

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
  COLS.forEach((c, i) => (obj[c] = row[i + 1]));
  return obj;
}

function toStr(v: any): string | null {
  if (v === null || v === undefined || v === "") return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).trim();
}

function toNum(v: any): number {
  if (v === null || v === undefined || v === "") return 0;
  if (v instanceof Date) return 0;
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

function toDate(v: any): Date | null {
  if (v === null || v === undefined || v === "") return null;
  if (v instanceof Date && !isNaN(v.getTime())) return v;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

async function main() {
  const filePath = process.argv[2] || path.join(__dirname, "../data/Monitoring_Sales_FEBY.xlsx");
  console.log("Reading:", filePath);

  const wb = XLSX.readFile(filePath, { cellDates: true });
  const ws = wb.Sheets["RAW"];
  const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

  const dataRows = rows.slice(5).filter((r) => r[1]);
  console.log(`Found ${dataRows.length} data rows`);

  const customerCache = new Map<string, string>();
  const productCache = new Map<string, string>();

  let success = 0;
  let skipped = 0;

  for (const [idx, raw] of dataRows.entries()) {
    try {
      const r0 = rowToObj(raw);

      const r = {
        customer: toStr(r0.customer),
        location: toStr(r0.location),
        rfq_date: toDate(r0.rfq_date),
        rfq_no: toStr(r0.rfq_no),
        rfq_part: toStr(r0.rfq_part),
        rfq_desc: toStr(r0.rfq_desc),
        rfq_uom: toStr(r0.rfq_uom),
        quot_date: toDate(r0.quot_date),
        quot_no: toStr(r0.quot_no),
        quot_part: toStr(r0.quot_part),
        quot_desc: toStr(r0.quot_desc),
        quot_qty: toNum(r0.quot_qty),
        quot_uom: toStr(r0.quot_uom),
        quot_price: toNum(r0.quot_price),
        quot_amount: toNum(r0.quot_amount),
        po_date: toDate(r0.po_date),
        po_no: toStr(r0.po_no),
        po_part: toStr(r0.po_part),
        po_desc: toStr(r0.po_desc),
        po_amount: toNum(r0.po_amount),
        sj_date: toDate(r0.sj_date),
        sj_no: toStr(r0.sj_no),
        inv_date: toDate(r0.inv_date),
        inv_no: toStr(r0.inv_no),
        inv_part: toStr(r0.inv_part),
        inv_desc: toStr(r0.inv_desc),
        inv_qty: toNum(r0.inv_qty),
        inv_uom: toStr(r0.inv_uom),
        dpp: toNum(r0.dpp),
        ppn: toNum(r0.ppn),
        amount_dpp: toNum(r0.amount_dpp),
        amount: toNum(r0.amount),
        total_ar: toNum(r0.total_ar),
        type: toStr(r0.type),
        termin: toNum(r0.termin),
        due_date_invoice: toDate(r0.due_date_invoice),
        nominal_payment: toNum(r0.nominal_payment),
        transfer_date: toDate(r0.transfer_date),
      };

      if (!r.customer) {
        skipped++;
        continue;
      }

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

      const partNo = r.rfq_part || r.quot_part || r.po_part || r.inv_part;
      if (partNo && !productCache.has(partNo)) {
        const product = await prisma.product.upsert({
          where: { partNumber: partNo },
          update: {},
          create: {
            partNumber: partNo,
            description: r.rfq_desc || r.quot_desc || r.po_desc || r.inv_desc || null,
            uom: r.rfq_uom || r.quot_uom || r.inv_uom || null,
          },
        });
        productCache.set(partNo, product.id);
      }

      if (r.rfq_no) {
        await prisma.rfq.upsert({
          where: { no: r.rfq_no },
          update: {},
          create: {
            no: r.rfq_no,
            date: r.rfq_date || new Date(),
            customerId,
            description: r.rfq_desc,
            estimatedValue: r.quot_amount || null,
            status: r.quot_no ? "QUOTED" : "OPEN",
          },
        });
      }

      if (r.quot_no) {
        const quotation = await prisma.quotation.upsert({
          where: { no: r.quot_no },
          update: {},
          create: {
            no: r.quot_no,
            date: r.quot_date || new Date(),
            customerId,
            status: r.po_no ? "DISETUJUI" : "TERKIRIM",
          },
        });
        if (r.quot_part) {
          await prisma.quotationItem.create({
            data: {
              quotationId: quotation.id,
              productId: productCache.get(partNo!) || null,
              description: r.quot_desc,
              qty: r.quot_qty,
              uom: r.quot_uom,
              price: r.quot_price,
              amount: r.quot_amount,
            },
          });
        }
      }

      if (r.po_no) {
        await prisma.purchaseOrder.upsert({
          where: { no: r.po_no },
          update: {},
          create: {
            no: r.po_no,
            date: r.po_date || new Date(),
            customerId,
            value: r.po_amount,
            status: r.inv_no ? "SELESAI" : "PROSES",
          },
        });
      }

      if (r.sj_no) {
        await prisma.deliveryOrder.upsert({
          where: { no: r.sj_no },
          update: {},
          create: {
            no: r.sj_no,
            date: r.sj_date || new Date(),
            customerId,
            status: r.inv_no ? "DITERIMA_CUSTOMER" : "TERKIRIM",
          },
        });
      }

      if (r.inv_no) {
        const invoice = await prisma.invoice.upsert({
          where: { no: r.inv_no },
          update: {},
          create: {
            no: r.inv_no,
            date: r.inv_date || new Date(),
            customerId,
            value: r.total_ar || r.amount || 0,
            top: r.termin || 30,
            dueDate: r.due_date_invoice,
            status: r.nominal_payment ? "LUNAS" : "BELUM_DIBAYAR",
          },
        });

        if (r.inv_part) {
          await prisma.invoiceItem.create({
            data: {
              invoiceId: invoice.id,
              productId: productCache.get(partNo!) || null,
              description: r.inv_desc,
              qty: r.inv_qty,
              uom: r.inv_uom,
              dpp: r.dpp,
              ppn: r.ppn,
              amount: r.amount_dpp || r.amount,
            },
          });
        }

        if (r.transfer_date && r.nominal_payment) {
          await prisma.payment.create({
            data: {
              invoiceId: invoice.id,
              date: r.transfer_date,
              amount: r.nominal_payment,
              method: r.type,
            },
          });
        }
      }

      success++;
    } catch (err: any) {
      skipped++;
      console.warn(`Skip row ${idx + 1}: ${err.message?.slice(0, 150)}`);
    }
  }

  console.log(`Seed completed. Success: ${success}, Skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });