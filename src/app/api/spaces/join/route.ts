// src/app/api/spaces/join/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { inviteCode } = await req.json();
  if (!inviteCode) return NextResponse.json({ error: "กรุณาใส่รหัสเชิญ" }, { status: 400 });

  const space = await prisma.space.findUnique({
    where: { inviteCode: inviteCode.toUpperCase() },
    include: { members: true },
  });

  if (!space) return NextResponse.json({ error: "ไม่พบรหัสเชิญนี้" }, { status: 404 });

  const alreadyMember = space.members.some((m: any) => m.userId === session.user!.id);
  if (alreadyMember) return NextResponse.json({ error: "คุณอยู่ใน Space นี้แล้ว" }, { status: 400 });

  const maxMembers = space.type === "1on1" ? 2 : 10;
  if (space.members.length >= maxMembers) {
    return NextResponse.json({ error: `Space นี้เต็มแล้ว (${maxMembers} คน)` }, { status: 400 });
  }

  await prisma.spaceMember.create({ data: { spaceId: space.id, userId: session.user!.id } });

  return NextResponse.json({ spaceId: space.id, message: "เข้าร่วม Space สำเร็จ" });
}
