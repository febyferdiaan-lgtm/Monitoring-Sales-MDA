// src/app/(dashboard)/ar-monitoring/page.tsx
"use client";
import { useEffect, useState } from "react";

type ARRow = {
  invoiceNo: string; customer: string; date: string; value: number; paid: number;
  remaining: number; dueDate: string | null; aging: number | null; status: string; colorIndicator: string;
};

const COLOR_MAP: Record<string, string> = {
  green: "bg-green-100 text-green-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
  gray: "bg-slate-100 text-slate-500",
};

export default function ARMonitoringPage() {
  const [rows, setRows] = useState<ARRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ar-monitoring").then((r) => r.json()).then((d) => { setRows(d); setLoading(false); });
  }, []);

  const filtered = rows.filter(
    (r) =>
      (r.customer.toLowerCase().includes(search.toLowerCase()) || r.invoiceNo.toLowerCase().includes(search.toLowerCase())) &&
      (!statusFilter || r.status === statusFilter)
  );

  const overdueCount = rows.filter((r) => r.status === "OVERDUE").length;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy">Account Receivable Monitoring</h1>
        <p className="text-sm text-slate-500">Pantau umur piutang & status jatuh tempo (satu baris per invoice)</p>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-4">
        <Kpi label="Total Invoice" value={rows.length} />
        <Kpi label="Belum Jatuh Tempo" value={rows.filter((r) => r.aging !== null && r.aging < 0 && r.remaining > 0).length} />
        <Kpi label="Jatuh Tempo ≤7 hari" value={rows.filter((r) => r.aging !== null && r.aging >= -7 && r.aging <= 0 && r.remaining > 0).length} />
        <Kpi label="Overdue" value={overdueCount} danger />
      </div>

      <div className="mb-4 flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-green-500" /> Belum jatuh tempo</span>
        <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-amber-500" /> Jatuh tempo ≤ 7 hari</span>
        <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-red-500" /> Sudah melewati jatuh tempo</span>
      </div>

      <div className="mb-4 flex gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari customer / no invoice..."
          className="flex-1 rounded-lg border px-3 py-2 text-sm"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
          <option value="">Semua Status</option>
          <option value="BELUM_DIBAYAR">Belum Dibayar</option>
          <option value="DIBAYAR_SEBAGIAN">Dibayar Sebagian</option>
          <option value="LUNAS">Lunas</option>
          <option value="OVERDUE">Overdue</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">No. Invoice</th>
              <th className="p-3 text-left">Tgl Invoice</th>
              <th className="p-3 text-left">Nilai Invoice</th>
              <th className="p-3 text-left">Sudah Dibayar</th>
              <th className="p-3 text-left">Sisa Piutang</th>
              <th className="p-3 text-left">Jatuh Tempo</th>
              <th className="p-3 text-left">Umur (hari)</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={9} className="p-6 text-center text-slate-400">Memuat...</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={9} className="p-6 text-center text-slate-400">Tidak ada data</td></tr>}
            {filtered.map((r) => (
              <tr key={r.invoiceNo} className="border-b hover:bg-slate-50">
                <td className="p-3">{r.customer}</td>
                <td className="p-3 font-medium">{r.invoiceNo}</td>
                <td className="p-3">{new Date(r.date).toLocaleDateString("id-ID")}</td>
                <td className="p-3">Rp {r.value.toLocaleString("id-ID")}</td>
                <td className="p-3">Rp {r.paid.toLocaleString("id-ID")}</td>
                <td className="p-3">Rp {r.remaining.toLocaleString("id-ID")}</td>
                <td className="p-3">{r.dueDate ? new Date(r.dueDate).toLocaleDateString("id-ID") : "-"}</td>
                <td className="p-3">{r.aging ?? "-"}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${COLOR_MAP[r.colorIndicator]}`}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Kpi({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  return (
    <div className="rounded-lg border-l-4 border-gold bg-white p-4 shadow-sm">
      <div className="text-xs uppercase text-slate-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${danger ? "text-red-600" : ""}`}>{value}</div>
    </div>
  );
}
