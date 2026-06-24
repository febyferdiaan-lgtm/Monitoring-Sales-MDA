# MDA Sales Monitoring — ERP

Versi full-stack dari prototipe Sales Monitoring: Next.js + PostgreSQL (Prisma) + NextAuth.

Status: **scaffold awal** — fondasi project, schema database, dan modul pertama (Dashboard, Login, Customer API, AR Monitoring API). Modul sisanya menyusul sesuai roadmap di `PROJECT_PLAN.md`.

## Cara Menjalankan di Lokal

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables, lalu isi DATABASE_URL dari Supabase/Neon
cp .env.example .env

# 3. Push schema ke database
npm run db:push

# 4. (Opsional) Migrasi data dari Excel lama
npm run prisma:seed -- /path/to/Monitoring_Sales_FEBY.xlsx

# 5. Jalankan dev server
npm run dev
```

Buka http://localhost:3000

## Cara Push Project Ini ke Repo GitHub Anda

Repo Anda: `https://github.com/febyferdiaan-lgtm/Monitoring-Sales-MDA.git`

```bash
# Masuk ke folder project ini (setelah di-extract dari ZIP)
cd mda-sales-monitoring

# Inisialisasi git
git init
git branch -M main
git remote add origin https://github.com/febyferdiaan-lgtm/Monitoring-Sales-MDA.git

# Commit pertama
git add .
git commit -m "chore: initial project scaffold (Next.js + Prisma + Auth)"

# Push ke GitHub (akan minta login GitHub Anda)
git push -u origin main
```

Setelah ini, hubungkan repo ke **Vercel** (Import Project dari GitHub) supaya setiap push ke `main` otomatis deploy. Jangan lupa isi Environment Variables di Vercel (sama seperti isi `.env`).

## Struktur Project

Lihat detail lengkap struktur folder & roadmap pengembangan di **`PROJECT_PLAN.md`**.

## Modul yang Sudah Ada di Scaffold Ini

- [x] Setup Next.js + Tailwind + Prisma
- [x] Schema database lengkap (Customer, RFQ, Quotation, PO, DeliveryOrder, Invoice, Payment, AuditLog)
- [x] Script migrasi data dari Excel lama (`prisma/seed.ts`)
- [x] Auth dasar (NextAuth + role di JWT)
- [x] Halaman login
- [x] Dashboard awal (KPI dari database asli)
- [x] API: Customers (GET/POST), AR Monitoring (grouped per invoice)
- [x] CI dasar di GitHub Actions

## Belum Dikerjakan (Tahap Selanjutnya)

- [ ] Master Data UI lengkap (CRUD Customer/Produk/Sales)
- [ ] Modul RFQ → Quotation → PO (UI + API lengkap)
- [ ] Delivery Order + Invoice (due date otomatis)
- [ ] Payment confirmation + auto update status invoice
- [ ] Dashboard lengkap (grafik, top customer)
- [ ] Cetak dokumen (Quotation/SJ/Invoice/Kwitansi → PDF)
- [ ] Laporan + export Excel/PDF
- [ ] Audit trail middleware
- [ ] Notifikasi email jatuh tempo
- [ ] Role-based route protection (middleware.ts)
- [ ] Deployment production ke Vercel + Supabase
