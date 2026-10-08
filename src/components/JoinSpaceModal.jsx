import React, { useState } from 'react';
import { X } from 'lucide-react';

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
        className="glass-panel w-full max-w-sm p-6 sm:p-8 rounded-3xl space-y-5 text-center border-rose-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-stone-600">
          <X size={18} />
        </button>
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-2xl mx-auto">
          🔑
        </div>
        <h3 className="text-lg font-extrabold">ใส่รหัสเชิญเข้าห้อง</h3>
        <p className="text-xs text-stone-400">กรอกรหัสเชิญ 6 ตัวอักษรที่ได้รับจากเพื่อนหรือแฟน</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            required
            maxLength={6}
            placeholder="เช่น LOVE26"
            className="form-input text-center text-2xl font-mono tracking-widest uppercase font-bold"
            value={joinCodeInput}
            onChange={(e) => setJoinCodeInput(e.target.value)}
          />
          <button type="submit" className="btn-primary w-full py-3 text-xs font-bold">
            เข้าร่วมห้องทันที 🌸
          </button>
        </form>
      </div>
    </div>
  );
}
