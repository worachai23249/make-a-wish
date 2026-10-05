// src/app/api/spaces/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
    name: z.string().min(1).max(80),
    type: z.enum(['1on1', 'group']),
    emoji: z.string().default('💕'),
});

function generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
}

async function uniqueInviteCode(): Promise<string> {
    let code = generateInviteCode();
    let tries = 0;
    while (tries < 10) {
        const exists = await prisma.space.findUnique({ where: { inviteCode: code } });
        if (!exists) return code;
        code = generateInviteCode();
        tries++;
    }
    return code + Date.now().toString(36).slice(-2);
}

// GET — get user's spaces
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const memberships = await prisma.spaceMember.findMany({
        where: { userId: session.user.id },
        include: {
            space: {
                include: {
                    owner: { select: { id: true, displayName: true, emoji: true, username: true } },
                    members: {
                        include: {
                            user: { select: { id: true, displayName: true, emoji: true, username: true } },
                        },
                    },
                    _count: { select: { wishes: true } },
                },
            },
        },
        orderBy: { joinedAt: 'desc' },
    });

    return NextResponse.json(memberships.map(m => m.space));
}

// POST — create space
export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });

    const { name, type, emoji } = parsed.data;
    const inviteCode = await uniqueInviteCode();

    const space = await prisma.space.create({
        data: {
            name,
            type,
            emoji,
            inviteCode,
            ownerId: session.user.id,
            members: {
                create: { userId: session.user.id },
            },
        },
        include: {
            owner: { select: { id: true, displayName: true, emoji: true, username: true } },
            members: {
                include: {
                    user: { select: { id: true, displayName: true, emoji: true, username: true } },
                },
            },
            _count: { select: { wishes: true } },
        },
    });

    return NextResponse.json(space, { status: 201 });
}
