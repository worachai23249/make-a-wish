import React, { useState } from 'react';
import { X, KeyRound } from 'lucide-react';

export default function JoinSpaceModal({ isOpen, onClose, onSubmit }) {
  const [joinCodeInput, setJoinCodeInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(joinCodeInput);
    setJoinCodeInput('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="glass-panel w-full max-w-sm p-6 sm:p-8 rounded-[36px] space-y-5 text-center border-sky-300/40 dark:border-sky-500/30 shadow-2xl relative animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-500/10 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={18} />
        </button>
        <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-500 border border-sky-400/20 flex items-center justify-center text-2xl mx-auto shadow-sm">
          🔑
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">ใส่รหัสเชิญเข้าห้อง</h3>
          <p className="text-xs text-slate-400 mt-1">กรอกรหัสเชิญ 6 หลักที่ได้รับจากเพื่อนหรือคนรัก</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            required
            maxLength={6}
            placeholder="เช่น LOVE26"
            className="form-input text-center text-2xl font-mono tracking-widest uppercase font-black text-sky-600 dark:text-sky-400"
            value={joinCodeInput}
            onChange={(e) => setJoinCodeInput(e.target.value)}
          />
          <button type="submit" className="btn-primary w-full py-3.5 text-xs font-bold shadow-lg">
            เข้าร่วมห้องทันที ✦
          </button>
        </form>
      </div>
    </div>
  );
}
