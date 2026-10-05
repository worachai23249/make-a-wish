import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const session = await auth();
    if (!session?.user?.id || (session.user as { role?: string }).role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            displayName: true,
            email: true,
            emoji: true,
            avatarUrl: true,
            role: true,
            createdAt: true,
            _count: {
                select: {
                    ownedSpaces: true,
                    wishes: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
}
