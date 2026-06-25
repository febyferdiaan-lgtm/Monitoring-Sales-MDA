// src/app/(dashboard)/payment/page.tsx
"use client";
import { useEffect, useState } from "react";

type Invoice = { id: string; no: string; value: number; customer: { name: string }; payments: { amount: number }[] };
type Payment = {
  id: string; date: string; amount: number; method?: string;
  invoice: { no: string; customer: { name: string } };
};

export default function PaymentPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ invoiceId: "", date: "", amount: "", method: "", refNumber: "" });
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [pRes, iRes] = await Promise.all([fetch("/api/payment"), fetch("/api/invoice")]);
    setPayments(await pRes.json());
    setInvoices(await iRes.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function remainingFor(inv: Invoice) {
    const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
    return Math.max(Number(inv.value) - paid, 0);
  }

  async function handleSave() {
    if (!form.invoiceId || !form.date || !form.amount) return alert("Invoice, tanggal, dan jumlah wajib diisi");
    const res = await fetch("/api/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: Number(form.amount) }),
    });
    if (!res.ok) return alert("Gagal menyimpan pembayaran");
    setShowModal(false);
    setForm({ invoiceId: "", date: "", amount: "", method: "", refNumber: "" });
    load();
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy">Konfirmasi Pembayaran</h1>
          <p className="text-sm text-slate-500">Histori penerimaan pembayaran customer (mendukung pembayaran parsial)</p>
        </div>
        <button onClick={() => setShowModal(true)} className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-navy">
          + Catat Pembayaran
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="p-3 text-left">Tgl Bayar</th>
              <th className="p-3 text-left">No. Invoice</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Jumlah</th>
              <th className="p-3 text-left">Metode</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="p-6 text-center text-slate-400">Memuat...</td></tr>}
            {!loading && payments.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-400">Belum ada pembayaran</td></tr>}
            {payments.map((p) => (
              <tr key={p.id} className="border-b hover:bg-slate-50">
                <td className="p-3">{new Date(p.date).toLocaleDateString("id-ID")}</td>
                <td className="p-3 font-medium">{p.invoice.no}</td>
                <td className="p-3">{p.invoice.customer.name}</td>
                <td className="p-3">Rp {Number(p.amount).toLocaleString("id-ID")}</td>
                <td className="p-3">{p.method || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[420px] rounded-xl bg-white p-6">
            <h2 className="mb-4 text-lg font-bold">Catat Pembayaran</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">Invoice</label>
                <select
                  value={form.invoiceId}
                  onChange={(e) => setForm({ ...form, invoiceId: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="">Pilih invoice...</option>
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.no} — {inv.customer.name} (sisa Rp {remainingFor(inv).toLocaleString("id-ID")})
                    </option>
                  ))}
                </select>
              </div>
              <Field label="Tanggal Pembayaran" type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
              <Field label="Jumlah Pembayaran" type="number" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} />
              <Field label="Metode Pembayaran" value={form.method} onChange={(v) => setForm({ ...form, method: v })} />
              <Field label="No. Referensi Transfer" value={form.refNumber} onChange={(v) => setForm({ ...form, refNumber: v })} />
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

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-slate-500">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" />
    </div>
  );
}
