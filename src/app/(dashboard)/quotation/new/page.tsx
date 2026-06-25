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
          amount: