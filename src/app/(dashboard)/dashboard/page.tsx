// src/app/(dashboard)/dashboard/page.tsx
import { prisma } from "@/lib/prisma";
import { fmtCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const [rfqCount, quotCount, poCount, invoices] = await Promise.all([
    prisma.rfq.count(),
    prisma.quotation.count(),
    prisma.purchaseOrder.count(),
    prisma.invoice.findMany({ include: { payments: true } }),
  ]);

  const outstanding = invoices.reduce((sum, inv) => {
    const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
    return sum + Math.max(Number(inv.value) - paid, 0);
  }, 0);

  const kpis = [
    { label: "Total RFQ", value: rfqCount },
    { label: "Penawaran Dibuat", value: quotCount },
    { label: "PO Diterima", value: poCount },
    { label: "Invoice Outstanding", value: fmtCurrency(outstanding) },
  ];

  return (
    <main className="p-8">
      <h1 className="mb-6 text-xl font-bold text-navy">Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-lg border-l-4 border-gold bg-white p-4 shadow-sm">
            <div className="text-xs uppercase text-slate-500">{k.label}</div>
            <div className="mt-1 text-2xl font-bold">{k.value}</div>
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm text-slate-400">
        Modul lain (Master Data, RFQ, Quotation, PO, Delivery, Invoice, Payment, AR Monitoring,
        Reports, Print Documents) menyusul sesuai roadmap di PROJECT_PLAN.md.
      </p>
    </main>
  );
}
