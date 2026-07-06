// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const EMOJIS = ["🌸", "✨", "🌙", "🦋", "🌈", "💫", "🎯", "🔮"];

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || (session.user as any).role !== "admin") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    where: { role: "user" },
    select: {
      id: true, username: true, displayName: true, email: true,
      emoji: true, role: true, createdAt: true,
      _count: { select: { memberships: true, wishes: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { username, displayName, email, password } = await req.json();
  if (!username || !displayName || !email || !password) {
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
  }

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
  if (existing) {
    return NextResponse.json({
      error: existing.email === email ? "อีเมลนี้ถูกใช้งานแล้ว" : "Username นี้ถูกใช้งานแล้ว"
    }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

  const user = await prisma.user.create({
    data: { username, displayName, email, passwordHash, emoji, role: "user" },
    select: { id: true, username: true, displayName: true, email: true, emoji: true, role: true, createdAt: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
