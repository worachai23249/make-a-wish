// src/app/api/spaces/[id]/wishes/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(500).optional(),
    emoji: z.string().default('⭐'),
    category: z.enum(['item', 'food', 'place']),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: spaceId } = await params;

    // Check membership
    const isMember = await prisma.spaceMember.findUnique({
        where: { spaceId_userId: { spaceId, userId: session.user.id } },
    });
    if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });

    const wish = await prisma.wish.create({
        data: {
            ...parsed.data,
            spaceId,
            userId: session.user.id,
        },
        include: {
            user: { select: { id: true, displayName: true, emoji: true, username: true } },
        },
    });

    return NextResponse.json(wish, { status: 201 });
}
