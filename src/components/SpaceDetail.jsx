import React, { useState } from 'react';
import { ArrowLeft, Copy, Check, Share2, Sparkles, Plus, Trash2, Tag, Compass } from 'lucide-react';
import CountdownCard from './CountdownCard';
import SpaceMembers from './SpaceMembers';
import WishCard from './WishCard';

export default function SpaceDetail({ 
  space, wishes, friends, currentUser, spaceEvents, 
  onBack, onDeleteSpace, onCopyInviteCode, onShareSpace, 
  onOpenAddWish, onOpenEditWish, onOpenRoulette, onDeleteWish, 
  onToggleFulfilled, onAddEvent, onDeleteEvent, onInviteFriend, 
  showToast, copiedCode 
}) {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');

  // Filtered Wishes for display
  const filteredWishes = wishes.filter((w) => {
    if (categoryFilter !== 'all' && w.category !== categoryFilter) return false;
    if (statusFilter === 'unfulfilled' && w.isFulfilled) return false;
    if (statusFilter === 'fulfilled' && !w.isFulfilled) return false;
    if (ownerFilter === 'mine' && w.userId !== currentUser.id) return false;
    if (ownerFilter === 'others' && w.userId === currentUser.id) return false;
    return true;
  });

  const fulfilledCount = wishes.filter(w => w.isFulfilled).length;

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
      >
        <ArrowLeft size={15} /> กลับไปห้องทั้งหมด
      </button>

      {/* ==================== 💎 SPACE HEADER SANCTUARY BANNER 💎 ==================== */}
      <div className="glass-card p-6 sm:p-8 rounded-[32px] flex flex-wrap items-center justify-between gap-6 border-sky-200/50 dark:border-sky-500/20 relative overflow-hidden">
        {/* Soft Ambient Light Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-300 via-sky-400 to-cyan-300 flex items-center justify-center text-3xl shadow-xl shadow-sky-300/40 shrink-0 text-white">
            {space.emoji}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              {space.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 dark:bg-sky-500/10 text-sky-600 dark:text-sky-300 border border-sky-200 dark:border-sky-400/20">
                {space.type === '1on1' ? '1-on-1 Sanctuary' : 'Group Circle'}
              </span>
              <button
                onClick={() => onCopyInviteCode(space.inviteCode)}
                className="px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-500/10 hover:bg-sky-500/15 text-slate-600 dark:text-slate-300 hover:text-sky-600 inline-flex items-center gap-1.5 transition-all border border-slate-300/30 dark:border-slate-700"
              >
                {copiedCode ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                #{space.inviteCode}
              </button>
              <button
                onClick={() => onShareSpace(space)}
                className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/10 hover:bg-sky-500/15 text-slate-600 dark:text-slate-300 hover:text-sky-600 inline-flex items-center gap-1.5 transition-all border border-slate-300/30 dark:border-slate-700"
              >
                <Share2 size={12} /> แชร์ห้อง
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={onOpenRoulette}
            className="btn-primary bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400 text-slate-900 shadow-sky-300/30 text-xs py-2.5 px-5 font-extrabold"
          >
            <Sparkles size={16} className="text-amber-500" /> วงล้อสุ่มความปรารถนา
          </button>
          <button onClick={onOpenAddWish} className="btn-primary text-xs py-2.5 px-4">
            <Plus size={16} /> ขอของขวัญ
          </button>
          {space.ownerId === currentUser.id && (
            <button
              onClick={() => onDeleteSpace(space.id, space.name)}
              className="p-2.5 rounded-full hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors"
              title="ลบห้องนี้"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Grid for Countdown and Members */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CountdownCard 
          spaceEvents={spaceEvents} 
          onAddEvent={onAddEvent} 
          onDeleteEvent={onDeleteEvent} 
          isOwner={space.ownerId === currentUser.id} 
        />
        <SpaceMembers 
          members={space.members || []} 
          friends={friends} 
          onInviteFriend={onInviteFriend} 
        />
      </div>

      {/* ==================== ✦ FILTER TOOLBAR ✦ ==================== */}
      <div className="glass-card p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 border-sky-200/50 dark:border-sky-500/20">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'item', label: '🎁 สิ่งของ' },
            { id: 'food', label: '🍜 อาหาร' },
            { id: 'place', label: '📍 สถานที่' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`btn-pill transition-all ${
                categoryFilter === c.id
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-sky-500/10'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Status & Ownership Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex gap-1 bg-sky-500/8 dark:bg-slate-800/60 p-1 rounded-full border border-sky-500/15">
            {[
              { id: 'all', label: 'ทุกสถานะ' },
              { id: 'unfulfilled', label: '⏳ รอส่งมอบ' },
              { id: 'fulfilled', label: '✨ มอบแล้ว' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                  statusFilter === s.id ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Owner Filter */}
          <div className="flex gap-1 bg-sky-500/8 dark:bg-slate-800/60 p-1 rounded-full border border-sky-500/15">
            {[
              { id: 'all', label: 'ทุกคน' },
              { id: 'mine', label: 'ของฉัน' },
              { id: 'others', label: 'ของคนอื่น' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setOwnerFilter(f.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                  ownerFilter === f.id ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ==================== 💎 WISHES GRID 💎 ==================== */}
      {filteredWishes.length === 0 ? (
        <div className="glass-card p-14 text-center rounded-[32px] space-y-3 border-sky-200/50 dark:border-sky-500/20">
          <div className="text-5xl">✨</div>
          <div className="font-extrabold text-base text-slate-800 dark:text-slate-200">ยังไม่มีรายการความปรารถนาในเงื่อนไขนี้</div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
            กดปุ่ม "ขอของขวัญ" ด้านบนเพื่อเพิ่มสิ่งของ อาหาร หรือทริปท่องเที่ยวที่อยากไป
          </p>
          <button onClick={onOpenAddWish} className="btn-primary text-xs py-2 px-5 mt-2">
            <Plus size={15} /> ขอความปรารถนาทันที
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWishes.map((w) => (
            <WishCard 
              key={w.id} 
              wish={w} 
              currentUser={currentUser} 
              onToggleFulfilled={onToggleFulfilled} 
              onDelete={onDeleteWish} 
              onEdit={onOpenEditWish} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
