// src/auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsed = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (!parsed.success) return null;

                const { email, password } = parsed.data;
                const user = await prisma.user.findUnique({ where: { email } });
                if (!user) return null;

                const match = await bcrypt.compare(password, user.passwordHash);
                if (!match) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: user.displayName,
                    role: user.role,
                    username: user.username,
                    emoji: user.emoji,
                };
            },
        }),
    ],
});
