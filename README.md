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

## Deploy ke Production (Supabase + Vercel)

Panduan lengkap step-by-step ada di **[`DEPLOYMENT.md`](./DEPLOYMENT.md)** — mulai dari setup Supabase, migrasi database, sampai konfigurasi environment variables di Vercel.

## Cara Login Pertama Kali

```bash
npm run prisma:seed-users
```

Akan membuat user: `admin@mda.co.id` / `admin123` — **segera ganti password setelah login**.

## Modul yang Sudah Ada di Scaffold Ini

- [x] Setup Next.js + Tailwind + Prisma
- [x] Schema database lengkap (Customer, RFQ, Quotation, PO, DeliveryOrder, Invoice, Payment, AuditLog)
- [x] Script migrasi data dari Excel lama (`prisma/seed.ts`)
- [x] Seed user admin awal (`prisma/seed-users.ts`)
- [x] Auth dasar (NextAuth + role di JWT) + halaman login
- [x] Middleware proteksi route berbasis role (`src/middleware.ts`)
- [x] Sidebar layout terpadu untuk semua halaman dashboard
- [x] Dashboard awal (KPI dari database asli)
- [x] Master Data Customer — **UI CRUD lengkap** (tambah/edit/hapus/cari)
- [x] Halaman list: RFQ (+form tambah), Quotation, PO, Delivery, Invoice
- [x] Halaman Payment — form catat pembayaran (mendukung parsial, auto update status invoice)
- [x] Halaman AR Monitoring — grouped per invoice, warna indikator hijau/kuning/merah, filter
- [x] API: Customers, RFQ, Quotation (+items), PO (auto due-date dari TOP customer), Invoice (auto due-date), Payment (auto update status invoice + partial payment), Delivery Order, AR Monitoring (grouped per invoice)
- [x] CI dasar di GitHub Actions
- [x] Panduan deploy lengkap ke Supabase + Vercel (`DEPLOYMENT.md`)

## Belum Dikerjakan (Tahap Selanjutnya)

- [ ] Form tambah multi-item untuk Quotation/PO/Delivery/Invoice (saat ini hanya via API langsung)
- [ ] Master Data Produk & Sales/PIC (UI)
- [ ] Dashboard lengkap (grafik, top customer)
- [ ] Cetak dokumen (Quotation/SJ/Invoice/Kwitansi → PDF)
- [ ] Laporan + export Excel/PDF
- [ ] Audit trail middleware (model sudah ada di schema)
- [ ] Notifikasi email jatuh tempo
- [ ] Halaman ganti password user
