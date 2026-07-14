"use client";
// src/components/ConfettiHearts.tsx
import React, { useEffect, useState } from "react";

interface Heart {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  emoji: string;
}

const EMOJIS = ["🌸", "💕", "💖", "🎀", "⭐", "✨", "💫", "🍀"];

export default function ConfettiHearts({ show }: { show: boolean }) {
  const [hearts, setHearts] = useState<Heart[]>([]);

  useEffect(() => {
    if (!show) { setHearts([]); return; }
    const h: Heart[] = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.5,
      duration: 2.5 + Math.random() * 2,
      size: 0.9 + Math.random() * 0.9,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    }));
    setHearts(h);
    const t = setTimeout(() => setHearts([]), 5000);
    return () => clearTimeout(t);
  }, [show]);

  if (hearts.length === 0) return null;

  return (
    <div className="confetti-container">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="confetti-heart"
          style={{
            left: `${h.left}%`,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.duration}s`,
            fontSize: `${h.size}rem`,
          }}
        >
          {h.emoji}
        </span>
      ))}
    </div>
  );
}
