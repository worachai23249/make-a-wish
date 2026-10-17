import React, { useState, useEffect } from 'react';
import { X, Edit3, Sparkles } from 'lucide-react';

const EMOJI_OPTIONS = ['✨', '🎁', '💕', '🏖️', '🍜', '🌸', '👑', '💎', '🎉', '✈️', '🧸', '🎮'];

export default function EditSpaceModal({ isOpen, onClose, space, onSave }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('1on1');
  const [emoji, setEmoji] = useState('✨');

  useEffect(() => {
    if (space && isOpen) {
      setName(space.name || '');
      setType(space.type || '1on1');
      setEmoji(space.emoji || '✨');
    }
  }, [space, isOpen]);

  if (!isOpen || !space) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      type,
      emoji,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel w-full max-w-md p-6 sm:p-8 rounded-[36px] space-y-5 border-sky-300/40 dark:border-sky-500/30 shadow-2xl relative animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Edit3 size={18} className="text-[#00a6ff]" /> แก้ไขข้อมูลห้อง ✦
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-500/10 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">ประเภทห้อง</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setType('1on1')}
                className={`p-3 rounded-2xl text-xs font-bold border transition-all ${
                  type === '1on1'
                    ? 'border-sky-300 bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 shadow-sm shadow-sky-200/50'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-sky-50'
                }`}
              >
                1-on-1 (คู่รัก/เพื่อนสนิท)
              </button>
              <button
                type="button"
                onClick={() => setType('group')}
                className={`p-3 rounded-2xl text-xs font-bold border transition-all ${
                  type === 'group'
                    ? 'border-sky-300 bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 shadow-sm shadow-sky-200/50'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-sky-50'
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
              placeholder="เช่น ของขวัญวันสำคัญ, ทริปสิ้นปี"
              className="form-input text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5">ไอคอนห้อง</label>
            <div className="grid grid-cols-6 gap-2">
              {EMOJI_OPTIONS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setEmoji(em)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${
                    emoji === em
                      ? 'border-sky-500 bg-sky-500/20 scale-110 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-500/10'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-3.5 text-xs font-bold mt-2 shadow-lg">
            บันทึกการแก้ไข ✦
          </button>
        </form>
      </div>
    </div>
  );
}
