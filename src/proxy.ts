// src/proxy.ts — Next.js 16 uses proxy.ts (not middleware.ts)
// Edge-safe: imports ONLY auth.config (no prisma)
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icon-|sw.js).*)" ],
};
