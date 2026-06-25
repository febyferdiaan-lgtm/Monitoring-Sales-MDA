// prisma/seed-users.ts
// Membuat user awal supaya bisa login pertama kali.
// Jalankan: npx tsx prisma/seed-users.ts

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@mda.co.id" },
    update: {},
    create: {
      name: "Administrator",
      email: "admin@mda.co.id",
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Admin user created: admin@mda.co.id / admin123");
  console.log("PENTING: segera ganti password ini setelah login pertama kali.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
