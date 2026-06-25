// src/components/StatusPill.tsx
const COLORS: Record<string, string> = {
  OPEN: "bg-slate-100 text-slate-600",
  QUOTED: "bg-amber-100 text-amber-700",
  WON: "bg-green-100 text-green-700",
  LOST: "bg-red-100 text-red-700",
  DRAFT: "bg-slate-100 text-slate-600",
  TERKIRIM: "bg-amber-100 text-amber-700",
  DISETUJUI: "bg-green-100 text-green-700",
  DITOLAK: "bg-red-100 text-red-700",
  PROSES: "bg-amber-100 text-amber-700",
  SELESAI: "bg-green-100 text-green-700",
  BELUM_DIKIRIM: "bg-slate-100 text-slate-600",
  DITERIMA_CUSTOMER: "bg-green-100 text-green-700",
  BELUM_DIBAYAR: "bg-slate-100 text-slate-600",
  DIBAYAR_SEBAGIAN: "bg-amber-100 text-amber-700",
  LUNAS: "bg-green-100 text-green-700",
  OVERDUE: "bg-red-100 text-red-700",
};

const LABELS: Record<string, string> = {
  BELUM_DIKIRIM: "Belum Dikirim",
  DITERIMA_CUSTOMER: "Diterima Customer",
  BELUM_DIBAYAR: "Belum Dibayar",
  DIBAYAR_SEBAGIAN: "Dibayar Sebagian",
};

export default function StatusPill({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${COLORS[status] || "bg-slate-100 text-slate-600"}`}>
      {LABELS[status] || status}
    </span>
  );
}
