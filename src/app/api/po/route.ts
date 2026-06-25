// src/app/api/po/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addDays } from "@/lib/utils";
import { z } from "zod";

const poSchema = z.object({
  no: z.string().min(1),
  date: z.string(),
  quotationId: z.string().optional(),
  customerId: z.string().min(1),
  value: z.number(),
  top: z.number().int().optional(),
  status: z.enum(["OPEN", "PROSES", "SELESAI"]).default("OPEN"),
});

export async function GET() {
  const pos = await prisma.purchaseOrder.findMany({
    include: { customer: true, quotation: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(pos);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = poSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;

  const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
  const top = data.top ?? customer?.top ?? 30;
  const date = new Date(data.date);

  const po = await prisma.purchaseOrder.create({
    data: {
      no: data.no,
      date,
      quotationId: data.quotationId,
      customerId: data.customerId,
      value: data.value,
      top,
      dueDate: addDays(date, top),
      status: data.status,
    },
  });

  // If linked to a quotation, mark it as DISETUJUI
  if (data.quotationId) {
    await prisma.quotation.update({ where: { id: data.quotationId }, data: { status: "DISETUJUI" } });
  }

  return NextResponse.json(po, { status: 201 });
}
