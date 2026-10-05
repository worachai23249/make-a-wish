// src/auth.config.ts
import type { NextAuthConfig } from 'next-auth';
import { NextResponse } from 'next/server';

export const authConfig = {
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const role = (auth?.user as { role?: string })?.role;
            const pathname = nextUrl.pathname;

            const isLoginPage = pathname === '/login';
            const isRegisterPage = pathname === '/register';
            const isAdminRoute = pathname.startsWith('/admin');
            const isProtectedRoute =
                pathname.startsWith('/dashboard') ||
                pathname.startsWith('/spaces') ||
                pathname.startsWith('/friends') ||
                pathname.startsWith('/profile');

            // หน้า login/register — ถ้า login อยู่แล้ว redirect
            if (isLoginPage || isRegisterPage) {
                if (isLoggedIn) {
                    if (role === 'admin') return NextResponse.redirect(new URL('/admin', nextUrl));
                    return NextResponse.redirect(new URL('/dashboard', nextUrl));
                }
                return true;
            }

            // Admin routes — ต้องเป็น admin เท่านั้น
            if (isAdminRoute) {
                if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl));
                if (role !== 'admin') return NextResponse.redirect(new URL('/dashboard', nextUrl));
                return true;
            }

            // Protected routes — ต้อง login
            if (isProtectedRoute) {
                if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl));
                return true;
            }

            // Root page — redirect based on role
            if (pathname === '/') {
                if (isLoggedIn) {
                    if (role === 'admin') return NextResponse.redirect(new URL('/admin', nextUrl));
                    return NextResponse.redirect(new URL('/dashboard', nextUrl));
                }
                return NextResponse.redirect(new URL('/login', nextUrl));
            }

            return true;
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            if (token.role && session.user) {
                (session.user as { role?: string }).role = token.role as string;
            }
            if (token.username && session.user) {
                (session.user as { username?: string }).username = token.username as string;
            }
            if (token.emoji && session.user) {
                (session.user as { emoji?: string }).emoji = token.emoji as string;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
                token.role = (user as { role?: string }).role;
                token.username = (user as { username?: string }).username;
                token.emoji = (user as { emoji?: string }).emoji;
            }
            return token;
        },
    },
    session: {
        maxAge: 365 * 24 * 60 * 60, // 1 ปี
    },
    providers: [],
} satisfies NextAuthConfig;
