# DEPLOYMENT.md — Panduan Deploy ke Supabase + Vercel

Panduan ini mengasumsikan Anda sudah push project ke GitHub (`Monitoring-Sales-MDA`). Ikuti urutan ini — jangan dibalik, karena Vercel butuh `DATABASE_URL` dari Supabase saat build.

---

## BAGIAN 1 — Setup Database di Supabase

1. Buka [supabase.com](https://supabase.com) → Sign up / Login (bisa pakai akun GitHub).
2. Klik **New Project**.
   - **Name**: `mda-sales-monitoring`
   - **Database Password**: buat password kuat, **simpan di tempat aman** (Anda akan butuh ini untuk connection string).
   - **Region**: pilih `Southeast Asia (Singapore)` — paling dekat ke Indonesia, latency terbaik.
3. Tunggu ~2 menit sampai project selesai dibuat.
4. Masuk ke **Project Settings → Database**.
5. Cari bagian **Connection string** → pilih tab **URI**.
6. Copy connection string-nya, formatnya seperti:
   ```
   postgresql://postgres.xxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```
7. Ganti `[YOUR-PASSWORD]` dengan password yang Anda buat di langkah 2. **Ini adalah nilai `DATABASE_URL` Anda.**

   > Gunakan connection string yang **"Transaction" pooler mode** (port 6543) untuk environment serverless seperti Vercel — bukan yang port 5432 biasa, karena Vercel function bersifat short-lived dan butuh connection pooling.

8. (Opsional, untuk upload file PDF/bukti transfer nanti) Masuk ke **Storage** di sidebar Supabase → buat bucket baru, misal `documents`, set ke **public** atau **private** sesuai kebutuhan.
9. Catat juga dari **Project Settings → API**:
   - `Project URL` → ini `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → ini `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → ini `SUPABASE_SERVICE_ROLE_KEY` (rahasia, jangan expose ke frontend)

---

## BAGIAN 2 — Jalankan Migrasi Database (dari komputer Anda)

```bash
# Masuk ke folder project
cd mda-sales-monitoring

# Install dependencies
npm install

# Buat file .env, isi DATABASE_URL dengan connection string dari Bagian 1
cp .env.example .env
# edit .env dengan text editor, isi DATABASE_URL=...

# Push schema ke Supabase (membuat semua tabel)
npm run db:push

# Buat user admin pertama
npm run prisma:seed-users

# (Opsional) migrasi data dari Excel lama
npm run prisma:seed -- /path/to/Monitoring_Sales_FEBY.xlsx
```

Cek di Supabase **Table Editor** — pastikan tabel `User`, `Customer`, `Rfq`, dll sudah muncul.

---

## BAGIAN 3 — Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com) → Sign up / Login dengan akun **GitHub yang sama** (`febyferdiaan-lgtm`).
2. Klik **Add New → Project**.
3. Pilih repo **`Monitoring-Sales-MDA`** dari daftar → klik **Import**.
4. Di halaman konfigurasi sebelum deploy, buka bagian **Environment Variables**, isi semua ini (samakan dengan isi `.env` Anda):

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | connection string dari Supabase (Bagian 1) |
   | `NEXTAUTH_SECRET` | generate dengan `openssl rand -base64 32` di terminal |
   | `NEXTAUTH_URL` | isi sementara `https://placeholder.vercel.app` — **update lagi setelah deploy pertama selesai** dengan URL asli |
   | `NEXT_PUBLIC_SUPABASE_URL` | dari Bagian 1 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | dari Bagian 1 |
   | `SUPABASE_SERVICE_ROLE_KEY` | dari Bagian 1 |

5. Klik **Deploy**. Tunggu proses build (~2-3 menit).
6. Setelah selesai, Vercel akan beri URL seperti `https://monitoring-sales-mda.vercel.app`.
7. **Penting**: kembali ke **Project Settings → Environment Variables** di Vercel, update `NEXTAUTH_URL` dengan URL asli ini, lalu **Redeploy** (Vercel → Deployments → klik (...) pada deployment terakhir → Redeploy).

---

## BAGIAN 4 — Verifikasi

1. Buka URL Vercel Anda → harus muncul halaman landing.
2. Klik **Masuk** → login dengan `admin@mda.co.id` / `admin123`.
3. **Segera ganti password** ini (saat ini belum ada halaman ganti password — bisa lewat Supabase Table Editor langsung edit `passwordHash`, atau minta saya buatkan halaman Change Password sebagai modul tambahan).
4. Cek halaman Dashboard — harus menampilkan data asli dari Supabase (bukan dummy).

---

## BAGIAN 5 — Auto-Deploy Selanjutnya

Setelah setup awal ini selesai, workflow Anda ke depan:

```bash
git add .
git commit -m "feat: nama perubahan"
git push
```

Setiap push ke `main` akan **otomatis trigger deploy baru di Vercel** — tidak perlu repeat langkah manual di atas, kecuali ada perubahan schema database (`prisma/schema.prisma`), yang perlu `npm run db:push` ulang dari lokal Anda (atau bisa kita buat GitHub Action untuk otomasi ini juga ke depannya).

---

## Troubleshooting Umum

| Gejala | Kemungkinan Sebab |
|---|---|
| Build gagal di Vercel, error "Can't reach database" | `DATABASE_URL` salah, atau pakai port 5432 instead of pooler port 6543 |
| Login gagal terus | `NEXTAUTH_SECRET` belum diisi, atau belum jalankan `seed-users` |
| Redirect loop ke /login | `NEXTAUTH_URL` belum diupdate ke URL Vercel asli setelah deploy pertama |
| Data dashboard kosong | Belum jalankan migrasi data Excel (`prisma:seed`), atau memang belum ada data — itu normal untuk instalasi baru |
