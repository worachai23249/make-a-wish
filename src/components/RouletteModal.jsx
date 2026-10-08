import React, { useState, useEffect, useRef } from 'react';
import { X, Volume2, VolumeX, Sparkles, Check, Heart, Star, Sparkle } from 'lucide-react';
import { sound } from '../audio';

// Dreamy Pastel Kawaii Minimal Color Palette
const pastelWheelColors = [
  { bg: '#FDA4AF', accent: '#FFF1F2' }, // Strawberry Cream
  { bg: '#FBCFE8', accent: '#FDF2F8' }, // Cotton Candy
  { bg: '#FDE68A', accent: '#FEFCE8' }, // Soft Vanilla
  { bg: '#A7F3D0', accent: '#ECFDF5' }, // Mint Macaron
  { bg: '#BAE6FD', accent: '#F0F9FF' }, // Cloud Sky
  { bg: '#DDD6FE', accent: '#F5F3FF' }, // Lavender Chiffon
  { bg: '#FED7AA', accent: '#FFF7ED' }, // Peach Sorbet
  { bg: '#C4B5FD', accent: '#EDE9FE' }, // Sweet Lilac
  { bg: '#FECDD3', accent: '#FFF1F2' }, // Cherry Blossom
  { bg: '#E9D5FF', accent: '#FAF5FF' }, // Fairy Purple
];

