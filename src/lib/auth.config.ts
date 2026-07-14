// src/lib/auth.config.ts
// Edge-safe config: NO prisma import here
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [],
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" as const },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const publicPaths = ["/login", "/register"];
      if (publicPaths.some((p) => pathname.startsWith(p))) return true;

      if (!isLoggedIn) return false;

      const role = (auth?.user as any)?.role;

      // Admin: only allow /admin routes
      if (role === "admin" && !pathname.startsWith("/admin")) {
        return Response.redirect(new URL("/admin", nextUrl));
      }

      // User: block admin routes
      if (role !== "admin" && pathname.startsWith("/admin")) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.role = (user as any).role;
        token.emoji = (user as any).emoji;
        token.avatarUrl = (user as any).avatarUrl;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).username = token.username;
        (session.user as any).role = token.role;
        (session.user as any).emoji = token.emoji;
        (session.user as any).avatarUrl = token.avatarUrl;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
