// src/app/api/friends/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const userSelect = {
  id: true, displayName: true, username: true, emoji: true, avatarUrl: true,
} as const;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = session.user.id;

  const all = await prisma.friendship.findMany({
    where: { OR: [{ senderId: id }, { receiverId: id }] },
    include: {
      sender:   { select: userSelect },
      receiver: { select: userSelect },
    },
    orderBy: { createdAt: "desc" },
  });

  const friends = all.filter((f) => f.status === "accepted");
  const pending = all.filter((f) => f.status === "pending");

  return NextResponse.json({ friends, pending });
}
