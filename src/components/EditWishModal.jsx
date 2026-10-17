import React, { useState, useEffect } from 'react';
import { X, Edit3 } from 'lucide-react';

export default function EditWishModal({ isOpen, onClose, wish, onSave }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'item',
    price: '',
    linkUrl: '',
    emoji: '🎁',
    imageUrl: '',
    priority: 'high',
  });

  useEffect(() => {
    if (wish && isOpen) {
      setForm({
        title: wish.title || '',
        description: wish.description || '',
        category: wish.category || 'item',
        price: wish.price || '',
        linkUrl: wish.linkUrl || '',
        emoji: wish.emoji || '🎁',
        imageUrl: wish.imageUrl || '',
        priority: wish.priority || 'high',
      });
    }
  }, [wish, isOpen]);

  if (!isOpen || !wish) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(wish.id, form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel w-full max-w-md p-6 sm:p-8 rounded-[36px] space-y-4 border-sky-300/40 dark:border-sky-500/30 shadow-2xl relative animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Edit3 size={18} className="text-sky-500" /> แก้ไขความปรารถนา ✏️
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
                  onClick={() => setForm({ ...form, category: c.id, emoji: c.emoji })}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                    form.category === c.id
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
                { id: 'must_have', label: '🔥 อยากได้มากสุด', activeColor: 'border-rose-300 bg-rose-50 text-rose-600 shadow-sm shadow-rose-200/50' },
                { id: 'high', label: '✨ อยากได้มาก', activeColor: 'border-amber-300 bg-amber-50 text-amber-600 shadow-sm shadow-amber-200/50' },
                { id: 'nice_to_have', label: '💡 มีก็ดี', activeColor: 'border-sky-300 bg-sky-100 text-sky-600 shadow-sm shadow-sky-200/50' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setForm({ ...form, priority: p.id })}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                    form.priority === p.id
                      ? p.activeColor
                      : 'border-slate-200 dark:border-slate-800 hover:bg-sky-50'
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
              placeholder="เช่น หูฟัง AirPods Max, โอมากาเสะ, ทะเลพัทยา"
              className="form-input text-sm"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">ราคาโดยประมาณ (฿)</label>
              <input
                type="text"
                placeholder="เช่น 1,590"
                className="form-input text-xs"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">ลิงก์สินค้า / พิกัดร้าน</label>
              <input
                type="text"
                placeholder="https://..."
                className="form-input text-xs"
                value={form.linkUrl}
                onChange={(e) => {
                  let val = e.target.value.trim();
                  if (val && !val.startsWith('http://') && !val.startsWith('https://') && val.includes('.')) {
                    val = 'https://' + val;
                  }
                  setForm({ ...form, linkUrl: val });
                }}
              />
              {form.linkUrl && (
                <div className="mt-1 text-[10px] text-sky-500 font-bold flex items-center gap-1">
                  {form.linkUrl.includes('shopee') && <span>🛒 ลิงก์ Shopee ตรวจพบ</span>}
                  {form.linkUrl.includes('lazada') && <span>🛍️ ลิงก์ Lazada ตรวจพบ</span>}
                  {form.linkUrl.includes('apple.com') && <span>🍏 ลิงก์ Apple Store ตรวจพบ</span>}
                  {form.linkUrl.includes('tiktok.com') && <span>🎵 ลิงก์ TikTok Shop ตรวจพบ</span>}
                  {form.linkUrl.includes('instagram.com') && <span>📷 ลิงก์ Instagram Shop ตรวจพบ</span>}
                  {!form.linkUrl.includes('shopee') && !form.linkUrl.includes('lazada') && !form.linkUrl.includes('apple.com') && !form.linkUrl.includes('tiktok.com') && !form.linkUrl.includes('instagram.com') && (
                    <span>🔗 ลิงก์เว็บไซต์พร้อมใช้งาน</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">รายละเอียดเพิ่มเติม</label>
            <textarea
              placeholder="สี ไซส์ นัดวันไหน หรือสิ่งที่อยากบอก"
              className="form-input text-xs"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">รูปภาพของขวัญ (ไม่บังคับ)</label>
            {form.imageUrl ? (
              <div className="relative">
                <img src={form.imageUrl} alt="Preview" className="w-full h-32 object-cover rounded-2xl border border-sky-200" />
                <button type="button" onClick={() => setForm({ ...form, imageUrl: '' })} className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors">
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
                      setForm({ ...form, imageUrl: canvas.toDataURL('image/jpeg', 0.82) });
                    };
                    img.src = ev.target.result;
                  };
                  reader.readAsDataURL(file);
                }} />
              </label>
            )}
          </div>

          <button type="submit" className="btn-primary w-full py-3.5 text-xs font-bold mt-2 shadow-lg">
            บันทึกการแก้ไข ✦
          </button>
        </form>
      </div>
    </div>
  );
}
