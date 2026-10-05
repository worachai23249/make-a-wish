import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string; wishId: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: spaceId, wishId } = await params;

    const wish = await prisma.wish.findUnique({
        where: { id: wishId },
        include: { space: true },
    });

    if (!wish || wish.spaceId !== spaceId) {
        return NextResponse.json({ error: 'Wish not found' }, { status: 404 });
    }

    // Owner of wish or space owner or admin can delete
    const isWishOwner = wish.userId === session.user.id;
    const isSpaceOwner = wish.space.ownerId === session.user.id;
    const isAdmin = (session.user as { role?: string }).role === 'admin';

    if (!isWishOwner && !isSpaceOwner && !isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.wish.delete({
        where: { id: wishId },
    });

    return NextResponse.json({ ok: true });
}
