// src/app/api/quotation/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const itemSchema = z.object({
  productId: z.string().optional(),
  description: z.string().optional(),
  qty: z.number(),
  uom: z.string().optional(),
  price: z.number(),
  amount: z.number(),
});

const quotationSchema = z.object({
  no: z.string().min(1),
  date: z.string(),
  rfqId: z.string().optional(),
  customerId: z.string().min(1),
  validUntil: z.string().optional(),
  status: z.enum(["DRAFT", "TERKIRIM", "DISETUJUI", "DITOLAK"]).default("DRAFT"),
  items: z.array(itemSchema).default([]),
});

export async function GET() {
  const quotations = await prisma.quotation.findMany({
    include: { customer: true, items: true, rfq: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(quotations);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = quotationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { items, ...data } = parsed.data;

  const quotation = await prisma.quotation.create({
    data: {
      ...data,
      date: new Date(data.date),
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
      items: { create: items },
    },
    include: { items: true },
  });

  // If linked to an RFQ, mark it as QUOTED
  if (data.rfqId) {
    await prisma.rfq.update({ where: { id: data.rfqId }, data: { status: "QUOTED" } });
  }

  return NextResponse.json(quotation, { status: 201 });
}
