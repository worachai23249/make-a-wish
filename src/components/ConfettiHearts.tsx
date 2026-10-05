'use client';

import { useEffect, useState } from 'react';

interface Heart {
    id: number;
    left: number;
    size: number;
    delay: number;
    duration: number;
    emoji: string;
}

const HEART_EMOJIS = ['💖', '💕', '✨', '🌸', '🎁', '💗', '⭐'];

export default function ConfettiHearts({ active, onComplete }: { active: boolean; onComplete?: () => void }) {
    const [hearts, setHearts] = useState<Heart[]>([]);

    useEffect(() => {
        if (!active) {
            setHearts([]);
            return;
        }

        const newHearts: Heart[] = [];
        for (let i = 0; i < 40; i++) {
            newHearts.push({
                id: i,
                left: Math.random() * 95, // 0 to 95vw
                size: Math.random() * 20 + 20, // 20 to 40px
                delay: Math.random() * 0.6, // 0 to 0.6s
                duration: Math.random() * 1.5 + 1.8, // 1.8 to 3.3s
                emoji: HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)],
            });
        }
        setHearts(newHearts);

        const timer = setTimeout(() => {
            setHearts([]);
            onComplete?.();
        }, 4000);

        return () => clearTimeout(timer);
    }, [active, onComplete]);

    if (hearts.length === 0) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 10001, overflow: 'hidden' }}>
            {hearts.map((h) => (
                <div
                    key={h.id}
                    style={{
                        position: 'absolute',
                        left: `${h.left}vw`,
                        bottom: '-40px',
                        fontSize: `${h.size}px`,
                        animation: `flyUp ${h.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${h.delay}s forwards`,
                    }}
                >
                    {h.emoji}
                </div>
            ))}
            <style>{`
                @keyframes flyUp {
                    0% {
                        transform: translateY(0) scale(0.6) rotate(0deg);
                        opacity: 0;
                    }
                    15% {
                        opacity: 1;
                        transform: translateY(-15vh) scale(1.2) rotate(15deg);
                    }
                    80% {
                        opacity: 0.9;
                    }
                    100% {
                        transform: translateY(-110vh) scale(0.8) rotate(${Math.random() > 0.5 ? '45' : '-45'}deg);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
}
