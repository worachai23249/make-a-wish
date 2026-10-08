import React from 'react';
import { Camera, Sparkles, ShieldCheck } from 'lucide-react';

export default function ProfileView({ currentUser, onAvatarChange }) {
  return (
    <div className="space-y-6 animate-fade-in max-w-md mx-auto">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
        โปรไฟล์ของฉัน ✦
      </h1>
      <div className="glass-card p-8 rounded-[36px] space-y-6 text-center border-sky-200/50 dark:border-sky-500/20 shadow-xl relative overflow-hidden">
        {/* Soft Ambient Light Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-sky-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative inline-block mx-auto z-10">
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-sky-400 via-sky-500 to-blue-600 flex items-center justify-center text-5xl overflow-hidden shadow-2xl shadow-sky-500/30 mx-auto ring-4 ring-white dark:ring-slate-900">
            {currentUser.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              currentUser.emoji || '🌸'
            )}
          </div>
          <label className="absolute bottom-0 right-0 p-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-full cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-all">
            <Camera size={16} />
            <input type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
          </label>
        </div>

        <div className="relative z-10">
          <h3 className="font-extrabold text-xl text-slate-900 dark:text-slate-100 flex items-center justify-center gap-1.5">
            {currentUser.displayName}
            {currentUser.role === 'admin' && <span className="text-sm">👑</span>}
          </h3>
          <p className="text-xs text-sky-600 dark:text-sky-400 font-mono mt-0.5">@{currentUser.username}</p>
          <p className="text-xs text-slate-400 mt-1">{currentUser.email}</p>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 bg-sky-500/8 border border-sky-400/20 p-4 rounded-2xl text-left space-y-1 relative z-10">
          <div className="font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
            <Sparkles size={14} /> Canvas Edge Compression:
          </div>
          <div>รูปโปรไฟล์ถูกบีบอัดอัตโนมัติบนเครื่องของคุณเหลือ 256x256 px เพื่อความเร็วและประหยัดเน็ต 100%</div>
        </div>
      </div>
    </div>
  );
}
