import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2, VolumeX, Sparkles, Check, Flame, Trophy, Zap, Star } from 'lucide-react';
import { sound } from '../audio';

// Rich Super Vibrant High-Energy Colors for Wheel
const wheelColors = [
  { bg: '#F43F5E', text: '#FFFFFF', border: '#FFF1F2' }, // Blazing Ruby
  { bg: '#8B5CF6', text: '#FFFFFF', border: '#F5F3FF' }, // Cosmic Purple
  { bg: '#F59E0B', text: '#FFFFFF', border: '#FFFBEB' }, // Radiant Gold
  { bg: '#10B981', text: '#FFFFFF', border: '#ECFDF5' }, // Emerald Glow
  { bg: '#06B6D4', text: '#FFFFFF', border: '#ECFEFF' }, // Cyan Laser
  { bg: '#EC4899', text: '#FFFFFF', border: '#FDF2F8' }, // Neon Pink
  { bg: '#F97316', text: '#FFFFFF', border: '#FFF7ED' }, // Hyper Orange
  { bg: '#6366F1', text: '#FFFFFF', border: '#EEF2FF' }, // Royal Indigo
  { bg: '#14B8A6', text: '#FFFFFF', border: '#F0FDFA' }, // Mint Magic
  { bg: '#EAB308', text: '#FFFFFF', border: '#FEFCE8' }, // Sunburst Yellow
];

