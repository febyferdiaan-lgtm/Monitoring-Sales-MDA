// src/app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold text-navy">MDA Sales Monitoring</h1>
      <p className="text-slate-500">Project scaffold — modul dashboard & login menyusul.</p>
      <Link href="/login" className="rounded-lg bg-gold px-4 py-2 font-semibold text-navy">
        Masuk
      </Link>
    </main>
  );
}