export default function RouletteModal({ isOpen, onClose, wishes, onConfetti }) {
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [showWinnerShowcase, setShowWinnerShowcase] = useState(false);
  const [rouletteCategory, setRouletteCategory] = useState('all');
  const [isMuted, setIsMuted] = useState(false);
  
  // Kawaii Magic States
  const [spinPhase, setSpinPhase] = useState('idle'); // 'idle' | 'hyper' | 'slowmo' | 'jackpot'
  const [sparks, setSparks] = useState([]);

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

  // ==================== DRAW KAWAII MINIMAL WHEEL ====================
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
      ctx.fillStyle = '#fdf4f5';
      ctx.fill();
      ctx.strokeStyle = '#fbcfe8';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ไม่มีรายการในห้องนี้ 🌸', centerX, centerY);
      return;
    }

    const numItems = activeWishes.length;
    const sliceAngle = (2 * Math.PI) / numItems;

    // 1. SOFT PASTEL AURORA RIM
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 6, 0, 2 * Math.PI);
    ctx.lineWidth = 8;
    ctx.strokeStyle = isFast ? '#F472B6' : '#FDA4AF';
    ctx.shadowColor = isFast ? 'rgba(244, 114, 182, 0.6)' : 'rgba(251, 113, 133, 0.3)';
    ctx.shadowBlur = isFast ? 20 : 10;
    ctx.stroke();
    ctx.restore();

    // 2. DRAW PASTEL SLICES
    activeWishes.forEach((wish, i) => {
      const startAngle = angleOffset + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const colorScheme = pastelWheelColors[i % pastelWheelColors.length];

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      // Soft Creamy Pastel Gradient Fill
      const grad = ctx.createRadialGradient(centerX, centerY, 15, centerX, centerY, radius);
      grad.addColorStop(0, colorScheme.bg);
      grad.addColorStop(1, colorScheme.bg + 'ee');
      ctx.fillStyle = grad;
      ctx.fill();

      // Clean White Separation Line
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw Emoji & Text
      const textAngle = startAngle + sliceAngle / 2;
      const textRadius = radius * 0.63;
      ctx.translate(centerX + Math.cos(textAngle) * textRadius, centerY + Math.sin(textAngle) * textRadius);
      ctx.rotate(textAngle + Math.PI / 2);

      // Cute Big Emoji
      ctx.font = '27px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 4;
      ctx.fillText(wish.emoji || '🎁', 0, -4);

      // Cute Label if slice is wide enough
      if (numItems <= 12) {
        ctx.font = '600 10px sans-serif';
        ctx.fillStyle = '#475569';
        ctx.shadowBlur = 0;
        const truncatedTitle = wish.title.length > 7 ? wish.title.slice(0, 7) + '..' : wish.title;
        ctx.fillText(truncatedTitle, 0, 16);
      }

      ctx.restore();
    });

    // 3. CENTER CUTE HEART BUTTON
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 24, 0, 2 * Math.PI);
    const centerGrad = ctx.createRadialGradient(centerX - 3, centerY - 3, 2, centerX, centerY, 24);
    centerGrad.addColorStop(0, '#FFFFFF');
    centerGrad.addColorStop(1, '#FFF1F2');
    ctx.fillStyle = centerGrad;
    ctx.shadowColor = 'rgba(244, 63, 94, 0.25)';
    ctx.shadowBlur = 8;
    ctx.fill();

    ctx.strokeStyle = '#FDA4AF';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Center Inner Dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, 7, 0, 2 * Math.PI);
    ctx.fillStyle = '#FB7185';
    ctx.fill();
    ctx.restore();
  };

  useEffect(() => {
    drawWheel(angleRef.current);
  }, [activeWishes.length]);

  // ==================== KAWAII OVER-THE-TOP SPIN ENGINE ====================
  const startHyperSpin = () => {
    if (activeWishes.length < 2 || spinning) return;

    setSpinning(true);
    setWinner(null);
    setShowWinnerShowcase(false);
    setSpinPhase('hyper');

    // Fairy Magic Launch sound
    sound.playHyperLaunch();

    const numItems = activeWishes.length;
    const sliceAngle = (2 * Math.PI) / numItems;

    // 12 to 16 full smooth rotations
    const spins = 12 + Math.random() * 4;
    const randomOffset = Math.random() * (2 * Math.PI);
    const targetAngle = angleRef.current + (spins * 2 * Math.PI) + randomOffset;

    let currentAngle = angleRef.current;
    let lastTickAngle = currentAngle;
    let lastHeartbeatTime = 0;

    const animate = () => {
      const remainingAngle = targetAngle - currentAngle;

      // Soft fluid deceleration
      const speed = Math.max(remainingAngle * 0.038, 0.003);
      currentAngle += speed;

      const isHyper = speed > 0.16;
      const isSlowmo = speed <= 0.055 && remainingAngle > 0.01;

      if (isHyper) {
        setSpinPhase('hyper');
      } else if (isSlowmo) {
        setSpinPhase('slowmo');

        // Cute Heartbeat ping during slow-mo tension
        const now = Date.now();
        if (now - lastHeartbeatTime > 400) {
          sound.playHeartbeat();
          lastHeartbeatTime = now;
        }
      }

      // Bubble tick sound
      const tickDelta = isHyper ? 0.32 : 0.22;
      if (Math.abs(currentAngle - lastTickAngle) > tickDelta) {
        const speedFactor = speed * 14;
        sound.playTick(speedFactor);
        lastTickAngle = currentAngle;

        // Sweet tiny pastel sparkles around pointer
        if (Math.random() > 0.4) {
          setSparks(prev => [
            ...prev.slice(-6),
            { id: Math.random(), x: (Math.random() - 0.5) * 36, y: Math.random() * 20 }
          ]);
        }
      }

      angleRef.current = currentAngle;
      drawWheel(currentAngle, isHyper);

      if (remainingAngle < 0.01) {
        // FINISHED! MAGIC WISH GRANTED!
        setSpinning(false);
        setSpinPhase('jackpot');
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

        // 🌸✨ DISNEY/GHIBLI MAGICAL HARP FANFARE + CONFETTI
        sound.playJackpotExplosion();
        onConfetti();

        // Reveal the Dreamy Showcase Card with soft spring bounce
        setTimeout(() => {
          setShowWinnerShowcase(true);
        }, 380);

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
      {/* Cute Rounded Minimal Glass Panel with Bouncy Jelly Wobble */}
      <div
        className={`glass-panel w-full max-w-sm p-6 sm:p-7 rounded-[32px] space-y-4 border-2 transition-all flex flex-col max-h-[92vh] relative ${
          spinPhase === 'hyper'
            ? 'border-pink-300 shadow-[0_0_40px_rgba(244,114,182,0.4)] animate-kawaii-wobble'
            : spinPhase === 'slowmo'
            ? 'border-purple-300 shadow-[0_0_35px_rgba(216,180,254,0.35)] animate-cute-pulse'
            : 'border-rose-400/20'
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

          <h3 className="font-extrabold text-base flex items-center gap-1.5">
            {spinPhase === 'hyper' ? (
              <span className="flex items-center gap-1 text-pink-500 animate-pulse">
                <Sparkles size={16} className="text-amber-400 animate-spin" /> หมุนความปรารถนา~ ✨
              </span>
            ) : spinPhase === 'slowmo' ? (
              <span className="flex items-center gap-1 text-purple-500 animate-pulse">
                <Heart size={16} className="text-rose-500 animate-bounce" /> ลุ้นนนนมากกก~ 🌸
              </span>
            ) : (
              <span className="flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                <Sparkles size={16} className="text-pink-400" /> วงล้อสุ่มของขวัญ 🌸
              </span>
            )}
          </h3>

          <button
            onClick={() => !spinning && onClose()}
            className="p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-500/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex gap-1 justify-center bg-rose-500/8 p-1 rounded-full shrink-0 relative z-10 border border-rose-500/10">
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
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Wheel Showcase Area */}
        <div className="relative flex justify-center py-2 shrink-0">
          {/* CUTE POINTER WITH HEART BADGE & SWEET SPARKLES */}
          <div className="absolute top-0 z-20 flex flex-col items-center">
            {/* Sweet Floating Sparkles */}
            {sparks.map((s) => (
              <div
                key={s.id}
                className="absolute w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#f59e0b] animate-spark-float pointer-events-none"
                style={{ transform: `translate(${s.x}px, ${s.y}px)` }}
              />
            ))}

            {/* Minimal Pearl Badge on Pointer */}
            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-rose-500 to-pink-400 shadow-sm flex items-center justify-center -mb-1 z-10 border-2 border-white" />

            {/* Rose Pink Arrow Needle */}
            <div
              className={`w-0 h-0 transition-transform ${
                spinPhase === 'hyper' ? 'animate-needle-wiggle' : ''
              }`}
              style={{
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderTop: '18px solid #F43F5E',
                filter: 'drop-shadow(0 2px 4px rgba(244, 63, 94, 0.4))',
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
                  ? 'shadow-[0_0_30px_rgba(244,114,182,0.5)]'
                  : 'shadow-md'
              }`}
            />
          </div>
        </div>

        {/* Winner Announcement Inline Preview */}
        {winner && !showWinnerShowcase && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-500/15 via-rose-500/15 to-purple-500/15 border border-pink-400/30 text-rose-500 font-extrabold text-xs animate-bounce flex items-center justify-center gap-1.5 shrink-0 shadow-sm">
            <Sparkles size={15} className="text-pink-500" />
            ผู้โชคดีได้รับ: {winner.title}! 🌸
          </div>
        )}

        {/* Checkbox List of Eligible Wishes */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1 relative z-10">
          {baseEligibleWishes.length === 0 ? (
            <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/10 space-y-1.5 text-center mt-2">
              <div className="text-3xl">🌸</div>
              <div className="font-bold text-xs text-stone-600 dark:text-stone-300">ไม่มีรายการที่ยังไม่ได้ซื้อในหมวดนี้</div>
              <p className="text-[11px] text-stone-400">ลองเปลี่ยนหมวดหมู่หรือเพิ่มความปรารถนาใหม่</p>
            </div>
          ) : (
            baseEligibleWishes.map((w) => (
              <label
                key={w.id}
                className={`flex items-center gap-3 p-2.5 rounded-2xl border cursor-pointer transition-all ${
                  selectedWishIds.has(w.id)
                    ? 'bg-rose-500/8 border-rose-500/25'
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
            onClick={startHyperSpin}
            disabled={spinning || activeWishes.length < 2}
            className={`w-full py-3.5 rounded-full text-sm font-extrabold shadow-lg transition-all flex items-center justify-center gap-2 ${
              spinning || activeWishes.length < 2
                ? 'opacity-50 cursor-not-allowed bg-stone-300 text-stone-500 shadow-none'
                : 'bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500 text-white shadow-rose-400/30 hover:scale-[1.015] active:scale-[0.98]'
            }`}
          >
            {activeWishes.length < 2 ? (
              'เลือกอย่างน้อย 2 รายการ'
            ) : spinning ? (
              <span className="flex items-center gap-2">
                <Sparkles size={16} className="animate-spin text-white" /> กำลังหมุนความปรารถนา... 🌸
              </span>
            ) : winner ? (
              '🎲 สุ่มใหม่อีกครั้ง'
            ) : (
              '✨ สุ่มความปรารถนาเลย! 🌸'
            )}
          </button>
        </div>
      </div>

      {/* ==================== 🌸✨ DREAMY KAWAII MINIMALIST WINNER SHOWCASE MODAL ✨🌸 ==================== */}
      {showWinnerShowcase && winner && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-fade-in"
          onClick={() => setShowWinnerShowcase(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-[36px] p-8 text-center overflow-hidden shadow-2xl border border-pink-300/40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl animate-kawaii-pop text-stone-800 dark:text-stone-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dreamy Pastel Aurora Halo in Background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
              <div className="w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-pink-300 via-purple-200 to-rose-300 dark:from-pink-900/30 dark:via-purple-900/30 animate-spin-slow filter blur-3xl" />
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowWinnerShowcase(false)}
              className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full hover:bg-stone-500/10 transition-colors z-20"
            >
              <X size={18} />
            </button>

            {/* Sweet Minimal Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold bg-gradient-to-r from-pink-500/15 via-rose-500/15 to-purple-500/15 text-rose-500 border border-pink-300/40 shadow-sm uppercase tracking-wider mb-5 animate-bounce">
              <Sparkles size={14} className="text-pink-500" />
              🌸 WISH COME TRUE! 🌸
            </div>

            {/* Giant Squishy Bouncing Emoji with Pastel Aura */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-pink-100 to-rose-100 dark:from-pink-950/40 dark:to-rose-950/40 border border-pink-200/50 flex items-center justify-center text-7xl shadow-xl shadow-pink-500/20 animate-squishy-float">
                {winner.emoji || '🎁'}
              </div>
            </div>

            {/* Winner Title */}
            <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              {winner.title}
            </h2>

            {/* Winner Description */}
            {winner.description && (
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 line-clamp-2 px-2 font-medium">
                {winner.description}
              </p>
            )}

            {/* Price Badge */}
            {winner.price && (
              <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 font-mono text-amber-600 dark:text-amber-400 font-bold text-xs">
                💰 ฿{winner.price}
              </div>
            )}

            {/* Author */}
            <div className="text-[11px] text-stone-400 mt-2 font-medium">
              ความปรารถนาของ <span className="text-rose-500 font-bold">@{winner.userName}</span> 💕
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-2">
              <button
                onClick={() => setShowWinnerShowcase(false)}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500 text-white font-extrabold text-sm shadow-lg shadow-rose-400/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                🎉 ซื้อให้คนพิเศษเลย! 💕
              </button>
              <button
                onClick={() => {
                  setShowWinnerShowcase(false);
                  startHyperSpin();
                }}
                className="w-full py-2.5 rounded-full hover:bg-stone-500/10 text-stone-500 dark:text-stone-400 font-bold text-xs transition-colors"
              >
                🎲 สุ่มใหม่อีกรอบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== KAWAII ANIMATIONS STYLES ==================== */}
      <style>{`
        @keyframes kawaiiWobble {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-0.8deg) scale(1.008); }
          50% { transform: rotate(0.8deg) scale(0.996); }
          75% { transform: rotate(-0.5deg) scale(1.004); }
          100% { transform: rotate(0deg) scale(1); }
        }
        .animate-kawaii-wobble {
          animation: kawaiiWobble 0.22s infinite ease-in-out;
        }

        @keyframes cutePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.012); }
        }
        .animate-cute-pulse {
          animation: cutePulse 0.45s infinite ease-in-out;
        }

        @keyframes needleWiggle {
          0% { transform: rotate(-6deg); }
          100% { transform: rotate(6deg); }
        }
        .animate-needle-wiggle {
          animation: needleWiggle 0.08s infinite alternate ease-in-out;
        }

        @keyframes sparkFloat {
          0% { opacity: 1; transform: translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(12px, -20px) scale(0.4); }
        }
        .animate-spark-float {
          animation: sparkFloat 0.45s ease-out forwards;
        }

        @keyframes kawaiiPop {
          0% { opacity: 0; transform: scale(0.7) translateY(30px); }
          65% { transform: scale(1.04) translateY(-4px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-kawaii-pop {
          animation: kawaiiPop 0.42s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes squishyFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.04); }
        }
        .animate-squishy-float {
          animation: squishyFloat 2.6s infinite ease-in-out;
        }

        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spinSlow 24s linear infinite;
        }
      `}</style>
    </div>
  );
}
