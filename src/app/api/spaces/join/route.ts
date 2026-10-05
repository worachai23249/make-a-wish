// src/app/api/spaces/join/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { inviteCode } = await req.json();
    if (!inviteCode || typeof inviteCode !== 'string') {
        return NextResponse.json({ error: 'ต้องระบุรหัสเชิญ' }, { status: 400 });
    }

    const space = await prisma.space.findUnique({
        where: { inviteCode: inviteCode.trim().toUpperCase() },
    });
    if (!space) return NextResponse.json({ error: 'ไม่พบห้องที่ตรงกับรหัสนี้' }, { status: 404 });

    // Check if already member
    const existing = await prisma.spaceMember.findUnique({
        where: { spaceId_userId: { spaceId: space.id, userId: session.user.id } },
    });
    if (existing) return NextResponse.json({ error: 'คุณเป็นสมาชิกของห้องนี้อยู่แล้ว', spaceId: space.id }, { status: 409 });

    // Check 1on1 limit
    if (space.type === '1on1') {
        const memberCount = await prisma.spaceMember.count({ where: { spaceId: space.id } });
        if (memberCount >= 2) {
            return NextResponse.json({ error: 'ห้อง 1-on-1 มีสมาชิกเต็มแล้ว' }, { status: 403 });
        }
    }

    await prisma.spaceMember.create({
        data: { spaceId: space.id, userId: session.user.id },
    });

    return NextResponse.json({ ok: true, spaceId: space.id, spaceName: space.name });
}
