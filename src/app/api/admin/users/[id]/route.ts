import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id || (session.user as { role?: string }).role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    // Prevent admin from deleting their own current account directly
    if (session.user.id === id) {
        return NextResponse.json({ error: 'ไม่สามารถลบบัญชีของตัวเองได้' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Cascade delete is configured in schema, so deleting user deletes their owned spaces, memberships, wishes, friendships
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ ok: true });
}
