import React from 'react';

export default function ConfettiHearts({ active }) {
  if (!active) return null;

  // 80+ Kawaii Dreamy Minimalist Particles (ซากุระ โบว์ หัวใจ เค้ก ดาว นุ่มฟู)
  const particles = Array.from({ length: 80 }).map((_, i) => ({
    id: i,
    left: Math.random() * 98,
    size: Math.random() * 26 + 18,
    delay: Math.random() * 0.45,
    duration: 2.4 + Math.random() * 1.5,
    emoji: [
      '🌸', '💖', '✨', '🎀', '🍰', '🍓', '🎁', '🧸', 
      '☁️', '🌈', '⭐', '💫', '🧁', '🌷', '💕', '🐱', '🐾'
    ][Math.floor(Math.random() * 17)],
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {/* 1. SOFT PEARL AURORA BLOOM (แสงออโรร่าสีชมพูพาสเทลละมุนตา) */}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-200/40 via-pink-100/25 to-transparent dark:from-rose-900/30 dark:via-purple-900/15 animate-aurora-bloom pointer-events-none" />

      {/* 2. SOFT PASTEL SHOCKWAVE HALO RINGS (วงแหวนคลื่นพลังพาสเทลนุ่มฟู) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-pink-300/80 shadow-[0_0_40px_rgba(244,114,182,0.6)] animate-kawaii-shockwave" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-rose-300/60 shadow-[0_0_50px_rgba(251,113,133,0.5)] animate-kawaii-shockwave [animation-delay:140ms]" />

      {/* 3. FLOATING KAWAII PARTICLES */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute select-none will-change-transform filter drop-shadow-sm"
          style={{
            left: `${p.left}vw`,
            bottom: '-35px',
            fontSize: `${p.size}px`,
            animation: `kawaiiFloatUp ${p.duration}s cubic-bezier(0.22, 1, 0.36, 1) ${p.delay}s forwards`,
          }}
        >
          {p.emoji}
        </div>
      ))}

      <style>{`
        @keyframes auroraBloom {
          0% { opacity: 0.9; transform: scale(1); }
          50% { opacity: 0.7; }
          100% { opacity: 0; transform: scale(1.05); }
        }
        .animate-aurora-bloom {
          animation: auroraBloom 0.8s ease-out forwards;
        }

        @keyframes kawaiiShockwave {
          0% {
            transform: translate(-50%, -50%) scale(0.1);
            opacity: 1;
          }
          60% {
            opacity: 0.7;
          }
          100% {
            transform: translate(-50%, -50%) scale(14);
            opacity: 0;
          }
        }
        .animate-kawaii-shockwave {
          animation: kawaiiShockwave 1.1s cubic-bezier(0.12, 0.8, 0.25, 1) forwards;
        }

        @keyframes kawaiiFloatUp {
          0% {
            transform: translateY(0) scale(0.3) rotate(0deg);
            opacity: 0;
          }
          18% {
            opacity: 1;
            transform: translateY(-28vh) scale(1.25) rotate(${Math.random() > 0.5 ? 45 : -45}deg);
          }
          70% {
            opacity: 0.95;
            transform: translateY(-85vh) scale(1.05) rotate(${Math.random() > 0.5 ? 120 : -120}deg);
          }
          100% {
            transform: translateY(-118vh) scale(0.7) rotate(${Math.random() > 0.5 ? 200 : -200}deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
