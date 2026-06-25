// src/app/(dashboard)/master/customers/page.tsx
"use client";
import { useEffect, useState } from "react";

type Customer = {
  id: string;
  name: string;
  pic?: string | null;
  address?: string | null;
  email?: string | null;
  phone?: string | null;
  npwp?: string | null;
  top: number;
  status: "AKTIF" | "TIDAK_AKTIF";
  _count?: { rfqs: number; quotations: number; purchaseOrders: number; invoices: number };
};

const emptyForm = { name: "", pic: "", address: "", email: "", phone: "", npwp: "", top: 30, status: "AKTIF" as const };

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/customers");
    setCustomers(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(c: Customer) {
    setEditingId(c.id);
    setForm({
      name: c.name,
      pic: c.pic || "",
      address: c.address || "",
      email: c.email || "",
      phone: c.phone || "",
      npwp: c.npwp || "",
      top: c.top,
      status: c.status,
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return alert("Nama customer wajib diisi");
    const url = editingId ? `/api/customers/${editingId}` : "/api/customers";
    const method = editingId ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) return alert("Gagal menyimpan customer");
    setShowModal(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus customer ini?")) return;
    const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
    if (!res.ok) return alert("Gagal menghapus (mungkin masih ada transaksi terkait)");
    load();
  }

  const filtered = customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy">Data Customer</h1>
          <p className="text-sm text-slate-500">Master data pelanggan</p>
        </div>
        <button onClick={openCreate} className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-navy">
          + Tambah Customer
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari nama customer..."
        className="mb-4 w-72 rounded-lg border px-3 py-2 text-sm"
      />

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="p-3 text-left">Nama</th>
              <th className="p-3 text-left">PIC</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">TOP</th>
              <th className="p-3 text-left">RFQ</th>
              <th className="p-3 text-left">Invoice</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} className="p-6 text-center text-slate-400">Memuat data...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={8} className="p-6 text-center text-slate-400">Tidak ada customer</td></tr>
            )}
            {filtered.map((c) => (
              <tr key={c.id} className="border-b hover:bg-slate-50">
                <td className="p-3 font-medium">{c.name}</td>
                <td className="p-3">{c.pic || "-"}</td>
                <td className="p-3">{c.email || "-"}</td>
                <td className="p-3">{c.top} hari</td>
                <td className="p-3">{c._count?.rfqs ?? 0}</td>
                <td className="p-3">{c._count?.invoices ?? 0}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      c.status === "AKTIF" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {c.status === "AKTIF" ? "Aktif" : "Tidak Aktif"}
                  </span>
                </td>
                <td className="p-3">
                  <button onClick={() => openEdit(c)} className="mr-2 text-blue-600 hover:underline">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline">
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[480px] rounded-xl bg-white p-6">
            <h2 className="mb-4 text-lg font-bold">{editingId ? "Edit Customer" : "Tambah Customer"}</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nama Customer" value={form.name} onChange={(v) => setForm({ ...form, name: v })} full />
              <Field label="PIC" value={form.pic} onChange={(v) => setForm({ ...form, pic: v })} />
              <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
              <Field label="No. Telepon" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              <Field label="NPWP" value={form.npwp} onChange={(v) => setForm({ ...form, npwp: v })} />
              <Field label="Alamat" value={form.address} onChange={(v) => setForm({ ...form, address: v })} full />
              <Field
                label="TOP (hari)"
                value={String(form.top)}
                onChange={(v) => setForm({ ...form, top: Number(v) || 0 })}
              />
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="AKTIF">Aktif</option>
                  <option value="TIDAK_AKTIF">Tidak Aktif</option>
                </select>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="rounded-lg border px-4 py-2 text-sm">
                Batal
              </button>
              <button onClick={handleSave} className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-navy">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  full,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="mb-1 block text-xs font-semibold text-slate-500">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />
    </div>
  );
}
