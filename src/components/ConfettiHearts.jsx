import React from 'react';

// Luxury Minimalist Geometric Confetti (No text emojis, pure aesthetic gold & pastel foil)
const CONFETTI_COLORS = [
  '#F472B6', // Rose Gold
  '#FBBF24', // Champagne Gold
  '#FB7185', // Soft Rose
  '#C084FC', // Lavender Mist
  '#6EE7B7', // Mint Pastel
  '#FDBA74', // Warm Peach
  '#FFFFFF', // Pearl White
];

export default function ConfettiHearts({ active }) {
  if (!active) return null;

  // 65 Luxury geometric foil ribbons, circles, and 4-point sparkle stars
  const particles = Array.from({ length: 65 }).map((_, i) => {
    const type = i % 3 === 0 ? 'ribbon' : i % 3 === 1 ? 'circle' : 'star';
    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    const left = Math.random() * 96 + 2;
    const delay = Math.random() * 0.35;
    const duration = 2.2 + Math.random() * 1.4;
    const size = type === 'circle' ? 6 + Math.random() * 6 : 8 + Math.random() * 8;
    const drift = (Math.random() - 0.5) * 120;

    return { id: i, type, color, left, delay, duration, size, drift };
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {/* 1. SOFT AMBIENT AURORA BLOOM (แสงออโรร่าสีชมพูพาสเทลนุ่มนวล) */}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-200/25 via-pink-100/15 to-transparent dark:from-rose-900/20 dark:via-purple-900/10 animate-aurora-bloom pointer-events-none" />

      {/* 2. GEOMETRIC PARTICLES (ไม่มีตัวอีโมจิ คลีน มินิมอล สบายตา) */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute will-change-transform"
          style={{
            left: `${p.left}vw`,
            bottom: '-20px',
            animation: `geometricFloat ${p.duration}s cubic-bezier(0.25, 0.9, 0.3, 1) ${p.delay}s forwards`,
            '--drift': `${p.drift}px`,
          }}
        >
          {p.type === 'ribbon' ? (
            <div
              style={{
                width: `${p.size * 0.7}px`,
                height: `${p.size * 1.6}px`,
                backgroundColor: p.color,
                borderRadius: '2px',
                boxShadow: `0 0 8px ${p.color}40`,
                animation: `ribbonTumble ${1.2 + Math.random() * 0.8}s infinite linear`,
              }}
            />
          ) : p.type === 'circle' ? (
            <div
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                borderRadius: '9999px',
                boxShadow: `0 0 10px ${p.color}60`,
              }}
            />
          ) : (
            <svg
              width={p.size * 1.4}
              height={p.size * 1.4}
              viewBox="0 0 24 24"
              style={{
                filter: `drop-shadow(0 0 6px ${p.color}80)`,
                animation: `starSpin ${1.8 + Math.random()}s infinite linear`,
              }}
            >
              <path
                d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8Z"
                fill={p.color}
              />
            </svg>
          )}
        </div>
      ))}

      <style>{`
        @keyframes auroraBloom {
          0% { opacity: 0; }
          25% { opacity: 0.8; }
          100% { opacity: 0; }
        }
        .animate-aurora-bloom {
          animation: auroraBloom 1.2s ease-out forwards;
        }

        @keyframes geometricFloat {
          0% {
            transform: translate(0, 0) scale(0.4);
            opacity: 0;
          }
          15% {
            opacity: 0.95;
            transform: translate(calc(var(--drift) * 0.2), -30vh) scale(1.1);
          }
          65% {
            opacity: 0.85;
            transform: translate(calc(var(--drift) * 0.7), -70vh) scale(0.95);
          }
          90% {
            opacity: 0.2;
          }
          100% {
            transform: translate(var(--drift), -95vh) scale(0.4);
            opacity: 0;
          }
        }

        @keyframes ribbonTumble {
          0% {
            transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
          }
          100% {
            transform: rotateX(360deg) rotateY(360deg) rotateZ(180deg);
          }
        }

        @keyframes starSpin {
          0% {
            transform: rotate(0deg) scale(0.9);
          }
          50% {
            transform: rotate(180deg) scale(1.15);
          }
          100% {
            transform: rotate(360deg) scale(0.9);
          }
        }
      `}</style>
    </div>
  );
}
