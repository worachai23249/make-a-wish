import React from 'react';
import { Camera, Sparkles } from 'lucide-react';

export default function ProfileView({ currentUser, onAvatarChange }) {
  return (
    <div className="space-y-6 animate-fade-in max-w-md mx-auto">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center">โปรไฟล์ของฉัน ✨</h1>
      <div className="glass-card p-8 rounded-3xl space-y-6 text-center border-rose-500/20">
        <div className="relative inline-block mx-auto">
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-5xl overflow-hidden shadow-xl shadow-rose-500/25 mx-auto ring-4 ring-white dark:ring-stone-900">
            {currentUser.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              currentUser.emoji || '🌸'
            )}
          </div>
          <label className="absolute bottom-0 right-0 p-2.5 bg-rose-500 text-white rounded-full cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-all">
            <Camera size={16} />
            <input type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
          </label>
        </div>

        <div>
          <h3 className="font-extrabold text-xl">{currentUser.displayName}</h3>
          <p className="text-xs text-rose-500 font-mono mt-0.5">@{currentUser.username}</p>
          <p className="text-xs text-stone-400 mt-1">{currentUser.email}</p>
        </div>

        <div className="text-xs text-stone-500 dark:text-stone-400 bg-rose-500/8 border border-rose-500/15 p-3.5 rounded-2xl text-left space-y-1">
          <div className="font-bold text-rose-500 flex items-center gap-1">
            <Sparkles size={13} /> Canvas Smart Compression (Edge Speed):
          </div>
          <div>รูปโปรไฟล์ถูกบีบอัดอัตโนมัติบนเครื่องของคุณเหลือ 256x256 px เพื่อความเร็วและประหยัดเน็ต 100%</div>
        </div>
      </div>
    </div>
  );
}
