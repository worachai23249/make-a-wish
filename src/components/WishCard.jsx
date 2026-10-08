import React from 'react';
import { CheckCircle2, Tag, ExternalLink, Trash2, Edit3 } from 'lucide-react';

export default function WishCard({ wish, currentUser, onToggleFulfilled, onDelete, onEdit }) {
  return (
    <div
      className={`glass-card p-5 rounded-2xl flex flex-col justify-between gap-4 transition-all ${
        wish.isFulfilled ? 'border-emerald-500/30 bg-emerald-500/5' : ''
      }`}
    >
      <div>
        {/* Top Bar: Category & Status */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-rose-500/10 text-rose-500">
            {wish.category === 'food' ? '🍜 อาหาร' : wish.category === 'place' ? '📍 สถานที่' : '🎁 สิ่งของ'}
          </span>
          {wish.isFulfilled ? (
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
              <CheckCircle2 size={12} /> ซื้อให้แล้ว 🎉
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold text-stone-400 bg-stone-500/10">
              ยังไม่ได้ซื้อ
            </span>
          )}
        </div>

        {/* Title & Emoji */}
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-rose-500/10 flex items-center justify-center text-2xl shrink-0">
            {wish.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <h4
              className={`font-bold text-sm tracking-tight ${
                wish.isFulfilled ? 'line-through text-stone-400 dark:text-stone-500' : ''
              }`}
            >
              {wish.title}
            </h4>
            {wish.description && (
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                {wish.description}
              </p>
            )}
          </div>
        </div>

        {/* Price & Link Tags */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-rose-500/10">
          {wish.price && (
            <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 inline-flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg">
              <Tag size={11} /> ฿{wish.price}
            </span>
          )}
          {wish.linkUrl && (
            <a
              href={wish.linkUrl.startsWith('http') ? wish.linkUrl : `https://${wish.linkUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-rose-500 hover:underline inline-flex items-center gap-1 font-semibold"
            >
              <ExternalLink size={11} /> ลิงก์รายละเอียด
            </a>
          )}
        </div>
      </div>

      {/* Footer Actions: Toggle Fulfilled & Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-rose-500/10 text-xs">
        <div className="text-[11px] text-stone-400 font-medium truncate">
          โดย @{wish.userName}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onToggleFulfilled(wish)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all inline-flex items-center gap-1 ${
              wish.isFulfilled
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30'
                : 'bg-rose-500/15 text-rose-500 hover:bg-rose-500 hover:text-white'
            }`}
          >
            {wish.isFulfilled ? '🎉 สำเร็จแล้ว' : '🎁 ซื้อให้แล้ว'}
          </button>
          {wish.userId === currentUser.id && (
            <>
              <button
                onClick={() => onEdit(wish)}
                className="p-1 rounded-lg text-stone-400 hover:text-rose-500 transition-colors"
                title="แก้ไขรายการ"
              >
                <Edit3 size={14} />
              </button>
              <button
                onClick={() => onDelete(wish.id, wish.title)}
                className="p-1 rounded-lg text-stone-400 hover:text-rose-500 transition-colors"
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
