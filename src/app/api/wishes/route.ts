// src/app/api/wishes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { spaceId, title, description, emoji, category } = await req.json();
  if (!spaceId || !title || !category) {
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
  }

  // Verify membership
  const membership = await prisma.spaceMember.findUnique({
    where: { spaceId_userId: { spaceId, userId: session.user!.id } },
  });
  if (!membership) return NextResponse.json({ error: "คุณไม่ใช่สมาชิกของ Space นี้" }, { status: 403 });

  const wish = await prisma.wish.create({
    data: { spaceId, userId: session.user!.id, title, description, emoji, category },
    include: { user: { select: { id: true, displayName: true, emoji: true } } },
  });

  return NextResponse.json({ wish }, { status: 201 });
}
