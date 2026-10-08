import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

export default function CreateSpaceModal({ isOpen, onClose, onSubmit }) {
  const [spaceForm, setSpaceForm] = useState({ name: '', type: '1on1', emoji: '✨' });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!spaceForm.name.trim()) return;
    onSubmit(spaceForm);
    setSpaceForm({ name: '', type: '1on1', emoji: '✨' });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel w-full max-w-md p-6 sm:p-8 rounded-[36px] space-y-5 border-sky-300/40 dark:border-sky-500/30 shadow-2xl relative animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles size={18} className="text-sky-500" /> สร้างห้องความปรารถนาใหม่ ✦
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-500/10 text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">ประเภทห้อง</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSpaceForm({ ...spaceForm, type: '1on1' })}
                className={`p-3 rounded-2xl text-xs font-bold border transition-all ${
                  spaceForm.type === '1on1'
                    ? 'border-sky-500 bg-sky-500/15 text-sky-600 dark:text-sky-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-sky-500/5'
                }`}
              >
                1-on-1 (คู่รัก/เพื่อนสนิท)
              </button>
              <button
                type="button"
                onClick={() => setSpaceForm({ ...spaceForm, type: 'group' })}
                className={`p-3 rounded-2xl text-xs font-bold border transition-all ${
                  spaceForm.type === 'group'
                    ? 'border-sky-500 bg-sky-500/15 text-sky-600 dark:text-sky-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-sky-500/5'
                }`}
              >
                กลุ่ม (เพื่อนหลายคน)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">ชื่อห้อง</label>
            <input
              type="text"
              required
              placeholder="เช่น ของขวัญวันเกิด, ปาร์ตี้สิ้นปี, ครบรอบ 1 ปี"
              className="form-input text-sm"
              value={spaceForm.name}
              onChange={(e) => setSpaceForm({ ...spaceForm, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">ไอคอนห้อง</label>
            <div className="flex gap-2">
              {['✨', '🎁', '💕', '🏖️', '🍜', '🌸', '👑', '💎'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSpaceForm({ ...spaceForm, emoji })}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${
                    spaceForm.emoji === emoji ? 'border-sky-500 bg-sky-500/20 scale-110 shadow-sm' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-500/10'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-3.5 text-xs font-bold mt-2 shadow-lg">
            สร้างห้องทันที ✦
          </button>
        </form>
      </div>
    </div>
  );
}
