import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2, VolumeX, Sparkles, Check, Trophy, Star, Zap } from 'lucide-react';
import { sound } from '../audio';

// Celestial Luxury Color Palette for Wheel
const regalColors = [
  { bg: '#0284C7', border: '#E0F2FE' }, // Sky Cerulean
  { bg: '#38BDF8', border: '#F0F9FF' }, // Ice Azure
  { bg: '#D97706', border: '#FEF3C7' }, // Imperial Gold
  { bg: '#0D9488', border: '#CCFBF1' }, // Aquamarine
  { bg: '#2563EB', border: '#DBEAFE' }, // Royal Blue
  { bg: '#F59E0B', border: '#FEF9C3' }, // Champagne Gold
  { bg: '#0891B2', border: '#CFFAFE' }, // Cyan Starlight
  { bg: '#4F46E5', border: '#EEF2FF' }, // Cosmic Lapis
  { bg: '#059669', border: '#D1FAE5' }, // Emerald Glow
  { bg: '#0EA5E9', border: '#E0F2FE' }, // Radiant Ocean
];

export default function RouletteModal({ isOpen, onClose, wishes, onConfetti }) {
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [showWinnerShowcase, setShowWinnerShowcase] = useState(false);
  const [rouletteCategory, setRouletteCategory] = useState('all');
  const [isMuted, setIsMuted] = useState(false);
  
  // Cinematic FX States
  const [spinPhase, setSpinPhase] = useState('idle'); // 'idle' | 'hyper' | 'slowmo' | 'jackpot'
  const [shakeIntensity, setShakeIntensity] = useState(0);

  // Checkbox selections
  const [selectedWishIds, setSelectedWishIds] = useState(new Set());
  
  // Canvas refs
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const angleRef = useRef(0);

  useEffect(() => {
    setIsMuted(sound.isMuted());
  }, []);

  const baseEligibleWishes = wishes.filter((w) => {
    if (w.isFulfilled) return false;
    if (rouletteCategory === 'all') return true;
    return w.category === rouletteCategory;
  });

  useEffect(() => {
    if (isOpen) {
      setSelectedWishIds(new Set(baseEligibleWishes.map(w => w.id)));
      setWinner(null);
      setShowWinnerShowcase(false);
      setSpinPhase('idle');
      setShakeIntensity(0);
      angleRef.current = 0;
      drawWheel(0);
    }
  }, [isOpen, rouletteCategory, wishes]);

  const toggleWishSelection = (id) => {
    if (spinning) return;
    const nextSet = new Set(selectedWishIds);
    if (nextSet.has(id)) {
      nextSet.delete(id);
    } else {
      nextSet.add(id);
    }
    setSelectedWishIds(nextSet);
  };

  const activeWishes = baseEligibleWishes.filter(w => selectedWishIds.has(w.id));

  // ==================== DRAW OPULENT CASINO WHEEL ====================
  const drawWheel = (angleOffset, isFast = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 16;

    ctx.clearRect(0, 0, width, height);

    if (activeWishes.length === 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#1e1b1e';
      ctx.fill();
      ctx.strokeStyle = '#44403c';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#a8a29e';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ไม่มีรายการในหมวดนี้', centerX, centerY);
      return;
    }

    const numItems = activeWishes.length;
    const sliceAngle = (2 * Math.PI) / numItems;

    // 1. OUTER CELESTIAL GOLD RIM
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI);
    ctx.lineWidth = 10;
    ctx.strokeStyle = isFast ? '#F59E0B' : '#38BDF8';
    ctx.shadowColor = isFast ? 'rgba(245, 158, 11, 0.8)' : 'rgba(56, 189, 248, 0.6)';
    ctx.shadowBlur = isFast ? 28 : 14;
    ctx.stroke();
    ctx.restore();

    // 2. DRAW SLICES WITH LUXURY GRADIENTS
    activeWishes.forEach((wish, i) => {
      const startAngle = angleOffset + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const colorScheme = regalColors[i % regalColors.length];

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      // Radial Metallic Gradient
      const grad = ctx.createRadialGradient(centerX, centerY, 15, centerX, centerY, radius);
      grad.addColorStop(0, colorScheme.bg);
      grad.addColorStop(1, colorScheme.bg + 'd9');
      ctx.fillStyle = grad;
      ctx.fill();

      // Sharp Crisp Separation Lines
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Draw Emoji & Text
      const textAngle = startAngle + sliceAngle / 2;
      const textRadius = radius * 0.63;
      ctx.translate(centerX + Math.cos(textAngle) * textRadius, centerY + Math.sin(textAngle) * textRadius);
      ctx.rotate(textAngle + Math.PI / 2);

      // Emoji
      ctx.font = '28px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 8;
      ctx.fillText(wish.emoji || '🎁', 0, -4);

      // Truncated Title on wide slices
      if (numItems <= 12) {
        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 4;
        const truncatedTitle = wish.title.length > 7 ? wish.title.slice(0, 7) + '..' : wish.title;
        ctx.fillText(truncatedTitle, 0, 16);
      }

      ctx.restore();
    });

    // 3. CENTER GOLD MEDALLION HUB
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 24, 0, 2 * Math.PI);
    const centerGrad = ctx.createRadialGradient(centerX - 4, centerY - 4, 3, centerX, centerY, 24);
    centerGrad.addColorStop(0, '#FEF08A');
    centerGrad.addColorStop(0.6, '#F59E0B');
    centerGrad.addColorStop(1, '#B45309');
    ctx.fillStyle = centerGrad;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 12;
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center Diamond Starburst
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.restore();
  };

  useEffect(() => {
    drawWheel(angleRef.current);
  }, [activeWishes.length]);

  // ==================== CINEMATIC BLOCKBUSTER SPIN ENGINE ====================
  const startCinematicSpin = () => {
    if (activeWishes.length < 2 || spinning) return;

    setSpinning(true);
    setWinner(null);
    setShowWinnerShowcase(false);
    setSpinPhase('hyper');
    setShakeIntensity(2);

    // Cinematic Energy Launch Audio
    sound.playHyperLaunch();

    const numItems = activeWishes.length;
    const sliceAngle = (2 * Math.PI) / numItems;

    // 14 to 19 full hyper rotations for maximum suspense
    const spins = 14 + Math.random() * 5;
    const randomOffset = Math.random() * (2 * Math.PI);
    const targetAngle = angleRef.current + (spins * 2 * Math.PI) + randomOffset;

    let currentAngle = angleRef.current;
    let lastTickAngle = currentAngle;
    let lastHeartbeatTime = 0;

    const animate = () => {
      const remainingAngle = targetAngle - currentAngle;

      // Easing calculation
      const speed = Math.max(remainingAngle * 0.036, 0.003);
      currentAngle += speed;

      const isHyper = speed > 0.17;
      const isSlowmo = speed <= 0.055 && remainingAngle > 0.01;

      if (isHyper) {
        setSpinPhase('hyper');
        setShakeIntensity(2);
      } else if (isSlowmo) {
        setSpinPhase('slowmo');
        setShakeIntensity(1);

        // Deep movie-trailer heartbeat pulse
        const now = Date.now();
        if (now - lastHeartbeatTime > 380) {
          sound.playHeartbeat();
          lastHeartbeatTime = now;
        }
      }

      // Crisp clockwork ticks with velocity pitch modulation
      const tickDelta = isHyper ? 0.32 : 0.22;
      if (Math.abs(currentAngle - lastTickAngle) > tickDelta) {
        const speedFactor = speed * 15;
        sound.playTick(speedFactor);
        lastTickAngle = currentAngle;
      }

      angleRef.current = currentAngle;
      drawWheel(currentAngle, isHyper);

      if (remainingAngle < 0.01) {
        // FINISHED! TRIGGER CINEMATIC JACKPOT EXPLOSION
        setSpinning(false);
        setSpinPhase('jackpot');
        setShakeIntensity(0);
        angleRef.current = currentAngle;

        // Calculate Winner
        const normalizedAngle = currentAngle % (2 * Math.PI);
        const pointerAngle = (3 * Math.PI) / 2;

        let winningIndex = 0;
        for (let i = 0; i < numItems; i++) {
          let start = (normalizedAngle + i * sliceAngle) % (2 * Math.PI);
          let end = (start + sliceAngle) % (2 * Math.PI);

          if (start < end) {
            if (pointerAngle >= start && pointerAngle < end) winningIndex = i;
          } else {
            if (pointerAngle >= start || pointerAngle < end) winningIndex = i;
          }
        }

        const winningWish = activeWishes[winningIndex];
        setWinner(winningWish);

        // 💥 Full-Screen Canvas Fireworks + 808 Sub Drop & Grand Brass Fanfare
        sound.playJackpotExplosion();
        onConfetti();

        // 🎬 Reveal 5-Star Cinematic Showcase Modal
        setTimeout(() => {
          setShowWinnerShowcase(true);
        }, 400);

        cancelAnimationFrame(requestRef.current);
      } else {
        requestRef.current = requestAnimationFrame(animate);
      }
    };

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => !spinning && onClose()}>
      {/* High-Tech Glass Container with Dynamic Cinematic Lighting */}
      <div
        className={`glass-panel w-full max-w-sm p-6 sm:p-7 rounded-[32px] space-y-4 border-2 transition-all flex flex-col max-h-[92vh] relative ${
          spinPhase === 'hyper'
            ? 'border-amber-400 shadow-[0_0_60px_rgba(245,158,11,0.6)] animate-hyper-rumble'
            : spinPhase === 'slowmo'
            ? 'border-purple-500 shadow-[0_0_45px_rgba(168,85,247,0.5)] animate-tense-pulse'
            : 'border-rose-500/25'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between shrink-0 relative z-10">
          <button
            type="button"
            onClick={() => {
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              sound.setMuted(nextMuted);
            }}
            className="p-2 rounded-xl text-stone-400 hover:text-rose-500 transition-colors"
            title={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <h3 className="font-extrabold text-base flex items-center gap-1.5 tracking-tight">
            {spinPhase === 'hyper' ? (
              <span className="flex items-center gap-1.5 text-amber-500 font-black animate-pulse">
                <Zap size={18} className="text-yellow-400 animate-bounce" /> ⚡ HYPER ROTATION! ⚡
              </span>
            ) : spinPhase === 'slowmo' ? (
              <span className="flex items-center gap-1.5 text-purple-400 font-black animate-pulse">
                <Sparkles size={18} className="text-amber-400 animate-spin" /> ✦ ลุ้นชี้ชะตา... ✦
              </span>
            ) : (
              <span className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-sky-500 to-blue-600 bg-clip-text text-transparent font-black">
                <Sparkles size={16} className="text-amber-400" /> วงล้อสุ่มความปรารถนา
              </span>
            )}
          </h3>

          <button
            onClick={() => !spinning && onClose()}
            className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full hover:bg-stone-500/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex gap-1 justify-center bg-sky-500/8 dark:bg-slate-800/60 p-1 rounded-full shrink-0 relative z-10 border border-sky-400/20">
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'item', label: '🎁 ของขวัญ' },
            { id: 'food', label: '🍜 ของกิน' },
            { id: 'place', label: '📍 ที่เที่ยว' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                if (!spinning) {
                  setRouletteCategory(cat.id);
                  setWinner(null);
                }
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                rouletteCategory === cat.id
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-sky-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Wheel Canvas Area */}
        <div className="relative flex justify-center py-2 shrink-0">
          {/* PRECISION METALLIC NEEDLE POINTER */}
          <div className="absolute top-0 z-20 flex flex-col items-center">
            {/* Jewel Head Indicator */}
            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 shadow-md flex items-center justify-center -mb-1 z-10 border-2 border-white dark:border-stone-900" />

            {/* Needle Triangle */}
            <div
              className={`w-0 h-0 transition-transform ${
                spinPhase === 'hyper' ? 'animate-needle-vibrate' : ''
              }`}
              style={{
                borderLeft: '11px solid transparent',
                borderRight: '11px solid transparent',
                borderTop: '20px solid #0284C7',
                filter: 'drop-shadow(0 0 10px rgba(14, 165, 233, 0.75))',
              }}
            />
          </div>

          {/* Canvas Element */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={290}
              height={290}
              className={`rounded-full transition-all ${
                spinPhase === 'hyper'
                  ? 'shadow-[0_0_45px_rgba(245,158,11,0.65)]'
                  : 'shadow-lg'
              }`}
            />
          </div>
        </div>

        {/* Winner Preview Alert */}
        {winner && !showWinnerShowcase && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 border border-amber-400/40 text-amber-600 dark:text-amber-400 font-black text-xs animate-bounce flex items-center justify-center gap-1.5 shrink-0 shadow-lg">
            <Sparkles size={16} className="text-amber-400" />
            ผู้โชคดีได้รับ: {winner.title}! 🏆
          </div>
        )}

        {/* Checkbox List of Eligible Wishes */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1 relative z-10">
          {baseEligibleWishes.length === 0 ? (
            <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/10 space-y-1.5 text-center mt-2">
              <div className="text-3xl">⭐</div>
              <div className="font-bold text-xs text-stone-600 dark:text-stone-300">ไม่มีรายการที่ยังไม่ได้ซื้อในหมวดนี้</div>
              <p className="text-[11px] text-stone-400">ลองเปลี่ยนหมวดหมู่หรือเพิ่มความปรารถนาใหม่</p>
            </div>
          ) : (
            baseEligibleWishes.map((w) => (
              <label
                key={w.id}
                className={`flex items-center gap-3 p-2.5 rounded-2xl border cursor-pointer transition-all ${
                  selectedWishIds.has(w.id)
                    ? 'bg-rose-500/8 border-rose-500/30'
                    : 'bg-transparent border-stone-200 dark:border-stone-800 opacity-50'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                    selectedWishIds.has(w.id)
                      ? 'bg-rose-500 border-rose-500 text-white'
                      : 'border-stone-300 dark:border-stone-600'
                  }`}
                >
                  {selectedWishIds.has(w.id) && <Check size={13} strokeWidth={3} />}
                </div>
                <div className="text-lg shrink-0">{w.emoji}</div>
                <div className="text-xs font-bold truncate flex-1">{w.title}</div>
                {w.price && (
                  <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">฿{w.price}</span>
                )}
                <input
                  type="checkbox"
                  className="hidden"
                  checked={selectedWishIds.has(w.id)}
                  onChange={() => toggleWishSelection(w.id)}
                />
              </label>
            ))
          )}
        </div>

        {/* Launch Button */}
        <div className="pt-2 shrink-0 relative z-10">
          <button
            type="button"
            onClick={startCinematicSpin}
            disabled={spinning || activeWishes.length < 2}
            className={`w-full py-4 rounded-full text-sm font-black tracking-wider uppercase shadow-xl transition-all flex items-center justify-center gap-2 ${
              spinning || activeWishes.length < 2
                ? 'opacity-50 cursor-not-allowed bg-stone-400 text-stone-200 shadow-none'
                : 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white shadow-rose-500/40 hover:scale-[1.02] active:scale-[0.98] animate-pulse'
            }`}
          >
            {activeWishes.length < 2 ? (
              'เลือกอย่างน้อย 2 รายการ'
            ) : spinning ? (
              <span className="flex items-center gap-2">
                <Sparkles size={16} className="animate-spin text-amber-300" /> กำลังสุ่มชะตา...
              </span>
            ) : winner ? (
              '🎲 สุ่มใหม่อีกครั้ง'
            ) : (
              '⚡ สุ่มของขวัญทันที! 🎰'
            )}
          </button>
        </div>
      </div>

      {/* ==================== 🌟 5-STAR CINEMATIC LEGENDARY REVEAL MODAL 🌟 ==================== */}
      {showWinnerShowcase && winner && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fade-in"
          onClick={() => setShowWinnerShowcase(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-[36px] p-8 text-center overflow-hidden shadow-[0_0_90px_rgba(251,191,36,0.6)] border-2 border-amber-400/90 bg-gradient-to-b from-stone-900 via-stone-950 to-black text-white animate-cinematic-pop"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Spinning Golden Volumetric Sunburst Light Rays */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
              <div className="w-[650px] h-[650px] bg-sunburst-cinematic animate-spin-slow" />
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowWinnerShowcase(false)}
              className="absolute top-5 right-5 p-2 text-stone-400 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all z-20"
            >
              <X size={18} />
            </button>

            {/* 5-STAR CELESTIAL RATING BADGE */}
            <div className="flex items-center justify-center gap-1 mb-3 text-amber-300 drop-shadow-[0_0_8px_#f59e0b] animate-star-entrance">
              <Star size={16} fill="#FCD34D" />
              <Star size={18} fill="#FCD34D" />
              <Star size={22} fill="#FCD34D" className="text-amber-300" />
              <Star size={18} fill="#FCD34D" />
              <Star size={16} fill="#FCD34D" />
            </div>

            {/* Grand Badge */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-stone-950 shadow-lg shadow-amber-500/40 uppercase tracking-widest mb-5">
              <Trophy size={14} /> ✦ LEGENDARY WISH UNLOCKED ✦
            </div>

            {/* Giant 3D Holographic Gift Showcase Box */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-amber-500/25 via-rose-500/25 to-purple-500/25 border-2 border-amber-400/50 flex items-center justify-center text-7xl shadow-[0_0_50px_rgba(251,191,36,0.4)] animate-gift-float">
                {winner.emoji || '🎁'}
              </div>
            </div>

            {/* Winner Title in Golden Metallic Foil Gradient */}
            <h2 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-rose-300 drop-shadow-md">
              {winner.title}
            </h2>

            {/* Winner Description */}
            {winner.description && (
              <p className="text-xs text-stone-300 mt-2 line-clamp-2 px-2 font-medium">
                {winner.description}
              </p>
            )}

            {/* Price Bullion Badge */}
            {winner.price && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 font-mono text-amber-300 font-extrabold text-sm shadow-inner">
                💰 ฿{winner.price}
              </div>
            )}

            {/* Author */}
            <div className="text-[11px] text-stone-400 mt-2.5 font-medium">
              ความปรารถนาของ <span className="text-rose-400 font-bold">@{winner.userName}</span> ✨
            </div>

            {/* Action Buttons */}
            <div className="mt-7 space-y-2.5">
              <button
                onClick={() => setShowWinnerShowcase(false)}
                className="w-full py-4 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-pink-500 text-white font-black text-sm shadow-xl shadow-rose-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                🎉 ซื้อให้คนพิเศษทันที!
              </button>
              <button
                onClick={() => {
                  setShowWinnerShowcase(false);
                  startCinematicSpin();
                }}
                className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-stone-300 font-bold text-xs transition-colors"
              >
                🎲 สุ่มใหม่อีกรอบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CINEMATIC KEYFRAME ANIMATIONS ==================== */}
      <style>{`
        @keyframes hyperRumble {
          0% { transform: translate(0, 0) rotate(0deg); }
          20% { transform: translate(-3px, 2px) rotate(-1deg); }
          40% { transform: translate(3px, -3px) rotate(1.2deg); }
          60% { transform: translate(-2px, -2px) rotate(-0.8deg); }
          80% { transform: translate(2px, 2px) rotate(0.6deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        .animate-hyper-rumble {
          animation: hyperRumble 0.12s infinite;
        }

        @keyframes tensePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.018); }
        }
        .animate-tense-pulse {
          animation: tensePulse 0.38s infinite;
        }

        @keyframes needleVibrate {
          0% { transform: translateY(0) rotate(-6deg); }
          100% { transform: translateY(-2px) rotate(6deg); }
        }
        .animate-needle-vibrate {
          animation: needleVibrate 0.06s infinite alternate;
        }

        @keyframes cinematicPop {
          0% { opacity: 0; transform: scale(0.65) translateY(40px); }
          65% { transform: scale(1.04) translateY(-6px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-cinematic-pop {
          animation: cinematicPop 0.45s cubic-bezier(0.18, 0.9, 0.3, 1) forwards;
        }

        @keyframes giftFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.05); }
        }
        .animate-gift-float {
          animation: giftFloat 2.8s infinite ease-in-out;
        }

        @keyframes starEntrance {
          0% { opacity: 0; transform: scale(0.3); }
          60% { transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-star-entrance {
          animation: starEntrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .bg-sunburst-cinematic {
          background: repeating-conic-gradient(
            from 0deg,
            rgba(251, 191, 36, 0.28) 0deg 15deg,
            transparent 15deg 30deg
          );
        }

        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spinSlow 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
