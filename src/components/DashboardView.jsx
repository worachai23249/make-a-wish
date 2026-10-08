import React from 'react';
import { Plus, KeyRound, ChevronRight, Sparkles, Compass, Users, Heart } from 'lucide-react';
import LiquidGlassWeatherWidget from './LiquidGlassWeatherWidget';

export default function DashboardView({ spaces, currentUser, onOpenSpace, onCreateSpace, onJoinSpace }) {
  const totalWishes = spaces.reduce((sum, s) => sum + (s.wishCount || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* ==================== ✦ 3D LIQUID FROSTED GLASS HERO BANNER (Image 5 & Image 1) ✦ ==================== */}
      <div className="relative glass-card p-7 sm:p-9 rounded-[36px] overflow-hidden border-sky-200/70 dark:border-sky-500/25">
        {/* 💧 3D Glass Water Droplets on Top-Right & Bottom-Left (From Image 1) */}
        <div 
          className="water-droplet-accent top-5 right-12 w-3 h-3.5 opacity-90 hidden sm:block"
        />
        <div 
          className="water-droplet-accent top-9 right-8 w-2 h-2 opacity-80 hidden sm:block"
        />
        <div 
          className="water-droplet-accent bottom-6 left-8 w-3 h-3 opacity-80 hidden sm:block"
        />

        {/* Ambient Glowing Blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-300/25 dark:bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-cyan-300/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            {/* Top Pill Badge matching Image 5 */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#e0f2fe] text-[#0284c7] border border-[#bae6fd] shadow-sm">
              <Sparkles size={13} className="text-[#0284c7]" /> Private Luxury Sanctuary
            </div>
            
            {/* Main Heading matching Image 5 */}
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              ห้องความปรารถนาทั้งหมด <span className="text-slate-800 dark:text-slate-200 text-2xl sm:text-3xl">✦</span>
            </h1>

            {/* Subtitle matching Image 5 */}
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl font-medium">
              พื้นที่เก็บความสุขและความปรารถนาสุดพิเศษสำหรับคุณ คนรัก และคนสนิท
            </p>
          </div>

          {/* Action Buttons matching Image 5 */}
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

        {/* Quick Sanctuary Stats Bar matching Image 5 */}
        <div className="mt-8 pt-6 border-t border-sky-100 dark:border-sky-500/15 grid grid-cols-2 sm:grid-cols-3 gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#e0f2fe] text-[#0284c7] border border-[#bae6fd]/60 flex items-center justify-center text-lg font-bold shadow-sm">
              🏛️
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400">ห้องของคุณ</div>
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">{spaces.length} ห้อง</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#fef3c7] text-amber-600 border border-amber-200/60 flex items-center justify-center text-lg font-bold shadow-sm">
              ✨
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400">ความปรารถนารวม</div>
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">{totalWishes} รายการ</div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#dcfce7] text-emerald-600 border border-emerald-200/60 flex items-center justify-center text-base font-bold shadow-sm">
              ✦
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400">สถานะระบบ</div>
              <div className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">Cloud Sync 100%</div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 🌤️ 3D LIQUID GLASS WEATHER & MOOD SANCTUARY (Image 1 Showcase) ==================== */}
      <div className="flex flex-col lg:flex-row items-center gap-6">
        <div className="w-full lg:w-auto shrink-0 flex justify-center">
          <LiquidGlassWeatherWidget 
            location="Make a Wish Sanctuary"
            mood="Sunny & Peaceful"
            temp="72°"
            humidity="55%"
            wind="8 mph"
          />
        </div>

        <div className="flex-1 glass-card p-6 sm:p-7 rounded-[32px] border-sky-200/60 flex flex-col justify-center space-y-2 relative overflow-hidden">
          {/* Subtle water droplet on corner */}
          <div className="water-droplet-accent top-4 right-6 w-2.5 h-3 opacity-80" />
          
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-[#e0f2fe] text-[#0284c7] w-fit">
            <Sparkles size={12} /> 3D Liquid Glass Texture
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            กล่องกระจกใส 3D Liquid Glassmorphism ✨
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            ดีไซน์พื้นหลังลายตาราง Gingham พาสเทลฟ้า พร้อมกล่องกระจกแก้วสะท้อนแสงนุ่มนวล Beveled Edge เงาแสงตกกระทบสมจริงตามสไตล์ที่คุณเลือก
          </p>
          <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-bold text-[#0284c7]">
            <span className="px-2.5 py-1 rounded-full bg-white/80 border border-sky-200/70 shadow-sm">💧 3D Droplets</span>
            <span className="px-2.5 py-1 rounded-full bg-white/80 border border-sky-200/70 shadow-sm">✨ Specular Bevel</span>
            <span className="px-2.5 py-1 rounded-full bg-white/80 border border-sky-200/70 shadow-sm">🎨 Pastel Blue Gingham</span>
          </div>
        </div>
      </div>

      {/* ==================== 💎 SPACES GRID (Matching Image 4) 💎 ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spaces.map((s) => (
          <div
            key={s.id}
            onClick={() => onOpenSpace(s)}
            className="glass-card p-6 sm:p-7 rounded-[32px] cursor-pointer hover:border-[#38bdf8] transition-all space-y-4 group relative overflow-hidden border-sky-100"
          >
            {/* 💧 3D Glass Water Droplets on Top-Right of Card */}
            <div className="water-droplet-accent top-4 right-4 w-2.5 h-3 opacity-75" />
            <div className="water-droplet-accent top-8 right-6 w-1.5 h-1.5 opacity-60" />

            {/* Ambient hover light */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-sky-300/15 rounded-full blur-2xl group-hover:bg-sky-300/30 transition-all pointer-events-none" />

            {/* Top row: Squircle emoji icon & Invite code pill */}
            <div className="flex items-start justify-between relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-100 to-sky-50 border border-sky-200/70 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform shadow-sm">
                {s.emoji}
              </div>
              <span className="text-xs font-mono font-black px-3.5 py-1 rounded-full bg-[#e0f2fe] text-[#0284c7] border border-[#bae6fd] shadow-sm">
                #{s.inviteCode}
              </span>
            </div>

            {/* Space title & Subtitle matching Image 4 */}
            <div className="relative z-10">
              <h3 className="font-black text-lg text-slate-900 dark:text-white group-hover:text-[#00a6ff] transition-colors">
                {s.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">
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
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-900 bg-sky-500/20 text-[#0284c7] text-[10px] font-bold flex items-center justify-center shadow-sm"
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

            {/* Divider line matching Image 4 */}
            <div className="pt-3 border-t border-sky-100 dark:border-sky-500/15 flex items-center justify-between text-xs font-bold relative z-10">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
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
