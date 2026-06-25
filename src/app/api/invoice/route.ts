// src/app/api/invoice/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addDays } from "@/lib/utils";
import { z } from "zod";

const itemSchema = z.object({
  productId: z.string().optional(),
  description: z.string().optional(),
  qty: z.number(),
  uom: z.string().optional(),
  dpp: z.number(),
  ppn: z.number().default(0),
  amount: z.number(),
});

const invoiceSchema = z.object({
  no: z.string().min(1),
  date: z.string(),
  poId: z.string().optional(),
  deliveryOrderId: z.string().optional(),
  customerId: z.string().min(1),
  value: z.number(),
  top: z.number().int().optional(),
  items: z.array(itemSchema).default([]),
});

export async function GET() {
  const invoices = await prisma.invoice.findMany({
    include: { customer: true, items: true, payments: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(invoices);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = invoiceSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { items, ...data } = parsed.data;

  const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
  const top = data.top ?? customer?.top ?? 30;
  const date = new Date(data.date);

  const invoice = await prisma.invoice.create({
    data: {
      no: data.no,
      date,
      poId: data.poId,
      deliveryOrderId: data.deliveryOrderId,
      customerId: data.customerId,
      value: data.value,
      top,
      dueDate: addDays(date, top), // Tanggal Jatuh Tempo = Tanggal Invoice + TOP
      status: "BELUM_DIBAYAR",
      items: { create: items },
    },
    include: { items: true },
  });

  // If linked to a PO, mark it as SELESAI
  if (data.poId) {
    await prisma.purchaseOrder.update({ where: { id: data.poId }, data: { status: "SELESAI" } });
  }

  return NextResponse.json(invoice, { status: 201 });
}
