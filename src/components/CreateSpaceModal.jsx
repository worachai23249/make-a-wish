import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function CreateSpaceModal({ isOpen, onClose, onSubmit }) {
  const [spaceForm, setSpaceForm] = useState({ name: '', type: '1on1', emoji: '💕' });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!spaceForm.name.trim()) return;
    onSubmit(spaceForm);
    setSpaceForm({ name: '', type: '1on1', emoji: '💕' });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel w-full max-w-md p-6 sm:p-8 rounded-3xl space-y-5 border-rose-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold">สร้างห้องความปรารถนาใหม่ 💕</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-500 mb-1.5">ประเภทห้อง</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSpaceForm({ ...spaceForm, type: '1on1' })}
                className={`p-3 rounded-2xl text-xs font-bold border transition-all ${
                  spaceForm.type === '1on1'
                    ? 'border-rose-500 bg-rose-500/10 text-rose-500'
                    : 'border-stone-200 dark:border-stone-800'
                }`}
              >
                1-on-1 (คู่รัก/เพื่อนสนิท)
              </button>
              <button
                type="button"
                onClick={() => setSpaceForm({ ...spaceForm, type: 'group' })}
                className={`p-3 rounded-2xl text-xs font-bold border transition-all ${
                  spaceForm.type === 'group'
                    ? 'border-rose-500 bg-rose-500/10 text-rose-500'
                    : 'border-stone-200 dark:border-stone-800'
                }`}
              >
                กลุ่ม (เพื่อนหลายคน)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 mb-1.5">ชื่อห้อง</label>
            <input
              type="text"
              required
              placeholder="เช่น ของขวัญวันครบรอบ, ปาร์ตี้ปีใหม่"
              className="form-input"
              value={spaceForm.name}
              onChange={(e) => setSpaceForm({ ...spaceForm, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 mb-1.5">ไอคอนห้อง</label>
            <div className="flex gap-2">
              {['💕', '🎁', '🏖️', '🍜', '✨', '🌸'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSpaceForm({ ...spaceForm, emoji })}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${
                    spaceForm.emoji === emoji ? 'border-rose-500 bg-rose-500/15 scale-110' : 'border-stone-200 dark:border-stone-800'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-3 text-xs font-bold mt-2">
            สร้างห้องทันที 🚀
          </button>
        </form>
      </div>
    </div>
  );
}
