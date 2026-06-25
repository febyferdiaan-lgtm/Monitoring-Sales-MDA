// src/app/api/payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const paymentSchema = z.object({
  invoiceId: z.string().min(1),
  date: z.string(),
  amount: z.number().positive(),
  method: z.string().optional(),
  refNumber: z.string().optional(),
  proofUrl: z.string().optional(),
});

export async function GET() {
  const payments = await prisma.payment.findMany({
    include: { invoice: { include: { customer: true } } },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(payments);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = paymentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;

  const invoice = await prisma.invoice.findUnique({
    where: { id: data.invoiceId },
    include: { payments: true },
  });
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  const payment = await prisma.payment.create({
    data: { ...data, date: new Date(data.date) },
  });

  // Recalculate invoice status — mendukung pembayaran parsial
  const totalPaid =
    invoice.payments.reduce((s, p) => s + Number(p.amount), 0) + Number(data.amount);
  const remaining = Number(invoice.value) - totalPaid;

  let status: "LUNAS" | "DIBAYAR_SEBAGIAN" | "BELUM_DIBAYAR" | "OVERDUE";
  if (remaining <= 0) status = "LUNAS";
  else if (totalPaid > 0) status = "DIBAYAR_SEBAGIAN";
  else status = "BELUM_DIBAYAR";

  await prisma.invoice.update({ where: { id: invoice.id }, data: { status } });

  return NextResponse.json({ payment, invoiceStatus: status, remaining: Math.max(remaining, 0) }, { status: 201 });
}
