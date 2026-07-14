// src/app/api/friends/request/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { receiverId } = await req.json();
  if (!receiverId) return NextResponse.json({ error: "Missing receiverId" }, { status: 400 });
  if (receiverId === session.user.id) return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 });

  // Check existing
  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { senderId: session.user.id, receiverId },
        { senderId: receiverId, receiverId: session.user.id },
      ],
    },
  });
  if (existing) {
    if (existing.status === "accepted") return NextResponse.json({ error: "เป็นเพื่อนกันอยู่แล้ว" }, { status: 409 });
    return NextResponse.json({ error: "ส่งคำขอแล้วหรือมีคำขอรออยู่" }, { status: 409 });
  }

  const friendship = await prisma.friendship.create({
    data: { senderId: session.user.id, receiverId, status: "pending" },
  });

  return NextResponse.json({ friendship });
}
