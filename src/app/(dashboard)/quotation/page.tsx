// src/app/(dashboard)/quotation/page.tsx
"use client";
import { useEffect, useState } from "react";
import StatusPill from "@/components/StatusPill";
import { useRouter } from "next/navigation";

type Quotation = {
  id: string; no: string; date: string; status: string;
  customer: { name: string };
  items: { amount: number }[];
};

export default function QuotationPage() {
  const router = useRouter();
  const [data, setData] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/quotation").then((r) => r.json()).then((d) => { setData(d); setLoading(false); });
  }, []);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy">Penawaran (Quotation)</h1>
          <p className="text-sm text-slate-500">Quotation yang dikirim ke customer</p>
        </div>
        <button onClick={() => router.push("/quotation/new")} className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-navy">
          + Tambah Penawaran
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="p-3 text-left">No. Penawaran</th>
              <th className="p-3 text-left">Tanggal</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="p-6 text-center text-slate-400">Memuat...</td></tr>}
            {!loading && data.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-400">Belum ada penawaran</td></tr>}
            {data.map((q) => (
              <tr key={q.id} className="border-b hover:bg-slate-50">
                <td className="p-3 font-medium">{q.no}</td>
                <td className="p-3">{new Date(q.date).toLocaleDateString("id-ID")}</td>
                <td className="p-3">{q.customer.name}</td>
                <td className="p-3">Rp {q.items.reduce((s, i) => s + Number(i.amount), 0).toLocaleString("id-ID")}</td>
                <td className="p-3"><StatusPill status={q.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}