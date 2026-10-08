import React from 'react';
import { CheckCircle2, Tag, ExternalLink, Trash2, Edit3, Sparkles } from 'lucide-react';

export default function WishCard({ wish, currentUser, onToggleFulfilled, onDelete, onEdit }) {
  return (
    <div
      className={`glass-card p-5 rounded-[24px] flex flex-col justify-between gap-4 transition-all border-sky-200/50 dark:border-sky-500/20 relative overflow-hidden group ${
        wish.isFulfilled ? 'border-emerald-400/40 bg-emerald-500/5 dark:bg-emerald-500/10' : ''
      }`}
    >
      <div>
        {/* Top Bar: Category & Status */}
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-[10px] px-3 py-0.5 rounded-full font-bold bg-sky-100 dark:bg-sky-500/15 text-sky-600 dark:text-sky-300 border border-sky-200 dark:border-sky-400/20">
            {wish.category === 'food' ? '🍜 อาหาร' : wish.category === 'place' ? '📍 สถานที่' : '🎁 สิ่งของ'}
          </span>
          {wish.isFulfilled ? (
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 border border-emerald-400/30">
              <CheckCircle2 size={12} /> ได้รับแล้ว ✦
            </span>
          ) : (
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold text-slate-400 bg-slate-500/10">
              รอส่งมอบ
            </span>
          )}
        </div>

        {/* Title & Emoji */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 dark:bg-sky-500/15 border border-sky-400/20 flex items-center justify-center text-2xl shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            {wish.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <h4
              className={`font-bold text-sm tracking-tight ${
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

        {/* Price & Link Tags */}
        <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-2.5 border-t border-sky-300/20 dark:border-sky-500/15">
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
              className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1 font-semibold"
            >
              <ExternalLink size={11} /> ลิงก์รายละเอียด
            </a>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2.5 border-t border-sky-300/20 dark:border-sky-500/15 text-xs">
        <div className="text-[11px] text-slate-400 font-medium truncate">
          โดย <span className="font-semibold text-slate-600 dark:text-slate-300">@{wish.userName}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onToggleFulfilled(wish)}
            className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all inline-flex items-center gap-1 ${
              wish.isFulfilled
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30 border border-emerald-400/20'
                : 'bg-sky-100 hover:bg-sky-400 hover:text-white text-sky-600 dark:bg-sky-500/15 dark:text-sky-300 dark:hover:bg-sky-400 border border-sky-200 dark:border-sky-400/20'
            }`}
          >
            {wish.isFulfilled ? '✦ มอบแล้ว' : '🎁 ซื้อให้แล้ว'}
          </button>
          {wish.userId === currentUser.id && (
            <>
              <button
                onClick={() => onEdit(wish)}
                className="p-1 rounded-lg text-slate-400 hover:text-sky-500 transition-colors"
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
