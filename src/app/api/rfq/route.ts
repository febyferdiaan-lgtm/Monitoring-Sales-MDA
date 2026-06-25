// src/app/api/rfq/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const rfqSchema = z.object({
  no: z.string().min(1),
  date: z.string(),
  customerId: z.string().min(1),
  description: z.string().optional(),
  estimatedValue: z.number().optional(),
  status: z.enum(["OPEN", "QUOTED", "WON", "LOST"]).default("OPEN"),
});

export async function GET() {
  const rfqs = await prisma.rfq.findMany({
    include: { customer: true, quotations: { select: { id: true, no: true } } },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(rfqs);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = rfqSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const rfq = await prisma.rfq.create({
    data: { ...parsed.data, date: new Date(parsed.data.date) },
  });
  return NextResponse.json(rfq, { status: 201 });
}
