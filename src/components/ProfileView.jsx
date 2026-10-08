import React from 'react';
import { Camera, Sparkles, ShieldCheck } from 'lucide-react';

export default function ProfileView({ currentUser, onAvatarChange }) {
  return (
    <div className="space-y-6 animate-fade-in max-w-md mx-auto">
      {/* 3D Liquid Frosted Glass Profile Card (Matching Image 2 & Image 1) */}
      <div className="glass-card p-8 sm:p-9 rounded-[40px] space-y-6 text-center border-sky-200/80 dark:border-sky-500/25 shadow-2xl relative overflow-hidden">
        {/* 💧 3D Glass Water Droplets on Top-Left & Bottom-Right */}
        <div className="water-droplet-accent top-5 left-7 w-3 h-3.5 opacity-85" />
        <div className="water-droplet-accent top-9 left-5 w-2 h-2 opacity-75" />
        <div className="water-droplet-accent bottom-6 right-8 w-2.5 h-3 opacity-80" />

        {/* Soft Ambient Light Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-sky-300/20 rounded-full blur-2xl pointer-events-none" />

        {/* Avatar Circle with Floating Camera Button */}
        <div className="relative inline-block mx-auto z-10">
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-sky-200 via-sky-300 to-cyan-200 flex items-center justify-center text-5xl overflow-hidden shadow-2xl shadow-sky-300/40 mx-auto ring-4 ring-white dark:ring-slate-900">
            {currentUser.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              currentUser.emoji || '🌸'
            )}
          </div>
          <label 
            className="absolute bottom-0 right-0 p-2.5 bg-[#00a6ff] hover:bg-[#0284c7] text-white rounded-full cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-all border-2 border-white"
            title="เปลี่ยนรูปโปรไฟล์"
          >
            <Camera size={16} />
            <input type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
          </label>
        </div>

        {/* User Details matching Image 2 */}
        <div className="relative z-10 space-y-1">
          <h3 className="font-black text-2xl text-slate-900 dark:text-slate-100 flex items-center justify-center gap-1.5 tracking-tight">
            {currentUser.displayName}
            {currentUser.role === 'admin' && <span className="text-sm">👑</span>}
          </h3>
          <p className="text-sm text-[#00a6ff] font-mono font-bold">@{currentUser.username}</p>
          <p className="text-xs text-slate-400 font-medium">{currentUser.email}</p>
        </div>

        {/* Canvas Edge Compression Inset Box matching Image 2 */}
        <div className="text-xs text-slate-600 dark:text-slate-300 bg-[#e0f2fe]/70 border border-[#bae6fd]/80 p-4 rounded-2xl text-left space-y-1 relative z-10 shadow-sm">
          <div className="font-extrabold text-[#0284c7] flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#00a6ff]" /> Canvas Edge Compression:
          </div>
          <div className="font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
            รูปโปรไฟล์ถูกบีบอัดอัตโนมัติบนเครื่องของคุณเหลือ 256x256 px เพื่อความเร็วและประหยัดเน็ต 100%
          </div>
        </div>
      </div>
    </div>
  );
}
