// src/app/(dashboard)/delivery/page.tsx
"use client";
import { useEffect, useState } from "react";
import StatusPill from "@/components/StatusPill";

type Delivery = {
  id: string; no: string; date: string; status: string;
  customer: { name: string };
  po?: { no: string } | null;
};

export default function DeliveryPage() {
  const [data, setData] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/delivery").then((r) => r.json()).then((d) => { setData(d); setLoading(false); });
  }, []);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy">Pengiriman Barang (Surat Jalan)</h1>
        <p className="text-sm text-slate-500">Delivery order / surat jalan</p>
      </div>
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="p-3 text-left">No. Surat Jalan</th>
              <th className="p-3 text-left">Tanggal Kirim</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Referensi PO</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="p-6 text-center text-slate-400">Memuat...</td></tr>}
            {!loading && data.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-400">Belum ada pengiriman</td></tr>}
            {data.map((d) => (
              <tr key={d.id} className="border-b hover:bg-slate-50">
                <td className="p-3 font-medium">{d.no}</td>
                <td className="p-3">{new Date(d.date).toLocaleDateString("id-ID")}</td>
                <td className="p-3">{d.customer.name}</td>
                <td className="p-3">{d.po?.no || "-"}</td>
                <td className="p-3"><StatusPill status={d.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
