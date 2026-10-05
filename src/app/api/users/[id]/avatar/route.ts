import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const user = await prisma.user.findUnique({
        where: { id },
        select: { avatarUrl: true, displayName: true, emoji: true },
    });

    if (!user) {
        return new NextResponse('User not found', { status: 404 });
    }

    if (user.avatarUrl && user.avatarUrl.startsWith('data:')) {
        const matches = user.avatarUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
            const contentType = matches[1];
            const buffer = Buffer.from(matches[2], 'base64');

            return new NextResponse(buffer, {
                status: 200,
                headers: {
                    'Content-Type': contentType,
                    'Content-Length': buffer.length.toString(),
                    'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
                },
            });
        }
    }

    // Default fallback SVG using user's emoji and display name
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
        <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#F4A0B5" />
                <stop offset="100%" stop-color="#E8617A" />
            </linearGradient>
        </defs>
        <rect width="256" height="256" rx="128" fill="url(#grad)" />
        <text x="50%" y="55%" font-size="100" text-anchor="middle" dominant-baseline="middle">
            ${user.emoji || '🌸'}
        </text>
    </svg>`;

    return new NextResponse(svg, {
        status: 200,
        headers: {
            'Content-Type': 'image/svg+xml; charset=utf-8',
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
        },
    });
}
