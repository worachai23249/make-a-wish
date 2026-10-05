// src/app/api/register/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const schema = z.object({
    username: z.string().min(2).max(30).regex(/^[a-z0-9_]+$/),
    displayName: z.string().min(1).max(60),
    email: z.string().email(),
    password: z.string().min(6).max(100),
    emoji: z.string().default('🌸'),
});

function generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = schema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
        }

        const { username, displayName, email, password, emoji } = parsed.data;

        // Check duplicates
        const existing = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] },
        });

        if (existing) {
            if (existing.email === email) {
                return NextResponse.json({ error: 'อีเมลนี้ถูกใช้แล้ว' }, { status: 409 });
            }
            return NextResponse.json({ error: 'ชื่อผู้ใช้นี้ถูกใช้แล้ว' }, { status: 409 });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: { username, displayName, email, passwordHash, emoji },
        });

        return NextResponse.json({ id: user.id, username: user.username }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
    }
}
