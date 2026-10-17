import React, { useRef, useState } from 'react';
import { X, Download, Share2, Copy, Check, Sparkles, Heart } from 'lucide-react';

export default function ShareStoryCardModal({ isOpen, onClose, space, wishes, onCopyLink, showToast }) {
  const cardRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !space) return null;

  // Filter top unfulfilled or recent wishes
  const storyWishes = (wishes || []).slice(0, 4);
  const shareUrl = `${window.location.origin}?join=${space.inviteCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    showToast('คัดลอกลิงก์แชร์แล้ว 📋', shareUrl);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = async () => {
    setIsGenerating(true);
    try {
      // Use HTML5 Canvas to draw a crisp high-res story graphic (720x1280)
      const width = 720;
      const height = 1200;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // 1. Background (White + Pastel Sky Blue Gingham Plaid)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Draw Gingham Plaid Pattern
      ctx.fillStyle = 'rgba(186, 230, 253, 0.45)';
      const gridSize = 48;
      for (let x = 0; x < width; x += gridSize * 2) {
        ctx.fillRect(x, 0, gridSize, height);
      }
      for (let y = 0; y < height; y += gridSize * 2) {
        ctx.fillRect(0, y, width, gridSize);
      }

      // Soft ambient blue glow in center
      const radial = ctx.createRadialGradient(width / 2, height / 2, 80, width / 2, height / 2, 450);
      radial.addColorStop(0, 'rgba(224, 242, 254, 0.85)');
      radial.addColorStop(1, 'rgba(255, 255, 255, 0.3)');
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, width, height);

      // 2. Main Glass Card Container
      const cardX = 45;
      const cardY = 70;
      const cardW = width - 90;
      const cardH = height - 140;
      const radius = 48;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, radius);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
      ctx.shadowColor = 'rgba(14, 165, 233, 0.28)';
      ctx.shadowBlur = 36;
      ctx.shadowOffsetY = 16;
      ctx.fill();

      // Card border
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();
      ctx.restore();

      // 3. Header Branding
      ctx.textAlign = 'center';
      ctx.fillStyle = '#0284c7';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('✨ MAKE A WISH — LUXURY WISHLIST ✨', width / 2, 130);

      // Space Emoji & Name
      ctx.font = '64px sans-serif';
      ctx.fillText(space.emoji || '💕', width / 2, 215);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(space.name, width / 2, 275);

      // Invite Code Pill
      ctx.fillStyle = '#e0f2fe';
      const pillW = 220;
      const pillH = 44;
      const pillX = (width - pillW) / 2;
      const pillY = 300;
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 22);
      ctx.fill();
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#0369a1';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`CODE: #${space.inviteCode}`, width / 2, 330);

      // Subtitle
      ctx.fillStyle = '#64748b';
      ctx.font = '18px sans-serif';
      ctx.fillText('ความปรารถนาและของขวัญที่รอการส่งมอบ 🎁', width / 2, 385);

      // 4. Wishes List (Up to 4 items)
      let currentY = 425;
      storyWishes.forEach((w, idx) => {
        const itemX = 75;
        const itemW = width - 150;
        const itemH = 110;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(itemX, currentY, itemW, itemH, 24);
        ctx.fillStyle = 'rgba(240, 249, 255, 0.85)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // Emoji box
        ctx.font = '36px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(w.emoji || '🎁', itemX + 45, currentY + 68);

        // Title
        ctx.textAlign = 'left';
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 22px sans-serif';
        const displayTitle = w.title.length > 22 ? w.title.slice(0, 22) + '...' : w.title;
        ctx.fillText(displayTitle, itemX + 85, currentY + 48);

        // Priority tag & Price
        ctx.font = '16px sans-serif';
        if (w.priority === 'must_have') {
          ctx.fillStyle = '#ef4444';
          ctx.fillText('🔥 อยากได้มากที่สุด', itemX + 85, currentY + 84);
        } else if (w.priority === 'nice_to_have') {
          ctx.fillStyle = '#0284c7';
          ctx.fillText('💡 มีก็ดี', itemX + 85, currentY + 84);
        } else {
          ctx.fillStyle = '#f59e0b';
          ctx.fillText('✨ อยากได้มาก', itemX + 85, currentY + 84);
        }

        if (w.price) {
          ctx.textAlign = 'right';
          ctx.fillStyle = '#0284c7';
          ctx.font = 'bold 22px monospace';
          ctx.fillText(`฿${w.price}`, itemX + itemW - 25, currentY + 65);
        }

        currentY += 130;
      });

      // 5. Footer info
      ctx.textAlign = 'center';
      ctx.fillStyle = '#0284c7';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('เปิดแอปแล้วใส่รหัสเพื่อดูรายการทั้งหมด ✨', width / 2, height - 190);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '15px sans-serif';
      ctx.fillText('Make a Wish • Luxury Private Wishlist Platform', width / 2, height - 160);

      // Download triggered
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `MakeAWish-${space.inviteCode}.png`;
      a.click();
      showToast('บันทึกรูปภาพสำเร็จ 🎨', 'พร้อมสำหรับโพสต์ลง IG Story หรือ LINE');
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการสร้างภาพ', String(err));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) {
      handleCopy();
      return;
    }

    try {
      // Try generating story image blob for rich sharing
      const width = 720;
      const height = 1200;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Draw background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Radial center glow
      const radial = ctx.createRadialGradient(width / 2, height / 2, 80, width / 2, height / 2, 450);
      radial.addColorStop(0, 'rgba(224, 242, 254, 0.9)');
      radial.addColorStop(1, 'rgba(255, 255, 255, 0.4)');
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, width, height);

      // Card
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(45, 70, width - 90, height - 140, 48);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();
      ctx.restore();

      // Header Branding
      ctx.textAlign = 'center';
      ctx.fillStyle = '#0284c7';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('✨ MAKE A WISH — LUXURY WISHLIST ✨', width / 2, 130);

      // Space Emoji & Name
      ctx.font = '64px sans-serif';
      ctx.fillText(space.emoji || '💕', width / 2, 215);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(space.name, width / 2, 275);

      // Convert canvas to blob
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      const file = blob ? new File([blob], `MakeAWish-${space.inviteCode}.png`, { type: 'image/png' }) : null;

      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Wishlist: ${space.name} 🎁`,
          text: `ใส่รหัส #${space.inviteCode} ใน Make a Wish เพื่อแชร์ความปรารถนาร่วมกัน! ✨`,
          url: shareUrl,
        });
      } else {
        await navigator.share({
          title: `Wishlist: ${space.name} 🎁`,
          text: `ใส่รหัส #${space.inviteCode} ใน Make a Wish เพื่อแชร์ความปรารถนาร่วมกัน! ✨`,
          url: shareUrl,
        });
      }
      showToast('แชร์สำเร็จ 💌');
    } catch (_) {}
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel w-full max-w-lg p-6 sm:p-8 rounded-[40px] space-y-5 border-sky-300/40 dark:border-sky-500/30 shadow-2xl relative animate-fade-in max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles size={18} className="text-[#00a6ff]" /> การ์ดแชร์ Wishlist 🎨
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              การ์ดสไตล์ Story สำหรับโพสต์ลง Instagram Story หรือแชร์ใน LINE
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-500/10 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Story Preview Card */}
        <div
          ref={cardRef}
          className="rounded-[32px] p-6 text-center space-y-4 border-2 border-white shadow-xl relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-sky-100"
        >
          {/* Subtle plaid lines inside card */}
          <div className="text-[10px] font-black tracking-widest text-sky-500 uppercase">
            ✨ MAKE A WISH — PRIVATE WISHLIST ✨
          </div>

          <div className="w-16 h-16 rounded-3xl bg-white border border-white shadow-md mx-auto flex items-center justify-center text-3xl">
            {space.emoji}
          </div>

          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">{space.name}</h2>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sky-100 border border-sky-200 text-sky-700 text-xs font-mono font-bold mt-2">
              #{space.inviteCode}
            </div>
          </div>

          {/* Top wishes list */}
          <div className="space-y-2 text-left pt-2">
            {storyWishes.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-4">ยังไม่มีรายการของขวัญในห้องนี้</div>
            ) : (
              storyWishes.map((w) => (
                <div
                  key={w.id}
                  className="p-3 rounded-2xl bg-white/90 border border-sky-100 flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl shrink-0">{w.emoji}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">{w.title}</div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        {w.priority === 'must_have' ? '🔥 อยากได้มากที่สุด' : w.priority === 'nice_to_have' ? '💡 มีก็ดี' : '✨ อยากได้มาก'}
                      </div>
                    </div>
                  </div>
                  {w.price && (
                    <span className="text-xs font-mono font-black text-sky-600 shrink-0">฿{w.price}</span>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="pt-2 text-[10px] text-slate-400 font-medium">
            ใส่รหัส #{space.inviteCode} ใน Make a Wish เพื่อแชร์และมอบของขวัญร่วมกัน
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleDownloadImage}
            disabled={isGenerating}
            className="btn-primary py-3 px-4 text-xs font-bold flex items-center justify-center gap-2"
          >
            <Download size={15} /> {isGenerating ? 'กำลังสร้างภาพ...' : 'บันทึกรูปภาพ'}
          </button>
          <button
            onClick={handleNativeShare}
            className="btn-secondary py-3 px-4 text-xs font-bold flex items-center justify-center gap-2"
          >
            <Share2 size={15} /> แชร์ลงโซเชียล
          </button>
        </div>

        <button
          onClick={handleCopy}
          className="w-full py-2.5 rounded-2xl bg-sky-50 hover:bg-sky-100 text-[#0284c7] border border-sky-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          คัดลอกลิงก์เข้าร่วมห้องด่วน
        </button>
      </div>
    </div>
  );
}
