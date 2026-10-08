import React, { useState } from 'react';
import { ArrowLeft, Copy, Check, Share2, Sparkles, Plus, Trash2 } from 'lucide-react';
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

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-rose-500 transition-colors"
      >
        <ArrowLeft size={15} /> กลับไปห้องทั้งหมด
      </button>

      {/* Space Header Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl flex flex-wrap items-center justify-between gap-6 border-rose-500/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center text-3xl shadow-lg shadow-rose-500/25 shrink-0">
            {space.emoji}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{space.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-500">
                {space.type === '1on1' ? '1-on-1 คู่รัก/เพื่อนสนิท' : 'ห้องกลุ่ม'}
              </span>
              <button
                onClick={() => onCopyInviteCode(space.inviteCode)}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-stone-500/10 hover:bg-rose-500/15 text-stone-600 dark:text-stone-300 hover:text-rose-500 inline-flex items-center gap-1 transition-all"
              >
                {copiedCode ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                #{space.inviteCode}
              </button>
              <button
                onClick={() => onShareSpace(space)}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-500/10 hover:bg-rose-500/15 text-stone-600 dark:text-stone-300 hover:text-rose-500 inline-flex items-center gap-1 transition-all"
              >
                <Share2 size={12} /> แชร์ห้อง
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenRoulette}
            className="btn-primary bg-gradient-to-r from-amber-500 to-rose-500 shadow-amber-500/20 text-xs py-2.5 px-4"
          >
            <Sparkles size={16} /> 🎰 วงล้อสุ่มของขวัญ
          </button>
          <button onClick={onOpenAddWish} className="btn-primary text-xs py-2.5 px-4">
            <Plus size={16} /> ขอของขวัญ
          </button>
          {space.ownerId === currentUser.id && (
            <button
              onClick={() => onDeleteSpace(space.id, space.name)}
              className="p-2.5 rounded-full hover:bg-rose-500/10 text-stone-400 hover:text-rose-500 transition-colors"
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

      {/* Filter Toolbar */}
      <div className="glass-card p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3">
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
              className={`btn-pill ${
                categoryFilter === c.id
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-rose-500/10'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Status & Ownership Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex gap-1 bg-stone-500/10 p-1 rounded-full">
            {[
              { id: 'all', label: 'ทุกสถานะ' },
              { id: 'unfulfilled', label: '⏳ ยังไม่ได้ซื้อ' },
              { id: 'fulfilled', label: '✨ ซื้อให้แล้ว' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                  statusFilter === s.id ? 'bg-rose-500 text-white shadow-sm' : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Owner Filter */}
          <div className="flex gap-1 bg-stone-500/10 p-1 rounded-full">
            {[
              { id: 'all', label: 'ทุกคน' },
              { id: 'mine', label: 'ของฉัน' },
              { id: 'others', label: 'ของคนอื่น' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setOwnerFilter(f.id)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                  ownerFilter === f.id ? 'bg-rose-500 text-white shadow-sm' : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Wishes Grid */}
      {filteredWishes.length === 0 ? (
        <div className="glass-card p-14 text-center rounded-3xl space-y-3">
          <div className="text-5xl">⭐</div>
          <div className="font-bold text-base">ไม่พบรายการความปรารถนาในเงื่อนไขนี้</div>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            กดปุ่ม "ขอของขวัญ" ด้านบนเพื่อเพิ่มสิ่งของ อาหาร หรือสถานที่ที่อยากไปได้เลย
          </p>
          <button onClick={onOpenAddWish} className="btn-primary text-xs py-2 px-5 mt-2">
            <Plus size={15} /> ขอของขวัญเลย
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
