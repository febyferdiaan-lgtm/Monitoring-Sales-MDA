// src/app/api/delivery/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const itemSchema = z.object({
  productId: z.string().optional(),
  description: z.string().optional(),
  qty: z.number(),
  uom: z.string().optional(),
});

const deliverySchema = z.object({
  no: z.string().min(1),
  date: z.string(),
  poId: z.string().optional(),
  customerId: z.string().min(1),
  status: z.enum(["BELUM_DIKIRIM", "TERKIRIM", "DITERIMA_CUSTOMER"]).default("BELUM_DIKIRIM"),
  items: z.array(itemSchema).default([]),
});

export async function GET() {
  const deliveries = await prisma.deliveryOrder.findMany({
    include: { customer: true, items: true, po: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(deliveries);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = deliverySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { items, ...data } = parsed.data;

  const delivery = await prisma.deliveryOrder.create({
    data: { ...data, date: new Date(data.date), items: { create: items } },
    include: { items: true },
  });
  return NextResponse.json(delivery, { status: 201 });
}
