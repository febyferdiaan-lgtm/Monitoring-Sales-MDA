// src/lib/utils.ts

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function dayDiff(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

export function fmtCurrency(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return "-";
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

export function arStatusColor(remaining: number, dueDate: Date | null, today = new Date()) {
  if (remaining <= 0) return "green";
  if (!dueDate) return "gray";
  const days = dayDiff(today, dueDate);
  if (days > 0) return "red"; // overdue
  if (days >= -7) return "amber"; // due within 7 days
  return "green";
}

export function terbilang(n: number): string {
  n = Math.round(n);
  const satuan = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
  function t(n: number): string {
    if (n < 12) return satuan[n];
    if (n < 20) return t(n - 10) + " Belas";
    if (n < 100) return t(Math.floor(n / 10)) + " Puluh" + (n % 10 ? " " + t(n % 10) : "");
    if (n < 200) return "Seratus" + (n - 100 ? " " + t(n - 100) : "");
    if (n < 1000) return t(Math.floor(n / 100)) + " Ratus" + (n % 100 ? " " + t(n % 100) : "");
    if (n < 2000) return "Seribu" + (n - 1000 ? " " + t(n - 1000) : "");
    if (n < 1000000) return t(Math.floor(n / 1000)) + " Ribu" + (n % 1000 ? " " + t(n % 1000) : "");
    if (n < 1000000000) return t(Math.floor(n / 1000000)) + " Juta" + (n % 1000000 ? " " + t(n % 1000000) : "");
    return t(Math.floor(n / 1000000000)) + " Milyar" + (n % 1000000000 ? " " + t(n % 1000000000) : "");
  }
  if (n === 0) return "Nol Rupiah";
  return (t(n) + " Rupiah").replace(/\s+/g, " ").trim();
}
