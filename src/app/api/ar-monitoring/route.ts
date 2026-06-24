// src/app/api/ar-monitoring/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dayDiff, arStatusColor } from "@/lib/utils";

export async function GET() {
  const invoices = await prisma.invoice.findMany({
    include: {
      customer: true,
      payments: true,
    },
    orderBy: { date: "desc" },
  });

  const today = new Date();

  const result = invoices.map((inv) => {
    const paid = inv.payments.reduce((s, p) => s + Number(p.amount), 0);
    const remaining = Math.max(Number(inv.value) - paid, 0);
    const aging = inv.dueDate ? dayDiff(today, inv.dueDate) : null;
    let status: string;
    if (remaining <= 0 && paid > 0) status = "LUNAS";
    else if (paid > 0) status = "DIBAYAR_SEBAGIAN";
    else if (aging !== null && aging > 0) status = "OVERDUE";
    else status = "BELUM_DIBAYAR";

    return {
      invoiceNo: inv.no,
      customer: inv.customer.name,
      date: inv.date,
      value: Number(inv.value),
      paid,
      remaining,
      dueDate: inv.dueDate,
      aging,
      status,
      colorIndicator: arStatusColor(remaining, inv.dueDate, today),
    };
  });

  return NextResponse.json(result);
}
