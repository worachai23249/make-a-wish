import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateProfileSchema = z.object({
    displayName: z.string().min(1).max(60).optional(),
    emoji: z.string().min(1).max(10).optional(),
    avatarUrl: z.string().optional(),
});

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            username: true,
            displayName: true,
            email: true,
            emoji: true,
            avatarUrl: true,
            role: true,
            createdAt: true,
        },
    });

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
}

export async function PATCH(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
    }

    const updated = await prisma.user.update({
        where: { id: session.user.id },
        data: parsed.data,
        select: {
            id: true,
            username: true,
            displayName: true,
            email: true,
            emoji: true,
            avatarUrl: true,
            role: true,
        },
    });

    return NextResponse.json(updated);
}
