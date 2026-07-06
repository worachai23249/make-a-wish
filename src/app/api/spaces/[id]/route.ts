// src/app/api/spaces/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const space = await prisma.space.findUnique({
    where: { id },
    include: {
      members: { include: { user: { select: { id: true, displayName: true, emoji: true, username: true } } } },
      wishes: {
        include: { user: { select: { id: true, displayName: true, emoji: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!space) return NextResponse.json({ error: "ไม่พบ Space" }, { status: 404 });

  const isMember = space.members.some((m) => m.userId === session.user!.id);
  if (!isMember) return NextResponse.json({ error: "คุณไม่ใช่สมาชิกของ Space นี้" }, { status: 403 });

  return NextResponse.json({ space });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const space = await prisma.space.findUnique({ where: { id } });

  if (!space) return NextResponse.json({ error: "ไม่พบ Space" }, { status: 404 });
  if (space.ownerId !== session.user!.id) return NextResponse.json({ error: "เฉพาะเจ้าของเท่านั้น" }, { status: 403 });

  await prisma.space.delete({ where: { id } });
  return NextResponse.json({ message: "ลบ Space สำเร็จ" });
}
