// src/app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "MDA Sales Monitoring",
  description: "ERP Sales Monitoring untuk PT MDA Amanah Sejahtera",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
