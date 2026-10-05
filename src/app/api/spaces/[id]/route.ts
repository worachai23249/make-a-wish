// src/app/api/spaces/[id]/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const isMember = await prisma.spaceMember.findUnique({
        where: { spaceId_userId: { spaceId: id, userId: session.user.id } },
    });
    if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const space = await prisma.space.findUnique({
        where: { id },
        include: {
            owner: { select: { id: true, displayName: true, emoji: true, username: true } },
            members: {
                include: {
                    user: { select: { id: true, displayName: true, emoji: true, username: true, avatarUrl: true } },
                },
            },
            wishes: {
                include: {
                    user: { select: { id: true, displayName: true, emoji: true, username: true } },
                },
                orderBy: { createdAt: 'desc' },
            },
        },
    });

    if (!space) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(space);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const space = await prisma.space.findUnique({ where: { id } });
    if (!space) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (space.ownerId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await prisma.space.delete({ where: { id } });
    return NextResponse.json({ ok: true });
}
