import React from 'react';

export default function ConfettiHearts({ active }) {
  if (!active) return null;

  // Generate 80 high-energy over-the-top explosion particles
  const particles = Array.from({ length: 80 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: Math.random() * 28 + 20,
    delay: Math.random() * 0.5,
    duration: 2.2 + Math.random() * 1.6,
    rotateDir: Math.random() > 0.5 ? 1 : -1,
    emoji: [
      '👑', '💎', '💰', '⭐', '🌟', '✨', '🔥', '🎉', '🎊', '🎁', 
      '💖', '💕', '💗', '🌈', '🎇', '🎆', '💫', '⚡'
    ][Math.floor(Math.random() * 18)],
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {/* 1. BLINDING WHITE SCREEN FLASH */}
      <div className="absolute inset-0 bg-white dark:bg-white/90 animate-screen-flash pointer-events-none" />

      {/* 2. EXPANDING GOLDEN SHOCKWAVE BLAST RINGS */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-4 border-amber-400 shadow-[0_0_50px_rgba(251,191,36,0.8)] animate-shockwave-ring" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-4 border-rose-500 shadow-[0_0_60px_rgba(244,63,94,0.8)] animate-shockwave-ring [animation-delay:120ms]" />

      {/* 3. MEGA OVER-THE-TOP PARTICLE CASCADE */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute select-none will-change-transform filter drop-shadow-md"
          style={{
            left: `${p.left}vw`,
            bottom: '-40px',
            fontSize: `${p.size}px`,
            animation: `megaExplosionFloat ${p.duration}s cubic-bezier(0.22, 1, 0.36, 1) ${p.delay}s forwards`,
          }}
        >
          {p.emoji}
        </div>
      ))}

      <style>{`
        @keyframes screenFlash {
          0% { opacity: 0.95; }
          30% { opacity: 0.7; }
          100% { opacity: 0; }
        }
        .animate-screen-flash {
          animation: screenFlash 0.35s ease-out forwards;
        }

        @keyframes shockwaveRing {
          0% {
            transform: translate(-50%, -50%) scale(0.1);
            opacity: 1;
          }
          70% {
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(18);
            opacity: 0;
          }
        }
        .animate-shockwave-ring {
          animation: shockwaveRing 0.95s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
        }

        @keyframes megaExplosionFloat {
          0% {
            transform: translateY(0) scale(0.2) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 1;
            transform: translateY(-30vh) scale(1.4) rotate(${Math.random() > 0.5 ? 90 : -90}deg);
          }
          65% {
            opacity: 1;
            transform: translateY(-80vh) scale(1.1) rotate(${Math.random() > 0.5 ? 240 : -240}deg);
          }
          100% {
            transform: translateY(-120vh) scale(0.6) rotate(${Math.random() > 0.5 ? 420 : -420}deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
