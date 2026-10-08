import React from 'react';
import { Plus, KeyRound, ChevronRight, LayoutDashboard } from 'lucide-react';

export default function DashboardView({ spaces, onOpenSpace, onCreateSpace, onJoinSpace }) {
  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">ห้องแชร์ความปรารถนา 🌸</h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            เลือกห้องเพื่อดูรายการของขวัญ หรือสร้างห้องใหม่เพื่อแชร์กับแฟนและเพื่อน
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={onJoinSpace} className="btn-secondary text-xs py-2.5 px-4">
            <KeyRound size={15} /> ใส่รหัสเข้าห้อง
          </button>
          <button onClick={onCreateSpace} className="btn-primary text-xs py-2.5 px-4">
            <Plus size={16} /> สร้างห้องใหม่
          </button>
        </div>
      </div>

      {/* Spaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {spaces.map((s) => (
          <div
            key={s.id}
            onClick={() => onOpenSpace(s)}
            className="glass-card p-6 rounded-3xl cursor-pointer hover:border-rose-500/40 transition-all space-y-4 group"
          >
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform shadow-sm">
                {s.emoji}
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500">
                #{s.inviteCode}
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-base sm:text-lg group-hover:text-rose-500 transition-colors">
                {s.name}
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                {s.type === '1on1' ? 'ห้องคู่ 1-on-1 (คู่รัก/เพื่อนสนิท)' : 'ห้องกลุ่ม (เพื่อนหลายคน)'}
              </p>
            </div>

            {/* Members count & wishes */}
            <div className="pt-3 border-t border-rose-500/10 flex items-center justify-between text-xs text-stone-500 font-semibold">
              <span>🎁 {s.wishCount || 0} ความปรารถนา</span>
              <span className="text-rose-500 flex items-center gap-1 font-bold group-hover:translate-x-0.5 transition-transform">
                เข้าห้อง <ChevronRight size={15} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
