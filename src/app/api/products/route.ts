import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { partNumber: "asc" } });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.partNumber) return NextResponse.json({ error: "partNumber wajib diisi" }, { status: 400 });
  const product = await prisma.product.upsert({
    where: { partNumber: body.partNumber },
    update: {},
    create: { partNumber: body.partNumber, description: body.description || null, uom: body.uom || null },
  });
  return NextResponse.json(product, { status: 201 });
}