import React, { useEffect, useRef } from 'react';

// ==================== CINEMATIC CANVAS FIREWORKS & STARDUST ENGINE ====================
// Zero emojis, pure 60fps blockbuster movie-quality fireworks and golden stardust
export default function ConfettiHearts({ active }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle Collections
    let fireworks = [];
    let sparks = [];
    let stardust = [];

    const PALETTES = [
      ['#F59E0B', '#FBBF24', '#FDE68A', '#FFFFFF'], // Champagne Gold & Diamond
      ['#F43F5E', '#FB7185', '#FDA4AF', '#FFE4E6'], // Royal Rose
      ['#8B5CF6', '#A78BFA', '#C4B5FD', '#EDE9FE'], // Cosmic Violet
      ['#06B6D4', '#22D3EE', '#67E8F9', '#ECFEFF'], // Celestial Cyan
      ['#10B981', '#34D399', '#6EE7B7', '#ECFDF5'], // Emerald Sparkle
    ];

    // Create a Grand Firework Burst
    const createBurst = (x, y, palette) => {
      const particleCount = 55 + Math.floor(Math.random() * 25);
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.2;
        const speed = 4 + Math.random() * 9;
        const color = palette[Math.floor(Math.random() * palette.length)];

        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          alpha: 1,
          decay: 0.012 + Math.random() * 0.016,
          gravity: 0.14,
          friction: 0.965,
          size: 2 + Math.random() * 2.5,
          shimmer: Math.random() > 0.3,
        });
      }
    };

    // Stardust floating downwards
    for (let i = 0; i < 70; i++) {
      stardust.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.7,
        vx: (Math.random() - 0.5) * 0.8,
        vy: 0.8 + Math.random() * 1.6,
        size: 1 + Math.random() * 2.5,
        alpha: Math.random() * 0.8 + 0.2,
        decay: 0.003 + Math.random() * 0.005,
        color: Math.random() > 0.4 ? '#FBBF24' : '#FDA4AF',
      });
    }

    // Schedule 6 Spectacular Firework Launches across screen
    const launchTimes = [
      { delay: 40, x: width * 0.5, y: height * 0.35, p: 0 },
      { delay: 280, x: width * 0.25, y: height * 0.28, p: 1 },
      { delay: 420, x: width * 0.75, y: height * 0.3, p: 2 },
      { delay: 700, x: width * 0.4, y: height * 0.22, p: 0 },
      { delay: 880, x: width * 0.65, y: height * 0.26, p: 3 },
      { delay: 1150, x: width * 0.5, y: height * 0.38, p: 4 },
    ];

    const timeouts = launchTimes.map(({ delay, x, y, p }) =>
      setTimeout(() => {
        createBurst(x, y, PALETTES[p]);
      }, delay)
    );

    // Animation Loop (60 FPS)
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Render & Update Stardust
      stardust.forEach((d) => {
        d.x += d.vx;
        d.y += d.vy;
        d.alpha -= d.decay;

        if (d.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = d.alpha;
          ctx.fillStyle = d.color;
          ctx.shadowColor = d.color;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      // 2. Render & Update Firework Sparks
      sparks.forEach((s) => {
        s.vx *= s.friction;
        s.vy *= s.friction;
        s.vy += s.gravity;
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= s.decay;

        if (s.alpha > 0) {
          ctx.save();
          const currentAlpha = s.shimmer && Math.random() > 0.3 ? s.alpha * 0.5 : s.alpha;
          ctx.globalAlpha = Math.max(0, currentAlpha);
          ctx.fillStyle = s.color;
          ctx.shadowColor = s.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      // Filter out dead particles
      sparks = sparks.filter((s) => s.alpha > 0);
      stardust = stardust.filter((d) => d.alpha > 0);

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      timeouts.forEach(clearTimeout);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {/* 1. CINEMATIC VOLUMETRIC FLASH */}
      <div className="absolute inset-0 bg-radial-gradient-cinematic animate-cinematic-flash pointer-events-none" />

      {/* 2. DUAL CONCENTRIC GOLD SHOCKWAVE BLAST */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-amber-300 shadow-[0_0_80px_rgba(251,191,36,0.8)] animate-shockwave-epic pointer-events-none" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-rose-400 shadow-[0_0_90px_rgba(244,63,94,0.7)] animate-shockwave-epic [animation-delay:150ms] pointer-events-none" />

      {/* 3. HARDWARE-ACCELERATED FIREWORKS & STARDUST CANVAS */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      <style>{`
        .bg-radial-gradient-cinematic {
          background: radial-gradient(circle at 50% 40%, rgba(254, 240, 138, 0.45) 0%, rgba(251, 113, 133, 0.2) 40%, transparent 75%);
        }

        @keyframes cinematicFlash {
          0% { opacity: 0; }
          20% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-cinematic-flash {
          animation: cinematicFlash 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes shockwaveEpic {
          0% {
            transform: translate(-50%, -50%) scale(0.1);
            opacity: 1;
          }
          70% {
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(16);
            opacity: 0;
          }
        }
        .animate-shockwave-epic {
          animation: shockwaveEpic 1.2s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
}
