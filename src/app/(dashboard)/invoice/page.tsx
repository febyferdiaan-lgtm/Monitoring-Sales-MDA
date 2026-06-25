// src/app/(dashboard)/invoice/page.tsx
"use client";
import { useEffect, useState } from "react";
import StatusPill from "@/components/StatusPill";

type Invoice = {
  id: string; no: string; date: string; value: number; dueDate?: string; status: string;
  customer: { name: string };
  payments: { amount: number }[];
};

export default function InvoicePage() {
  const [data, setData] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/invoice").then((r) => r.json()).then((d) => { setData(d); setLoading(false); });
  }, []);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy">Invoice</h1>
        <p className="text-sm text-slate-500">Tagihan ke customer</p>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="p-3 text-left">No. Invoice</th>
              <th className="p-3 text-left">Tanggal</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Nilai</th>
              <th className="p-3 text-left">Sudah Dibayar</th>
              <th className="p-3 text-left">Jatuh Tempo</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="p-6 text-center text-slate-400">Memuat...</td></tr>}
            {!loading && data.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-slate-400">Belum ada invoice</td></tr>}
            {data.map((inv) => {
              const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
              return (
                <tr key={inv.id} className="border-b hover:bg-slate-50">
                  <td className="p-3 font-medium">{inv.no}</td>
                  <td className="p-3">{new Date(inv.date).toLocaleDateString("id-ID")}</td>
                  <td className="p-3">{inv.customer.name}</td>
                  <td className="p-3">Rp {Number(inv.value).toLocaleString("id-ID")}</td>
                  <td className="p-3">Rp {paid.toLocaleString("id-ID")}</td>
                  <td className="p-3">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("id-ID") : "-"}</td>
                  <td className="p-3"><StatusPill status={inv.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
