// src/app/(dashboard)/layout.tsx
import Link from "next/link";

const NAV = [
  { sec: "Utama", items: [{ href: "/dashboard", label: "Dashboard" }] },
  {
    sec: "Master Data",
    items: [
      { href: "/master/customers", label: "Data Customer" },
      { href: "/master/products", label: "Data Barang" },
    ],
  },
  {
    sec: "Proses Penjualan",
    items: [
      { href: "/rfq", label: "RFQ" },
      { href: "/quotation", label: "Penawaran" },
      { href: "/po", label: "Purchase Order" },
      { href: "/delivery", label: "Pengiriman" },
      { href: "/invoice", label: "Invoice" },
      { href: "/payment", label: "Konfirmasi Pembayaran" },
    ],
  },
  { sec: "Monitoring", items: [{ href: "/ar-monitoring", label: "AR Monitoring" }] },
  { sec: "Laporan", items: [{ href: "/reports", label: "Laporan" }] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 flex-shrink-0 bg-navy text-white">
        <div className="border-b border-white/10 px-5 py-5">
          <div className="font-bold">MDA Sales</div>
          <div className="text-[10px] uppercase tracking-wide text-slate-400">Monitoring ERP</div>
        </div>
        <nav className="p-3">
          {NAV.map((sec) => (
            <div key={sec.sec} className="mb-4">
              <div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {sec.sec}
              </div>
              {sec.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-slate-50">{children}</main>
    </div>
  );
}
