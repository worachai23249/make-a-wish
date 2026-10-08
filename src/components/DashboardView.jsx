import React from 'react';
import { Plus, KeyRound, ChevronRight, Sparkles, Compass, Users, Heart } from 'lucide-react';

export default function DashboardView({ spaces, currentUser, onOpenSpace, onCreateSpace, onJoinSpace }) {
  const totalWishes = spaces.reduce((sum, s) => sum + (s.wishCount || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* ==================== ✦ LUXURY HERO WELCOME BANNER ✦ ==================== */}
      <div className="relative glass-card p-7 sm:p-9 rounded-[32px] overflow-hidden border-sky-200/50 dark:border-sky-500/20">
        {/* Ambient Glowing Blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-300/20 dark:bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-cyan-300/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 dark:bg-sky-500/10 text-sky-600 dark:text-sky-300 border border-sky-200 dark:border-sky-400/20">
              <Sparkles size={13} /> Private Luxury Sanctuary
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-sky-800 to-slate-800 dark:from-white dark:via-sky-200 dark:to-slate-200 bg-clip-text text-transparent">
              ห้องความปรารถนาทั้งหมด ✨
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl font-medium">
              พื้นที่เก็บความสุขและความปรารถนาสุดพิเศษสำหรับคุณ คนรัก และคนสนิท
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button onClick={onJoinSpace} className="btn-secondary text-xs py-2.5 px-4">
              <KeyRound size={15} className="text-sky-500" /> ใส่รหัสเข้าห้อง
            </button>
            <button onClick={onCreateSpace} className="btn-primary text-xs py-2.5 px-5">
              <Plus size={16} /> สร้างห้องใหม่
            </button>
          </div>
        </div>

        {/* Quick Sanctuary Stats Bar */}
        <div className="mt-8 pt-6 border-t border-sky-300/20 dark:border-sky-500/15 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center text-sm font-bold">
              🏛️
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400">ห้องของคุณ</div>
              <div className="text-lg font-black text-slate-900 dark:text-slate-100">{spaces.length} ห้อง</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm font-bold">
              ✨
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400">ความปรารถนารวม</div>
              <div className="text-lg font-black text-slate-900 dark:text-slate-100">{totalWishes} รายการ</div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-sm font-bold">
              ✦
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400">สถานะระบบ</div>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Cloud Sync 100%</div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 💎 SPACES GRID 💎 ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spaces.map((s) => (
          <div
            key={s.id}
            onClick={() => onOpenSpace(s)}
            className="glass-card p-6 sm:p-7 rounded-[28px] cursor-pointer hover:border-sky-400/50 transition-all space-y-4 group relative overflow-hidden"
          >
            {/* Ambient hover light */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-sky-400/10 rounded-full blur-2xl group-hover:bg-sky-400/20 transition-all" />

            <div className="flex items-start justify-between relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 dark:bg-sky-500/15 border border-sky-400/20 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform shadow-sm">
                {s.emoji}
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-400/20">
                #{s.inviteCode}
              </span>
            </div>

            <div className="relative z-10">
              <h3 className="font-extrabold text-lg group-hover:text-sky-500 transition-colors">
                {s.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {s.type === '1on1' ? 'ห้องคู่ 1-on-1 (คู่รัก/เพื่อนสนิท)' : 'ห้องกลุ่ม (เพื่อนหลายคน)'}
              </p>
            </div>

            {/* Members avatars stack preview */}
            {s.members && s.members.length > 0 && (
              <div className="flex items-center gap-1.5 pt-1 relative z-10">
                <div className="flex -space-x-2 overflow-hidden">
                  {s.members.slice(0, 4).map((m, idx) => (
                    <div
                      key={idx}
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-900 bg-sky-500/20 text-sky-600 dark:text-sky-400 text-[10px] font-bold flex items-center justify-center"
                      title={m}
                    >
                      {m.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
                {s.members.length > 4 && (
                  <span className="text-[10px] text-slate-400 font-bold">+{s.members.length - 4}</span>
                )}
              </div>
            )}

            {/* Footer wish count & enter link */}
            <div className="pt-3 border-t border-sky-300/20 dark:border-sky-500/15 flex items-center justify-between text-xs text-slate-500 font-semibold relative z-10">
              <span className="flex items-center gap-1">✨ {s.wishCount || 0} ความปรารถนา</span>
              <span className="text-sky-500 flex items-center gap-1 font-bold group-hover:translate-x-1 transition-transform">
                เข้าห้อง ✦ <ChevronRight size={15} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
