import React, { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';

export default function AddWishModal({ isOpen, onClose, onSubmit }) {
  const [wishForm, setWishForm] = useState({
    title: '',
    description: '',
    category: 'item',
    priority: 'high',
    price: '',
    linkUrl: '',
    emoji: '🎁',
    imageUrl: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!wishForm.title.trim()) return;
    onSubmit(wishForm);
    setWishForm({
      title: '',
      description: '',
      category: 'item',
      priority: 'high',
      price: '',
      linkUrl: '',
      emoji: '🎁',
      imageUrl: '',
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel w-full max-w-md p-6 sm:p-8 rounded-[36px] space-y-4 border-sky-300/40 dark:border-sky-500/30 shadow-2xl relative animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles size={18} className="text-sky-500" /> ขอของขวัญ / ความปรารถนา ✦
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-500/10 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">หมวดหมู่</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'item', label: '🎁 สิ่งของ', emoji: '🎁' },
                { id: 'food', label: '🍜 อาหาร', emoji: '🍲' },
                { id: 'place', label: '📍 สถานที่', emoji: '🏖️' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setWishForm({ ...wishForm, category: c.id, emoji: c.emoji })}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                    wishForm.category === c.id
                      ? 'border-sky-300 bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 shadow-sm shadow-sky-200/50'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-sky-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">ระดับความอยากได้</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'must_have', label: '🔥 อยากได้มากสุด', color: 'border-rose-300 text-rose-600 bg-rose-50' },
                { id: 'high', label: '✨ อยากได้มาก', color: 'border-amber-300 text-amber-600 bg-amber-50' },
                { id: 'nice_to_have', label: '💡 มีก็ดี', color: 'border-sky-300 text-sky-600 bg-sky-50' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setWishForm({ ...wishForm, priority: p.id })}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                    wishForm.priority === p.id
                      ? `${p.color} scale-[1.02] shadow-sm`
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">สิ่งที่อยากได้</label>
            <input
              type="text"
              required
              placeholder="เช่น หูฟัง AirPods Max, โอมากาเสะ, ทะเลกระบี่"
              className="form-input text-sm"
              value={wishForm.title}
              onChange={(e) => setWishForm({ ...wishForm, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">ราคาโดยประมาณ (฿)</label>
              <input
                type="text"
                placeholder="เช่น 1,590"
                className="form-input text-xs"
                value={wishForm.price}
                onChange={(e) => setWishForm({ ...wishForm, price: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">ลิงก์สินค้า / พิกัดร้าน</label>
              <input
                type="text"
                placeholder="https://..."
                className="form-input text-xs"
                value={wishForm.linkUrl}
                onChange={(e) => {
                  let val = e.target.value.trim();
                  if (val && !val.startsWith('http://') && !val.startsWith('https://') && val.includes('.')) {
                    val = 'https://' + val;
                  }
                  setWishForm({ ...wishForm, linkUrl: val });
                }}
              />
              {wishForm.linkUrl && (
                <div className="mt-1 text-[10px] text-sky-500 font-bold flex items-center gap-1">
                  {wishForm.linkUrl.includes('shopee') && <span>🛒 ลิงก์ Shopee ตรวจพบ</span>}
                  {wishForm.linkUrl.includes('lazada') && <span>🛍️ ลิงก์ Lazada ตรวจพบ</span>}
                  {wishForm.linkUrl.includes('apple.com') && <span>🍏 ลิงก์ Apple Store ตรวจพบ</span>}
                  {wishForm.linkUrl.includes('tiktok.com') && <span>🎵 ลิงก์ TikTok Shop ตรวจพบ</span>}
                  {wishForm.linkUrl.includes('instagram.com') && <span>📷 ลิงก์ Instagram Shop ตรวจพบ</span>}
                  {!wishForm.linkUrl.includes('shopee') && !wishForm.linkUrl.includes('lazada') && !wishForm.linkUrl.includes('apple.com') && !wishForm.linkUrl.includes('tiktok.com') && !wishForm.linkUrl.includes('instagram.com') && (
                    <span>🔗 ลิงก์เว็บไซต์พร้อมใช้งาน</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">รายละเอียดเพิ่มเติม</label>
            <textarea
              placeholder="สี ไซส์ ร้านไหน หรือสิ่งที่อยากบอกคนพิเศษ"
              className="form-input text-xs"
              rows={2}
              value={wishForm.description}
              onChange={(e) => setWishForm({ ...wishForm, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">รูปภาพของขวัญ (ไม่บังคับ)</label>
            {wishForm.imageUrl ? (
              <div className="relative">
                <img src={wishForm.imageUrl} alt="Preview" className="w-full h-32 object-cover rounded-2xl border border-sky-200" />
                <button type="button" onClick={() => setWishForm({ ...wishForm, imageUrl: '' })} className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-dashed border-sky-200 hover:border-sky-400 text-xs text-slate-400 hover:text-sky-500 cursor-pointer transition-all">
                📷 เลือกรูปภาพ
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    const img = new Image();
                    img.onload = () => {
                      const canvas = document.createElement('canvas');
                      const MAX = 512;
                      let w = img.width, h = img.height;
                      if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } }
                      else { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }
                      canvas.width = w; canvas.height = h;
                      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                      setWishForm({ ...wishForm, imageUrl: canvas.toDataURL('image/jpeg', 0.82) });
                    };
                    img.src = ev.target.result;
                  };
                  reader.readAsDataURL(file);
                }} />
              </label>
            )}
          </div>

          <button type="submit" className="btn-primary w-full py-3.5 text-xs font-bold mt-2 shadow-lg">
            เพิ่มความปรารถนาทันที ✦
          </button>
        </form>
      </div>
    </div>
  );
}
