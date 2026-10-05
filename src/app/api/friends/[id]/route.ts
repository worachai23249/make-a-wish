import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// PATCH: Accept or Decline friend request
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await req.json();

    if (!['accepted', 'declined'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const friendship = await prisma.friendship.findUnique({
        where: { id },
    });

    if (!friendship) {
        return NextResponse.json({ error: 'Friendship not found' }, { status: 404 });
    }

    // Only receiver can accept or decline
    if (friendship.receiverId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (status === 'declined') {
        // If declined, we can delete the friendship or set status to declined
        await prisma.friendship.delete({ where: { id } });
        return NextResponse.json({ ok: true, status: 'declined' });
    }

    const updated = await prisma.friendship.update({
        where: { id },
        data: { status: 'accepted' },
    });

    return NextResponse.json(updated);
}

// DELETE: Cancel request or unfriend
export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const friendship = await prisma.friendship.findUnique({
        where: { id },
    });

    if (!friendship) {
        return NextResponse.json({ error: 'Friendship not found' }, { status: 404 });
    }

    // Only participants can delete
    if (friendship.senderId !== session.user.id && friendship.receiverId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.friendship.delete({
        where: { id },
    });

    return NextResponse.json({ ok: true });
}
