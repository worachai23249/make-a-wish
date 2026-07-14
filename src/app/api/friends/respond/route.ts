// src/app/api/friends/respond/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { friendshipId, accept } = await req.json();
  if (!friendshipId) return NextResponse.json({ error: "Missing friendshipId" }, { status: 400 });

  const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
  if (!friendship) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (friendship.receiverId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (accept) {
    await prisma.friendship.update({ where: { id: friendshipId }, data: { status: "accepted" } });
  } else {
    await prisma.friendship.delete({ where: { id: friendshipId } });
  }

  return NextResponse.json({ ok: true });
}
