// src/app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const EMOJIS = ["🌸", "✨", "🌙", "🦋", "🌈", "💫", "🎯", "🔮"];

export async function POST(req: NextRequest) {
  try {
    const { username, displayName, email, password } = await req.json();

    if (!username || !displayName || !email || !password) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
    }

    // Check uniqueness
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      if (existing.email === email) return NextResponse.json({ error: "อีเมลนี้ถูกใช้งานแล้ว" }, { status: 400 });
      return NextResponse.json({ error: "Username นี้ถูกใช้งานแล้ว" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

    const user = await prisma.user.create({
      data: { username, displayName, email, passwordHash, emoji, role: "user" },
      select: { id: true, username: true, displayName: true, email: true, emoji: true, role: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่" }, { status: 500 });
  }
}
