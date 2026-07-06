// src/app/api/spaces/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateCode(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const SPACE_EMOJIS = ["💑", "👫", "💕", "🫂", "✨", "🎉", "🔥", "🌙"];

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const spaces = await prisma.space.findMany({
    where: { members: { some: { userId: session.user.id } } },
    include: {
      members: { include: { user: { select: { id: true, displayName: true, emoji: true } } } },
      _count: { select: { wishes: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ spaces });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, type } = await req.json();
  if (!name || !type) return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });

  let inviteCode = generateCode(6);
  // Ensure unique invite code
  let existing = await prisma.space.findUnique({ where: { inviteCode } });
  while (existing) {
    inviteCode = generateCode(6);
    existing = await prisma.space.findUnique({ where: { inviteCode } });
  }

  const emoji = SPACE_EMOJIS[Math.floor(Math.random() * SPACE_EMOJIS.length)];

  const space = await prisma.space.create({
    data: {
      name,
      type,
      emoji,
      inviteCode,
      ownerId: session.user.id,
      members: { create: { userId: session.user.id } },
    },
    include: {
      members: { include: { user: { select: { id: true, displayName: true, emoji: true } } } },
    },
  });

  return NextResponse.json({ space }, { status: 201 });
}
