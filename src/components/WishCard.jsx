import React, { useState } from 'react';
import { CheckCircle2, Tag, ExternalLink, Trash2, Edit3, Sparkles, Lock, Heart, Gift } from 'lucide-react';

const REACTION_EMOJIS = ['❤️', '✨', '🥺', '🔥', '🎁'];

export default function WishCard({
  wish,
  currentUser,
  onToggleFulfilled,
  onClaimWish,
  onUnclaimWish,
  onToggleReaction,
  onDelete,
  onEdit,
  onAddNote,
}) {
  const [noteInput, setNoteInput] = useState('');
  const isOwner = wish.userId === currentUser?.id;
  const isClaimedByMe = wish.claimedBy && wish.claimedBy === currentUser?.id;
  const isClaimedByOther = wish.claimedBy && wish.claimedBy !== currentUser?.id;

  return (
    <div
      className={`glass-card p-5 sm:p-6 rounded-[28px] flex flex-col justify-between gap-4 transition-all border-sky-100 relative overflow-hidden group shadow-lg ${
        wish.isFulfilled ? 'border-emerald-300/60 bg-emerald-500/5' : ''
      }`}
    >
      {/* 💧 3D Glass Water Droplet on Wish Card Corner */}
      <div className="water-droplet-accent top-3 right-4 w-2 h-2.5 opacity-65" />

      <div>
        {/* Top Bar: Category & Status */}
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-[10px] px-3 py-0.5 rounded-full font-bold bg-[#e0f2fe] text-[#0284c7] border border-[#bae6fd] shadow-sm">
            {wish.category === 'food' ? '🍜 อาหาร' : wish.category === 'place' ? '📍 สถานที่' : '🎁 สิ่งของ'}
          </span>
          <div className="flex items-center gap-1.5">
            {wish.isFulfilled ? (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 border border-emerald-400/30">
                <CheckCircle2 size={12} /> ได้รับแล้ว ✦
              </span>
            ) : !isOwner && isClaimedByMe ? (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 inline-flex items-center gap-1 border border-purple-400/30">
                🤫 คุณแอบจองแล้ว
              </span>
            ) : !isOwner && isClaimedByOther ? (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 inline-flex items-center gap-1 border border-amber-400/30">
                <Lock size={10} /> มีคนแอบจองแล้ว
              </span>
            ) : (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold text-slate-400 bg-slate-500/10">
                รอส่งมอบ
              </span>
            )}
          </div>
        </div>

        {/* Priority Badge */}
        {wish.priority && wish.priority !== 'high' && (
          <div className="mb-2">
            {wish.priority === 'must_have' && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-rose-500/10 text-rose-600 border border-rose-400/20 inline-flex items-center gap-1">
                🔥 อยากได้มากที่สุด
              </span>
            )}
            {wish.priority === 'nice_to_have' && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-sky-500/10 text-sky-600 border border-sky-400/20 inline-flex items-center gap-1">
                💡 มีก็ดี
              </span>
            )}
          </div>
        )}
        {wish.priority === 'high' && (
          <div className="mb-2">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-600 border border-amber-400/20 inline-flex items-center gap-1">
              ✨ อยากได้มาก
            </span>
          </div>
        )}

        {/* Title & Emoji */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-100 to-sky-50 border border-sky-200/70 flex items-center justify-center text-2xl shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            {wish.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <h4
              className={`font-black text-sm tracking-tight ${
                wish.isFulfilled ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {wish.title}
            </h4>
            {wish.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 font-medium">
                {wish.description}
              </p>
            )}
          </div>
        </div>

        {wish.imageUrl && (
          <div className="mt-2.5">
            <img src={wish.imageUrl} alt={wish.title} className="w-full h-28 object-cover rounded-xl border border-sky-100 shadow-sm" />
          </div>
        )}

        {/* Price & Link Tags */}
        <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-2.5 border-t border-sky-100 dark:border-sky-500/15">
          {wish.price && (
            <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 inline-flex items-center gap-1 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-400/20">
              <Tag size={11} /> ฿{wish.price}
            </span>
          )}
          {wish.linkUrl && (
            <a
              href={wish.linkUrl.startsWith('http') ? wish.linkUrl : `https://${wish.linkUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[#00a6ff] hover:underline inline-flex items-center gap-1 font-bold"
            >
              <ExternalLink size={11} /> ลิงก์รายละเอียด
            </a>
          )}
        </div>

        {/* Reactions Bar */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-sky-100 dark:border-sky-500/15">
          {REACTION_EMOJIS.map((em) => {
            const users = Array.isArray(wish.reactions?.[em]) ? wish.reactions[em] : [];
            const hasReacted = users.includes(currentUser?.id);
            return (
              <button
                key={em}
                type="button"
                onClick={() => onToggleReaction && onToggleReaction(wish.id, em)}
                className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 transition-all ${
                  hasReacted
                    ? 'bg-sky-500/20 border border-sky-400 scale-105 shadow-sm'
                    : 'bg-white/60 dark:bg-slate-800/60 border border-transparent hover:border-sky-200'
                }`}
                title="กด Reaction"
              >
                <span>{em}</span>
                {users.length > 0 && (
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    {users.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Gift Notes */}
        {(wish.notes?.length > 0 || onAddNote) && (
          <div className="mt-3 pt-2.5 border-t border-sky-100 dark:border-sky-500/15 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">💬 โน้ต / ข้อความ</p>
            {(wish.notes || []).map((note, i) => (
              <div key={note.id || i} className="flex items-start gap-2">
                <span className="text-sm shrink-0">{note.authorEmoji || '👤'}</span>
                <div className="flex-1 bg-sky-50 dark:bg-sky-500/10 rounded-xl px-3 py-1.5">
                  <p className="text-[10px] font-bold text-sky-600 dark:text-sky-300">{note.authorName}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{note.text}</p>
                </div>
              </div>
            ))}
            {onAddNote && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="เพิ่มโน้ตสั้นๆ..."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && noteInput.trim()) {
                      onAddNote(wish.id, noteInput.trim());
                      setNoteInput('');
                    }
                  }}
                  className="flex-1 text-xs px-3 py-1.5 rounded-xl bg-white/80 border border-sky-200 focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (noteInput.trim()) {
                      onAddNote(wish.id, noteInput.trim());
                      setNoteInput('');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-sky-500 text-white text-xs font-bold hover:bg-sky-600 transition-colors"
                >
                  ส่ง
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2.5 border-t border-sky-100 dark:border-sky-500/15 text-xs">
        <div className="text-[11px] text-slate-400 font-medium truncate">
          โดย <span className="font-bold text-slate-700 dark:text-slate-300">{wish.userName}</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {/* Secret Claim / Surprise Mode button (for friends/partners, NOT owner) */}
          {!isOwner && !wish.isFulfilled && (
            isClaimedByMe ? (
              <button
                onClick={() => onUnclaimWish && onUnclaimWish(wish)}
                className="text-[10px] font-bold px-2 py-1 rounded-full text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors"
                title="ยกเลิกการจอง"
              >
                ยกเลิกจอง
              </button>
            ) : !wish.claimedBy ? (
              <button
                onClick={() => onClaimWish && onClaimWish(wish)}
                className="text-[10px] font-bold px-2.5 py-1 rounded-full text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors inline-flex items-center gap-1"
                title="แอบจองเพื่อเซอร์ไพรส์ (เจ้าของจะไม่เห็น)"
              >
                🤫 แอบจอง
              </button>
            ) : null
          )}

          {/* Mark Fulfilled Button */}
          <button
            onClick={() => onToggleFulfilled(wish)}
            className={`btn-pill text-[11px] font-bold transition-all inline-flex items-center gap-1.5 shadow-sm ${
              wish.isFulfilled ? 'btn-pill-active' : ''
            }`}
          >
            {wish.isFulfilled ? '✦ มอบแล้ว' : '🎁 ซื้อให้แล้ว'}
          </button>

          {/* Edit & Delete (Only for owner or admin) */}
          {(isOwner || currentUser?.role === 'admin') && (
            <>
              <button
                onClick={() => onEdit(wish)}
                className="p-1 rounded-lg text-slate-400 hover:text-[#00a6ff] transition-colors"
                title="แก้ไขรายการ"
              >
                <Edit3 size={14} />
              </button>
              <button
                onClick={() => onDelete(wish.id, wish.title)}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                title="ลบรายการ"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
