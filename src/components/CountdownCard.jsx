import React, { useState } from 'react';
import { Plus, Trash2, Calendar } from 'lucide-react';

export default function CountdownCard({ events, spaceEvents, onAddEvent, onDeleteEvent, isOwner }) {
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ title: '', emoji: '🎉', date: '' });
  const eventList = events || spaceEvents || [];

  if (eventList.length === 0 && !isOwner) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.title && form.date) {
      onAddEvent({ title: form.title, emoji: form.emoji, date: form.date });
      setForm({ title: '', emoji: '🎉', date: '' });
      setIsAdding(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="glass-card p-5 rounded-2xl border-rose-500/20 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-extrabold text-sm sm:text-base text-rose-500 flex items-center gap-1.5">
          วันสำคัญที่กำลังจะมาถึง ⏰
        </h3>
        {isOwner && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="text-[11px] font-bold text-rose-500 hover:text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors"
          >
            {isAdding ? 'ยกเลิก' : <><Plus size={12} /> เพิ่มวันสำคัญ</>}
          </button>
        )}
      </div>

      {isAdding && isOwner && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 rounded-xl bg-stone-500/5 border border-stone-500/10 space-y-3">
          <div>
            <input
              type="text"
              required
              placeholder="เช่น วันเกิด, วันครบรอบ"
              className="form-input text-xs py-2"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {['🎂', '💕', '🎄', '🎉', '✨', '🌸', '🎁', '💍'].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setForm({ ...form, emoji })}
                className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center border transition-all ${
                  form.emoji === emoji ? 'border-rose-500 bg-rose-500/15 scale-110' : 'border-transparent hover:bg-stone-500/10'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              required
              className="form-input text-xs py-2 flex-1"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <button type="submit" className="btn-primary py-2 text-xs">เพิ่มวันสำคัญ</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {eventList.map((ev, idx) => {
          const evDate = new Date(ev.date || ev.event_date);
          evDate.setHours(0, 0, 0, 0);
          const diffTime = evDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          return (
            <div key={ev.id || idx} className="flex items-center justify-between p-3 rounded-xl bg-stone-500/5 border border-stone-500/10">
              <div className="flex items-center gap-3">
                <div className="text-3xl shrink-0">{ev.emoji}</div>
                <div>
                  <div className="font-bold text-sm">{ev.title}</div>
                  <div className="text-[11px] text-stone-500 flex items-center gap-1">
                    <Calendar size={11} /> {evDate.toLocaleDateString('th-TH')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  {diffDays > 0 ? (
                    <span className="text-xs font-bold text-rose-500">อีก {diffDays} วัน ⏳</span>
                  ) : diffDays === 0 ? (
                    <span className="text-xs font-extrabold text-emerald-500 animate-pulse">🎉 วันนี้เลย!</span>
                  ) : (
                    <span className="text-xs font-bold text-stone-400 line-through">ผ่านไปแล้ว {Math.abs(diffDays)} วัน</span>
                  )}
                </div>
                {isOwner && (
                  <button
                    onClick={() => onDeleteEvent(ev.id || ev)}
                    className="p-1.5 text-stone-400 hover:text-rose-500 transition-colors rounded-lg"
                    title="ลบวันสำคัญ"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {eventList.length === 0 && !isAdding && (
          <div className="text-xs text-stone-500 text-center py-2">ยังไม่มีวันสำคัญในห้องนี้</div>
        )}
      </div>
    </div>
  );
}
