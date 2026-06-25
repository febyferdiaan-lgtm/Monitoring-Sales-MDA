"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Customer = { id: string; name: string };
type Product = { id: string; partNumber: string; description?: string; uom?: string };
type ItemRow = { productId: string; description: string; qty: string; uom: string; price: string };

const emptyItem: ItemRow = { productId: "", description: "", qty: "1", uom: "", price: "0" };

export default function NewQuotationPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ no: "", date: "", customerId: "", validUntil: "" });
  const [items, setItems] = useState<ItemRow[]>([{ ...emptyItem }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/customers").then((r) => r.json()).then(setCustomers);
    fetch("/api/products").then((r) => r.json()).then(setProducts);
  }, []);

  function updateItem(idx: number, patch: Partial<ItemRow>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, { ...emptyItem }]);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function selectProduct(idx: number, productId: string) {
    const p = products.find((p) => p.id === productId);
    updateItem(idx, {
      productId,
      description: p?.description || "",
      uom: p?.uom || "",
    });
  }

  const total = items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);

  async function handleSubmit() {
    if (!form.no || !form.date || !form.customerId) {
      alert("No. Penawaran, tanggal, dan customer wajib diisi");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      items: items
        .filter((it) => it.qty && it.price)
        .map((it) => ({
          productId: it.productId || undefined,
          description: it.description,
          qty: Number(it.qty),
          uom: it.uom,
          price: Number(it.price),
          amount: (Number(it.qty) || 0) * (Number(it.price) || 0),
        })),
    };
    const res = await fetch("/api/quotation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      alert("Gagal menyimpan penawaran");
      return;
    }
    router.push("/quotation");
  }

  return (
    <div className="p-8">
      <h1 className="mb-1 text-xl font-bold text-navy">Tambah Penawaran (Quotation)</h1>
      <p className="mb-6 text-sm text-slate-500">Buat penawaran baru dengan beberapa item barang</p>

      <div className="mb-6 grid grid-cols-3 gap-4 rounded-lg border bg-white p-5">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">No. Penawaran</label>
          <input
            value={form.no}
            onChange={(e) => setForm({ ...form, no: e.target.value })}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">Tanggal</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
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
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">Masa Berlaku (opsional)</label>
          <input
            type="date"
            value={form.validUntil}
            onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="rounded-lg border bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Daftar Barang</h2>
          <button onClick={addItem} className="rounded-lg border px-3 py-1.5 text-sm">+ Tambah Item</button>
        </div>

        <table className="w-full text-sm">
          <thead className="border-b text-xs uppercase text-slate-500">
            <tr>
              <th className="p-2 text-left">Produk</th>
              <th className="p-2 text-left">Deskripsi</th>
              <th className="p-2 text-left w-20">Qty</th>
              <th className="p-2 text-left w-20">UOM</th>
              <th className="p-2 text-left w-32">Harga</th>
              <th className="p-2 text-left w-32">Subtotal</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={idx} className="border-b">
                <td className="p-2">
                  <select
                    value={it.productId}
                    onChange={(e) => selectProduct(idx, e.target.value)}
                    className="w-full rounded border px-2 py-1 text-sm"
                  >
                    <option value="">- bebas -</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.partNumber}</option>
                    ))}
                  </select>
                </td>
                <td className="p-2">
                  <input
                    value={it.description}
                    onChange={(e) => updateItem(idx, { description: e.target.value })}
                    className="w-full rounded border px-2 py-1 text-sm"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={it.qty}
                    onChange={(e) => updateItem(idx, { qty: e.target.value })}
                    className="w-full rounded border px-2 py-1 text-sm"
                  />
                </td>
                <td className="p-2">
                  <input
                    value={it.uom}
                    onChange={(e) => updateItem(idx, { uom: e.target.value })}
                    className="w-full rounded border px-2 py-1 text-sm"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={it.price}
                    onChange={(e) => updateItem(idx, { price: e.target.value })}
                    className="w-full rounded border px-2 py-1 text-sm"
                  />
                </td>
                <td className="p-2 text-right">
                  Rp {((Number(it.qty) || 0) * (Number(it.price) || 0)).toLocaleString("id-ID")}
                </td>
                <td className="p-2">
                  <button onClick={() => removeItem(idx)} className="text-red-600 text-xs">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end text-base font-bold">
          Total: Rp {total.toLocaleString("id-ID")}
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button onClick={() => router.push("/quotation")} className="rounded-lg border px-4 py-2 text-sm">Batal</button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="rounded-lg bg-gold px-5 py-2 text-sm font-semibold text-navy disabled:opacity-50"
        >
          {saving ? "Menyimpan..." : "Simpan Penawaran"}
        </button>
      </div>
    </div>
  );
}