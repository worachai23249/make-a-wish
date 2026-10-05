import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const session = await auth();
    if (!session?.user?.id || (session.user as { role?: string }).role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [userCount, spaceCount, wishCount] = await Promise.all([
        prisma.user.count(),
        prisma.space.count(),
        prisma.wish.count(),
    ]);

    return NextResponse.json({
        users: userCount,
        spaces: spaceCount,
        wishes: wishCount,
    });
}
