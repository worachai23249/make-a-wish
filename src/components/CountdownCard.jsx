import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Clock } from 'lucide-react';

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
    <div className="glass-card p-6 rounded-[28px] border-sky-200/50 dark:border-sky-500/20 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-extrabold text-sm sm:text-base text-sky-600 dark:text-sky-400 flex items-center gap-2">
          <Clock size={17} /> วันสำคัญที่กำลังจะมาถึง ⏰
        </h3>
        {isOwner && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:text-white hover:bg-sky-500 bg-sky-500/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all border border-sky-400/20"
          >
            {isAdding ? 'ยกเลิก' : <><Plus size={13} /> เพิ่มวันสำคัญ</>}
          </button>
        )}
      </div>

      {isAdding && isOwner && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 rounded-2xl bg-sky-500/5 border border-sky-400/20 space-y-3.5 animate-fade-in">
          <div>
            <input
              type="text"
              required
              placeholder="เช่น วันเกิด, วันครบรอบ, วาเลนไทน์"
              className="form-input text-xs py-2"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['🎂', '💕', '🎄', '🎉', '✨', '🌸', '🎁', '💍', '🏖️'].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setForm({ ...form, emoji })}
                className={`w-8 h-8 rounded-xl text-lg flex items-center justify-center border transition-all ${
                  form.emoji === emoji ? 'border-sky-500 bg-sky-500/20 scale-110 shadow-sm' : 'border-transparent hover:bg-slate-500/10'
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
            <button type="submit" className="btn-primary py-2 text-xs">บันทึกวันสำคัญ</button>
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
            <div key={ev.id || idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-sky-500/5 dark:bg-slate-800/40 border border-sky-400/15">
              <div className="flex items-center gap-3">
                <div className="text-3xl shrink-0 drop-shadow-sm">{ev.emoji}</div>
                <div>
                  <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{ev.title}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium mt-0.5">
                    <Calendar size={11} /> {evDate.toLocaleDateString('th-TH')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  {diffDays > 0 ? (
                    <span className="text-xs font-bold text-sky-600 dark:text-sky-400 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-400/20">
                      อีก {diffDays} วัน ⏳
                    </span>
                  ) : diffDays === 0 ? (
                    <span className="text-xs font-black text-emerald-500 animate-pulse px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30">
                      ✦ วันนี้เลย!
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-400 line-through">ผ่านไปแล้ว {Math.abs(diffDays)} วัน</span>
                  )}
                </div>
                {isOwner && (
                  <button
                    onClick={() => onDeleteEvent(ev.id || ev)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-lg"
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
          <div className="text-xs text-slate-400 text-center py-3">ยังไม่มีวันสำคัญในห้องนี้</div>
        )}
      </div>
    </div>
  );
}
