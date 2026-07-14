// src/app/api/profile/name/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { displayName } = await req.json();
  if (!displayName || displayName.trim().length < 1)
    return NextResponse.json({ error: "ชื่อไม่ถูกต้อง" }, { status: 400 });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { displayName: displayName.trim() },
  });

  return NextResponse.json({ ok: true });
}
