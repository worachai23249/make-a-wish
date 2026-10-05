import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get('search')?.trim();

    const currentUserId = session.user.id;

    // If searching for user by username
    if (searchQuery) {
        const users = await prisma.user.findMany({
            where: {
                username: {
                    contains: searchQuery.toLowerCase(),
                    mode: 'insensitive',
                },
                id: { not: currentUserId },
            },
            select: {
                id: true,
                username: true,
                displayName: true,
                emoji: true,
                avatarUrl: true,
            },
            take: 10,
        });

        // Also check friendship status with these users
        const friendRelations = await prisma.friendship.findMany({
            where: {
                OR: [
                    { senderId: currentUserId, receiverId: { in: users.map(u => u.id) } },
                    { receiverId: currentUserId, senderId: { in: users.map(u => u.id) } },
                ],
            },
        });

        const usersWithStatus = users.map(u => {
            const rel = friendRelations.find(
                r => (r.senderId === u.id && r.receiverId === currentUserId) ||
                     (r.receiverId === u.id && r.senderId === currentUserId)
            );
            return {
                ...u,
                friendship: rel ? {
                    id: rel.id,
                    status: rel.status,
                    isSender: rel.senderId === currentUserId,
                } : null,
            };
        });

        return NextResponse.json({ users: usersWithStatus });
    }

    // Otherwise, return current user's friendships
    const friendships = await prisma.friendship.findMany({
        where: {
            OR: [
                { senderId: session.user.id },
                { receiverId: session.user.id },
            ],
        },
        include: {
            sender: {
                select: { id: true, username: true, displayName: true, emoji: true, avatarUrl: true },
            },
            receiver: {
                select: { id: true, username: true, displayName: true, emoji: true, avatarUrl: true },
            },
        },
        orderBy: { updatedAt: 'desc' },
    });

    const acceptedFriends: Array<{
        friendshipId: string;
        user: { id: string; username: string; displayName: string; emoji: string; avatarUrl: string | null };
        since: Date;
    }> = [];

    const pendingIncoming: Array<{
        friendshipId: string;
        user: { id: string; username: string; displayName: string; emoji: string; avatarUrl: string | null };
        requestedAt: Date;
    }> = [];

    const pendingOutgoing: Array<{
        friendshipId: string;
        user: { id: string; username: string; displayName: string; emoji: string; avatarUrl: string | null };
        requestedAt: Date;
    }> = [];

    for (const f of friendships) {
        const isSender = f.senderId === session.user.id;
        const otherUser = isSender ? f.receiver : f.sender;

        if (f.status === 'accepted') {
            acceptedFriends.push({
                friendshipId: f.id,
                user: otherUser,
                since: f.updatedAt,
            });
        } else if (f.status === 'pending') {
            if (isSender) {
                pendingOutgoing.push({
                    friendshipId: f.id,
                    user: otherUser,
                    requestedAt: f.createdAt,
                });
            } else {
                pendingIncoming.push({
                    friendshipId: f.id,
                    user: otherUser,
                    requestedAt: f.createdAt,
                });
            }
        }
    }

    return NextResponse.json({
        friends: acceptedFriends,
        pendingIncoming,
        pendingOutgoing,
    });
}

// POST - Send friend request by username or receiverId
export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username, receiverId } = await req.json();

    let targetUserId = receiverId;
    if (!targetUserId && username) {
        const cleanUsername = username.replace(/^@/, '').trim().toLowerCase();
        const target = await prisma.user.findUnique({
            where: { username: cleanUsername },
        });
        if (!target) {
            return NextResponse.json({ error: 'ไม่พบผู้ใช้นี้' }, { status: 404 });
        }
        targetUserId = target.id;
    }

    if (!targetUserId) {
        return NextResponse.json({ error: 'กรุณาระบุผู้ใช้' }, { status: 400 });
    }

    if (targetUserId === session.user.id) {
        return NextResponse.json({ error: 'ไม่สามารถส่งคำขอเป็นเพื่อนให้ตัวเองได้' }, { status: 400 });
    }

    // Check if relationship already exists
    const existing = await prisma.friendship.findFirst({
        where: {
            OR: [
                { senderId: session.user.id, receiverId: targetUserId },
                { senderId: targetUserId, receiverId: session.user.id },
            ],
        },
    });

    if (existing) {
        if (existing.status === 'accepted') {
            return NextResponse.json({ error: 'เป็นเพื่อนกันอยู่แล้ว' }, { status: 400 });
        }
        if (existing.status === 'pending') {
            return NextResponse.json({ error: 'มีคำขอเป็นเพื่อนรอดำเนินการอยู่' }, { status: 400 });
        }
        // If declined, update to pending and set sender
        const updated = await prisma.friendship.update({
            where: { id: existing.id },
            data: {
                senderId: session.user.id,
                receiverId: targetUserId,
                status: 'pending',
            },
        });
        return NextResponse.json(updated);
    }

    const friendship = await prisma.friendship.create({
        data: {
            senderId: session.user.id,
            receiverId: targetUserId,
            status: 'pending',
        },
    });

    return NextResponse.json(friendship, { status: 201 });
}
