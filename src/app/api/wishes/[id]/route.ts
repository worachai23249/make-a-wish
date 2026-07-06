// src/app/api/wishes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const wish = await prisma.wish.findUnique({ where: { id } });

  if (!wish) return NextResponse.json({ error: "ไม่พบรายการนี้" }, { status: 404 });
  if (wish.userId !== session.user!.id) return NextResponse.json({ error: "คุณไม่ใช่เจ้าของ" }, { status: 403 });

  await prisma.wish.delete({ where: { id } });
  return NextResponse.json({ message: "ลบสำเร็จ" });
}
