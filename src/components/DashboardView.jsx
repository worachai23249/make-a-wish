import React from 'react';
import { Plus, KeyRound, ChevronRight, Sparkles, Compass, Users, Heart } from 'lucide-react';

export default function DashboardView({ spaces, currentUser, onOpenSpace, onCreateSpace, onJoinSpace }) {
  const totalWishes = spaces.reduce((sum, s) => sum + (s.wishCount || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* ==================== ✦ 3D LIQUID FROSTED GLASS HERO BANNER ✦ ==================== */}
      <div className="relative glass-card p-7 sm:p-10 rounded-[38px] overflow-hidden">
        {/* 💧 3D Glass Water Droplets on Top-Right & Bottom-Left */}
        <div className="water-droplet-accent top-5 right-12 w-3.5 h-4 opacity-90 hidden sm:block" />
        <div className="water-droplet-accent top-10 right-8 w-2 h-2 opacity-80 hidden sm:block" />
        <div className="water-droplet-accent bottom-6 left-8 w-3 h-3.5 opacity-80 hidden sm:block" />

        {/* Ambient Glowing Blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-300/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-cyan-300/25 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black bg-white/70 text-[#0284c7] border border-white/90 shadow-sm backdrop-blur-md">
              <Sparkles size={13} className="text-[#0284c7]" /> Private Luxury Sanctuary
            </div>
            
            {/* Main Heading */}
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              ห้องความปรารถนาทั้งหมด <span className="text-slate-800 dark:text-slate-200 text-2xl sm:text-3xl">✦</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl font-medium leading-relaxed">
              พื้นที่เก็บความสุขและความปรารถนาสุดพิเศษสำหรับคุณ คนรัก และคนสนิท
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button 
              onClick={onJoinSpace} 
              className="btn-secondary text-xs py-2.5 px-5 shadow-sm"
            >
              <KeyRound size={15} className="text-[#00a6ff]" /> ใส่รหัสเข้าห้อง
            </button>
            <button 
              onClick={onCreateSpace} 
              className="btn-primary text-xs py-2.5 px-5"
            >
              <Plus size={16} /> สร้างห้องใหม่
            </button>
          </div>
        </div>

        {/* Quick Sanctuary Stats Bar */}
        <div className="mt-8 pt-6 border-t border-white/60 dark:border-sky-500/20 grid grid-cols-2 sm:grid-cols-3 gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/75 text-[#0284c7] border border-white flex items-center justify-center text-xl font-bold shadow-md shadow-sky-400/10">
              🏛️
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500">ห้องของคุณ</div>
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">{spaces.length} ห้อง</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/75 text-amber-500 border border-white flex items-center justify-center text-xl font-bold shadow-md shadow-sky-400/10">
              ✨
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500">ความปรารถนารวม</div>
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">{totalWishes} รายการ</div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/75 text-emerald-500 border border-white flex items-center justify-center text-lg font-bold shadow-md shadow-sky-400/10">
              ✦
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500">สถานะระบบ</div>
              <div className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">Cloud Sync 100%</div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 💎 SPACES GRID (3D LIQUID GLASS CARDS) 💎 ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spaces.map((s) => (
          <div
            key={s.id}
            onClick={() => onOpenSpace(s)}
            className="glass-card p-6 sm:p-7 rounded-[36px] cursor-pointer hover:border-white transition-all space-y-4 group relative overflow-hidden"
          >
            {/* 💧 3D Glass Water Droplets on Top-Right of Card */}
            <div className="water-droplet-accent top-4 right-4 w-2.5 h-3 opacity-80" />
            <div className="water-droplet-accent top-8 right-6 w-1.5 h-1.5 opacity-70" />

            {/* Ambient hover light */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-sky-300/25 rounded-full blur-2xl group-hover:bg-sky-300/40 transition-all pointer-events-none" />

            {/* Top row: Squircle emoji icon & Invite code pill */}
            <div className="flex items-start justify-between relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/80 border border-white flex items-center justify-center text-3xl group-hover:scale-105 transition-transform shadow-md shadow-sky-400/15">
                {s.emoji}
              </div>
              <span className="text-xs font-mono font-black px-3.5 py-1 rounded-full bg-white/80 text-[#0284c7] border border-white shadow-sm">
                #{s.inviteCode}
              </span>
            </div>

            {/* Space title & Subtitle */}
            <div className="relative z-10">
              <h3 className="font-black text-lg text-slate-900 dark:text-white group-hover:text-[#00a6ff] transition-colors">
                {s.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
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
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-white/90 text-[#0284c7] text-[10px] font-bold flex items-center justify-center shadow-sm"
                      title={m}
                    >
                      {m.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
                {s.members.length > 4 && (
                  <span className="text-[10px] text-slate-500 font-bold">+{s.members.length - 4}</span>
                )}
              </div>
            )}

            {/* Divider line */}
            <div className="pt-3 border-t border-white/60 dark:border-sky-500/20 flex items-center justify-between text-xs font-bold relative z-10">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Sparkles size={13} className="text-amber-500" /> {s.wishCount || 0} ความปรารถนา
              </span>
              <span className="text-[#00a6ff] flex items-center gap-1 font-black group-hover:translate-x-1 transition-transform">
                เข้าห้อง ✦ <ChevronRight size={14} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