export default function RouletteModal({ isOpen, onClose, wishes, onConfetti }) {
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [showWinnerShowcase, setShowWinnerShowcase] = useState(false);
  const [rouletteCategory, setRouletteCategory] = useState('all');
  const [isMuted, setIsMuted] = useState(false);
  
  // Over-the-top FX states
  const [spinPhase, setSpinPhase] = useState('idle'); // 'idle' | 'hyper' | 'slowmo' | 'jackpot'
  const [shakeIntensity, setShakeIntensity] = useState(0); // 0 (none), 1 (light), 2 (hyper)
  const [sparks, setSparks] = useState([]);

  // Checkbox selections
  const [selectedWishIds, setSelectedWishIds] = useState(new Set());
  
  // Canvas refs
  const canvasRef = useRef(null);
  const fxCanvasRef = useRef(null);
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

  // ==================== DRAW HIGH-TECH CASINO WHEEL ====================
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
      ctx.fillStyle = '#f5f5f4';
      ctx.fill();
      ctx.strokeStyle = '#e7e5e4';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#a8a29e';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ไม่มีรายการ', centerX, centerY);
      return;
    }

    const numItems = activeWishes.length;
    const sliceAngle = (2 * Math.PI) / numItems;

    // 1. OUTER CHASE LIGHTS RIM
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI);
    ctx.lineWidth = 10;
    ctx.strokeStyle = isFast ? '#F59E0B' : '#FB7185';
    ctx.shadowColor = isFast ? '#F59E0B' : '#F43F5E';
    ctx.shadowBlur = isFast ? 24 : 12;
    ctx.stroke();
    ctx.restore();

    // 2. DRAW SLICES
    activeWishes.forEach((wish, i) => {
      const startAngle = angleOffset + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const colorScheme = wheelColors[i % wheelColors.length];

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      // Gradient Fill
      const grad = ctx.createRadialGradient(centerX, centerY, 15, centerX, centerY, radius);
      grad.addColorStop(0, colorScheme.bg);
      grad.addColorStop(1, colorScheme.bg + 'dd');
      ctx.fillStyle = grad;
      ctx.fill();

      // Slice Separation Rim
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Draw Emoji & Text
      const textAngle = startAngle + sliceAngle / 2;
      const textRadius = radius * 0.62;
      ctx.translate(centerX + Math.cos(textAngle) * textRadius, centerY + Math.sin(textAngle) * textRadius);
      ctx.rotate(textAngle + Math.PI / 2);

      // Emoji
      ctx.font = '28px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 6;
      ctx.fillText(wish.emoji || '🎁', 0, -4);

      // Short Label
      if (numItems <= 12) {
        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 4;
        const truncatedTitle = wish.title.length > 7 ? wish.title.slice(0, 7) + '..' : wish.title;
        ctx.fillText(truncatedTitle, 0, 16);
      }

      ctx.restore();
    });

    // 3. CENTER GOLDEN HUB / MEDALLION
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 24, 0, 2 * Math.PI);
    const centerGrad = ctx.createRadialGradient(centerX - 4, centerY - 4, 3, centerX, centerY, 24);
    centerGrad.addColorStop(0, '#FDE047');
    centerGrad.addColorStop(0.7, '#EAB308');
    centerGrad.addColorStop(1, '#CA8A04');
    ctx.fillStyle = centerGrad;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center Crown Icon
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👑', centerX, centerY);
    ctx.restore();
  };

  useEffect(() => {
    drawWheel(angleRef.current);
  }, [activeWishes.length]);

  // ==================== OVER-THE-TOP SPIN ENGINE ====================
  const startHyperSpin = () => {
    if (activeWishes.length < 2 || spinning) return;

    setSpinning(true);
    setWinner(null);
    setShowWinnerShowcase(false);
    setSpinPhase('hyper');
    setShakeIntensity(2);

    // Hyper Launch sound effect
    sound.playHyperLaunch();

    const numItems = activeWishes.length;
    const sliceAngle = (2 * Math.PI) / numItems;

    // Intense target distance: 12 - 18 full hyper-rotations
    const spins = 12 + Math.random() * 6;
    const randomOffset = Math.random() * (2 * Math.PI);
    const targetAngle = angleRef.current + (spins * 2 * Math.PI) + randomOffset;

    let currentAngle = angleRef.current;
    let lastTickAngle = currentAngle;
    let lastHeartbeatTime = 0;

    const animate = () => {
      const remainingAngle = targetAngle - currentAngle;
      const progressRatio = 1 - (remainingAngle / (targetAngle - angleRef.current));

      // Ease out animation
      const speed = Math.max(remainingAngle * 0.038, 0.003);
      currentAngle += speed;

      // Phase calculation
      const isHyper = speed > 0.18;
      const isSlowmo = speed <= 0.06 && remainingAngle > 0.01;

      if (isHyper) {
        setSpinPhase('hyper');
        setShakeIntensity(2);
      } else if (isSlowmo) {
        setSpinPhase('slowmo');
        setShakeIntensity(1);

        // Dramatic Heartbeat audio trigger
        const now = Date.now();
        if (now - lastHeartbeatTime > 380) {
          sound.playHeartbeat();
          lastHeartbeatTime = now;
        }
      }

      // Dynamic Tick sound frequency based on velocity
      const tickDelta = isHyper ? 0.32 : 0.22;
      if (Math.abs(currentAngle - lastTickAngle) > tickDelta) {
        const speedFactor = speed * 15;
        sound.playTick(speedFactor);
        lastTickAngle = currentAngle;

        // Create tiny pointer sparks
        if (Math.random() > 0.4) {
          setSparks(prev => [
            ...prev.slice(-6),
            { id: Math.random(), x: (Math.random() - 0.5) * 30, y: Math.random() * 20 }
          ]);
        }
      }

      angleRef.current = currentAngle;
      drawWheel(currentAngle, isHyper);

      // Check if finished
      if (remainingAngle < 0.01) {
        // FINISHED! CRITICAL HIT / JACKPOT PHASE!
        setSpinning(false);
        setSpinPhase('jackpot');
        setShakeIntensity(0);
        angleRef.current = currentAngle;

        // Calculate Winner (Pointer at top = 270 degrees / 3*PI/2)
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

        // 💥 OVER-THE-TOP IMPACT EXPLOSION
        sound.playJackpotExplosion();
        onConfetti();

        // Delay opening the Super Showcase Dialog by 400ms for maximal shock impact
        setTimeout(() => {
          setShowWinnerShowcase(true);
        }, 450);

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
      {/* Dynamic Screen Shake Container */}
      <div
        className={`glass-panel w-full max-w-sm p-6 sm:p-7 rounded-3xl space-y-4 border-2 transition-all flex flex-col max-h-[92vh] relative ${
          spinPhase === 'hyper'
            ? 'border-amber-400 shadow-[0_0_50px_rgba(251,191,36,0.5)] animate-hyper-rumble'
            : spinPhase === 'slowmo'
            ? 'border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.4)] animate-tense-pulse'
            : 'border-rose-500/30'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* SPEED LINES RADIAL OVERLAY DURING HYPER SPIN */}
        {spinPhase === 'hyper' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-0 opacity-40">
            <div className="absolute inset-0 bg-radial-gradient animate-speed-lines" />
          </div>
        )}

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

          <h3 className="font-extrabold text-base flex items-center gap-1.5">
            {spinPhase === 'hyper' ? (
              <span className="flex items-center gap-1 text-amber-500 animate-pulse">
                <Flame size={18} className="text-orange-500 animate-bounce" /> ⚡ HYPER SPEED! ⚡
              </span>
            ) : spinPhase === 'slowmo' ? (
              <span className="flex items-center gap-1 text-purple-500 animate-pulse">
                <Zap size={18} className="text-amber-400 animate-spin" /> ลุ้นนนนนน! 💓
              </span>
            ) : (
              <>🎰 วงล้อสุ่มของขวัญ</>
            )}
          </h3>

          <button
            onClick={() => !spinning && onClose()}
            className="p-2 text-stone-400 hover:text-stone-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex gap-1 justify-center bg-stone-500/10 p-1 rounded-full shrink-0 relative z-10">
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
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                rouletteCategory === cat.id
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Wheel Showcase Area */}
        <div className="relative flex justify-center py-2 shrink-0">
          {/* POINTER NEEDLE WITH GLOW & FLAPPING ANIMATION */}
          <div className="absolute top-0 z-20 flex flex-col items-center">
            {/* Pointer Sparkles */}
            {sparks.map((s) => (
              <div
                key={s.id}
                className="absolute w-1.5 h-1.5 rounded-full bg-amber-300 animate-spark pointer-events-none"
                style={{ transform: `translate(${s.x}px, ${s.y}px)` }}
              />
            ))}

            {/* Glowing Pointer Triangle */}
            <div
              className={`w-0 h-0 transition-transform ${
                spinPhase === 'hyper' ? 'scale-125 animate-needle-vibrate' : ''
              }`}
              style={{
                borderLeft: '11px solid transparent',
                borderRight: '11px solid transparent',
                borderTop: '20px solid #F43F5E',
                filter: 'drop-shadow(0 0 10px rgba(244, 63, 94, 0.8))',
              }}
            />
          </div>

          {/* HTML5 Wheel Canvas */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={290}
              height={290}
              className={`rounded-full transition-all ${
                spinPhase === 'hyper'
                  ? 'shadow-[0_0_35px_rgba(251,191,36,0.6)]'
                  : 'shadow-lg'
              }`}
            />
          </div>
        </div>

        {/* Winner Announcement Inline Preview */}
        {winner && !showWinnerShowcase && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 border border-amber-500/40 text-rose-500 dark:text-rose-400 font-extrabold text-xs animate-bounce flex items-center justify-center gap-1.5 shrink-0 shadow-lg">
            <Sparkles size={16} className="text-amber-500" />
            ผู้โชคดีได้รับ: {winner.title}! 🎉
          </div>
        )}

        {/* Checkbox List of Eligible Wishes */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1 relative z-10">
          {baseEligibleWishes.length === 0 ? (
            <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/15 space-y-2 text-center mt-2">
              <div className="text-3xl">💫</div>
              <div className="font-bold text-xs">ไม่มีรายการที่ยังไม่ได้ซื้อในหมวดนี้</div>
              <p className="text-[11px] text-stone-400">ลองเปลี่ยนหมวดหมู่หรือเพิ่มความปรารถนาใหม่</p>
            </div>
          ) : (
            baseEligibleWishes.map((w) => (
              <label
                key={w.id}
                className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  selectedWishIds.has(w.id)
                    ? 'bg-rose-500/10 border-rose-500/30'
                    : 'bg-transparent border-stone-200 dark:border-stone-800 opacity-50'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                    selectedWishIds.has(w.id)
                      ? 'bg-rose-500 border-rose-500 text-white'
                      : 'border-stone-300 dark:border-stone-600'
                  }`}
                >
                  {selectedWishIds.has(w.id) && <Check size={14} strokeWidth={3} />}
                </div>
                <div className="text-lg shrink-0">{w.emoji}</div>
                <div className="text-xs font-bold truncate flex-1">{w.title}</div>
                {w.price && (
                  <span className="text-[10px] font-mono font-bold text-amber-500">฿{w.price}</span>
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

        {/* Launch Hyper Spin Button */}
        <div className="pt-2 shrink-0 relative z-10">
          <button
            type="button"
            onClick={startHyperSpin}
            disabled={spinning || activeWishes.length < 2}
            className={`btn-primary w-full py-4 text-sm font-extrabold tracking-wide uppercase shadow-xl transition-all ${
              spinning || activeWishes.length < 2
                ? 'opacity-50 cursor-not-allowed bg-stone-400 shadow-none'
                : 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:scale-[1.02] active:scale-[0.98] shadow-rose-500/30 animate-pulse'
            }`}
          >
            {activeWishes.length < 2 ? (
              'เลือกอย่างน้อย 2 รายการ'
            ) : spinning ? (
              <span className="flex items-center justify-center gap-2">
                <Flame size={18} className="animate-spin text-amber-300" /> กำลังสุ่มชะตา...
              </span>
            ) : winner ? (
              'สุ่มใหม่อีกครั้ง 🎲'
            ) : (
              '🔥 กดสุ่มของขวัญทันที! 🎰'
            )}
          </button>
        </div>
      </div>

      {/* ==================== 👑 SSR OVER-THE-TOP WINNER SHOWCASE MODAL 👑 ==================== */}
      {showWinnerShowcase && winner && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in"
          onClick={() => setShowWinnerShowcase(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-3xl p-8 text-center text-white overflow-hidden shadow-[0_0_80px_rgba(251,191,36,0.6)] border-2 border-amber-400/80 bg-gradient-to-b from-stone-900 via-stone-900/95 to-black animate-jackpot-pop"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Spinning Golden Sunburst God Rays */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
              <div className="w-[600px] h-[600px] bg-sunburst animate-spin-slow" />
            </div>

            {/* Glowing Corner Stars */}
            <div className="absolute top-4 left-4 text-amber-300 animate-ping">✨</div>
            <div className="absolute top-4 right-4 text-amber-300 animate-ping [animation-delay:200ms]">✨</div>

            {/* Close Button */}
            <button
              onClick={() => setShowWinnerShowcase(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all z-20"
            >
              <X size={18} />
            </button>

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-stone-950 shadow-lg shadow-amber-500/40 uppercase tracking-widest mb-6 animate-bounce">
              <Trophy size={14} /> 👑 CRITICAL JACKPOT! 👑
            </div>

            {/* Huge 3D Floating Emoji */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-amber-500/20 to-rose-500/20 border border-amber-400/30 flex items-center justify-center text-7xl shadow-2xl shadow-amber-500/30 animate-pulse-glow">
                {winner.emoji || '🎁'}
              </div>
            </div>

            {/* Winner Title */}
            <h2 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-rose-300 drop-shadow-md">
              {winner.title}
            </h2>

            {/* Winner Description / Info */}
            {winner.description && (
              <p className="text-xs text-stone-300 mt-2 line-clamp-2 px-2 font-medium">
                {winner.description}
              </p>
            )}

            {/* Price Badge */}
            {winner.price && (
              <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/30 font-mono text-amber-300 font-bold text-sm">
                💰 ฿{winner.price}
              </div>
            )}

            {/* Author */}
            <div className="text-[11px] text-stone-400 mt-2 font-medium">
              รายการของความปรารถนา: <span className="text-rose-400 font-bold">@{winner.userName}</span>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-2">
              <button
                onClick={() => setShowWinnerShowcase(false)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-rose-500 to-pink-500 text-white font-extrabold text-sm shadow-xl shadow-rose-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                🎉 ได้รับความปรารถนานี้แล้ว!
              </button>
              <button
                onClick={() => {
                  setShowWinnerShowcase(false);
                  startHyperSpin();
                }}
                className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-stone-300 font-bold text-xs transition-colors"
              >
                🎲 สุ่มใหม่อีกรอบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CUSTOM KEYFRAMES STYLES ==================== */}
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
          50% { transform: scale(1.015); }
        }
        .animate-tense-pulse {
          animation: tensePulse 0.4s infinite;
        }

        @keyframes needleVibrate {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-2px) rotate(-8deg); }
          100% { transform: translateY(0) rotate(8deg); }
        }
        .animate-needle-vibrate {
          animation: needleVibrate 0.06s infinite alternate;
        }

        @keyframes sparkFly {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.2) translate(10px, 15px); }
        }
        .animate-spark {
          animation: sparkFly 0.3s ease-out forwards;
        }

        @keyframes jackpotPop {
          0% { opacity: 0; transform: scale(0.6) translateY(40px); }
          70% { transform: scale(1.06) translateY(-5px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-jackpot-pop {
          animation: jackpotPop 0.45s cubic-bezier(0.18, 0.9, 0.3, 1) forwards;
        }

        .bg-sunburst {
          background: repeating-conic-gradient(
            from 0deg,
            rgba(251, 191, 36, 0.25) 0deg 15deg,
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
