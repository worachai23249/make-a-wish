import React from 'react';
import { CheckCircle2, Tag, ExternalLink, Trash2, Edit3, Sparkles } from 'lucide-react';

export default function WishCard({ wish, currentUser, onToggleFulfilled, onDelete, onEdit }) {
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
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2.5 border-t border-sky-100 dark:border-sky-500/15 text-xs">
        <div className="text-[11px] text-slate-400 font-medium truncate">
          โดย <span className="font-bold text-slate-700 dark:text-slate-300">@{wish.userName}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onToggleFulfilled(wish)}
            className={`btn-pill text-[11px] font-bold transition-all inline-flex items-center gap-1.5 shadow-sm ${
              wish.isFulfilled ? 'btn-pill-active' : ''
            }`}
          >
            {wish.isFulfilled ? '✦ มอบแล้ว' : '🎁 ซื้อให้แล้ว'}
          </button>
          {wish.userId === currentUser.id && (
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
