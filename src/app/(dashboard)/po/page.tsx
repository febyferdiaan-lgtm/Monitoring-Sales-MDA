// src/app/(dashboard)/po/page.tsx
"use client";
import { useEffect, useState } from "react";
import StatusPill from "@/components/StatusPill";

type Po = {
  id: string; no: string; date: string; value: number; dueDate?: string; status: string;
  customer: { name: string };
};

export default function PoPage() {
  const [data, setData] = useState<Po[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/po").then((r) => r.json()).then((d) => { setData(d); setLoading(false); });
  }, []);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy">Purchase Order (PO)</h1>
        <p className="text-sm text-slate-500">PO yang diterima dari customer</p>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="p-3 text-left">No. PO</th>
              <th className="p-3 text-left">Tanggal</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Nilai PO</th>
              <th className="p-3 text-left">Jatuh Tempo</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="p-6 text-center text-slate-400">Memuat...</td></tr>}
            {!loading && data.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-slate-400">Belum ada PO</td></tr>}
            {data.map((p) => (
              <tr key={p.id} className="border-b hover:bg-slate-50">
                <td className="p-3 font-medium">{p.no}</td>
                <td className="p-3">{new Date(p.date).toLocaleDateString("id-ID")}</td>
                <td className="p-3">{p.customer.name}</td>
                <td className="p-3">Rp {Number(p.value).toLocaleString("id-ID")}</td>
                <td className="p-3">{p.dueDate ? new Date(p.dueDate).toLocaleDateString("id-ID") : "-"}</td>
                <td className="p-3"><StatusPill status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
