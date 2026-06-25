// src/app/(dashboard)/rfq/page.tsx
"use client";
import { useEffect, useState } from "react";
import StatusPill from "@/components/StatusPill";

type Customer = { id: string; name: string };
type Rfq = {
  id: string;
  no: string;
  date: string;
  description?: string;
  estimatedValue?: number;
  status: string;
  customer: Customer;
};

export default function RfqPage() {
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ no: "", date: "", customerId: "", description: "", estimatedValue: "" });
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [rfqRes, custRes] = await Promise.all([fetch("/api/rfq"), fetch("/api/customers")]);
    setRfqs(await rfqRes.json());
    setCustomers(await custRes.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave() {
    if (!form.no || !form.date || !form.customerId) return alert("No RFQ, tanggal, dan customer wajib diisi");
    const res = await fetch("/api/rfq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        estimatedValue: form.estimatedValue ? Number(form.estimatedValue) : undefined,
      }),
    });
    if (!res.ok) return alert("Gagal menyimpan RFQ");
    setShowModal(false);
    setForm({ no: "", date: "", customerId: "", description: "", estimatedValue: "" });
    load();
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy">Request for Quotation (RFQ)</h1>
          <p className="text-sm text-slate-500">Permintaan penawaran dari customer</p>
        </div>
        <button onClick={() => setShowModal(true)} className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-navy">
          + Tambah RFQ
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="p-3 text-left">No. RFQ</th>
              <th className="p-3 text-left">Tanggal</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Deskripsi</th>
              <th className="p-3 text-left">Estimasi Nilai</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="p-6 text-center text-slate-400">Memuat...</td></tr>}
            {!loading && rfqs.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-slate-400">Belum ada RFQ</td></tr>}
            {rfqs.map((r) => (
              <tr key={r.id} className="border-b hover:bg-slate-50">
                <td className="p-3 font-medium">{r.no}</td>
                <td className="p-3">{new Date(r.date).toLocaleDateString("id-ID")}</td>
                <td className="p-3">{r.customer.name}</td>
                <td className="p-3">{r.description || "-"}</td>
                <td className="p-3">{r.estimatedValue ? `Rp ${Number(r.estimatedValue).toLocaleString("id-ID")}` : "-"}</td>
                <td className="p-3"><StatusPill status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[420px] rounded-xl bg-white p-6">
            <h2 className="mb-4 text-lg font-bold">Tambah RFQ</h2>
            <div className="space-y-3">
              <Input label="No. RFQ" value={form.no} onChange={(v) => setForm({ ...form, no: v })} />
              <Input label="Tanggal" type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">Customer</label>
                <select
                  value={form.customerId}
                  onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="">Pilih customer...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <Input label="Deskripsi Permintaan" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
              <Input label="Nilai Estimasi" type="number" value={form.estimatedValue} onChange={(v) => setForm({ ...form, estimatedValue: v })} />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="rounded-lg border px-4 py-2 text-sm">Batal</button>
              <button onClick={handleSave} className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-navy">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-slate-500">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
    </div>
  );
}
