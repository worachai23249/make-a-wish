// src/app/api/cron/keepalive/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Perform a lightweight query to keep Neon database compute active
    await prisma.user.findFirst({ select: { id: true } });
    return NextResponse.json({ ok: true, message: "Neon instance kept active" });
  } catch (error: any) {
    console.error("Keep-alive error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
