import React, { useState } from 'react';
import { Users, Plus, X, UserPlus, Check, Search, Sparkles } from 'lucide-react';

export default function SpaceMembers({ members = [], friends = [], onInviteFriend }) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [searchFriend, setSearchFriend] = useState('');

  const acceptedFriends = friends.filter((f) => f.status === 'accepted');
  const filteredFriends = acceptedFriends.filter((f) =>
    f.displayName.toLowerCase().includes(searchFriend.toLowerCase()) ||
    f.username.toLowerCase().includes(searchFriend.toLowerCase())
  );

  return (
    <div className="glass-card p-6 sm:p-7 rounded-[36px] mb-6 relative transition-all">
      {/* 💧 3D Glass Water Droplet */}
      <div className="water-droplet-accent top-4 right-4 w-2 h-2.5 opacity-65" />

      {/* Header Row */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-sm sm:text-base text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Users size={18} className="text-[#00a6ff]" /> สมาชิกในห้อง ({members.length})
        </h3>
        <button
          type="button"
          onClick={() => setIsInviteOpen(!isInviteOpen)}
          className={`text-xs py-1.5 px-4 font-bold rounded-full transition-all flex items-center gap-1.5 shadow-sm ${
            isInviteOpen
              ? 'btn-secondary text-rose-500 border-rose-200'
              : 'btn-primary text-white text-[11px]'
          }`}
        >
          {isInviteOpen ? (
            <>
              <X size={14} /> ปิด
            </>
          ) : (
            <>
              <Plus size={14} /> เชิญเพื่อน
            </>
          )}
        </button>
      </div>

      {/* Members Avatars Stack */}
      <div className="flex flex-wrap items-center gap-1.5 py-1">
        {members.length === 0 ? (
          <span className="text-xs text-slate-400 font-medium">ยังไม่มีสมาชิกในห้อง</span>
        ) : (
          members.map((memberName, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 dark:bg-slate-800/80 border border-white dark:border-slate-700 shadow-sm text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-sky-300 to-cyan-300 text-[#0284c7] font-black text-[10px] flex items-center justify-center">
                {memberName.charAt(0).toUpperCase()}
              </div>
              <span className="truncate max-w-[120px]">{memberName}</span>
            </div>
          ))
        )}
      </div>

      {/* ==================== 🌸 IN-CARD INLINE INVITE PANEL (NO OVERFLOW/CLIPPING) ==================== */}
      {isInviteOpen && (
        <div className="mt-5 pt-5 border-t border-white/60 dark:border-sky-500/20 space-y-3.5 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#00a6ff]" /> เลือกเพื่อนที่จะเชิญเข้าห้อง ({acceptedFriends.length})
            </div>
            <button
              onClick={() => setIsInviteOpen(false)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white/60 transition-colors"
              title="ปิด"
            >
              <X size={15} />
            </button>
          </div>

          {/* Quick Friend Search Bar */}
          {acceptedFriends.length > 3 && (
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อเพื่อน หรือ @username..."
                value={searchFriend}
                onChange={(e) => setSearchFriend(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-white dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-[#00a6ff]"
              />
            </div>
          )}

          {/* Friends List Container */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {acceptedFriends.length === 0 ? (
              <div className="p-5 text-center rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-white/80 dark:border-slate-700 text-xs text-slate-500 space-y-1">
                <div className="text-lg">👥</div>
                <div className="font-bold">ยังไม่มีเพื่อนในรายชื่อที่ตอบรับแล้ว</div>
                <div className="text-[11px] text-slate-400">ไปที่แท็บ "เพื่อนของฉัน" เพื่อเพิ่มเพื่อนด้วย @username ก่อนนะ</div>
              </div>
            ) : filteredFriends.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 font-medium">
                ไม่พบเพื่อนที่ค้นหา
              </div>
            ) : (
              filteredFriends.map((f) => {
                const isAlreadyMember = members.includes(f.displayName);
                return (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-white dark:border-slate-700/80 hover:bg-white/90 dark:hover:bg-slate-800 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-100 to-sky-50 dark:bg-slate-700 border border-white dark:border-slate-600 flex items-center justify-center text-lg shrink-0 shadow-sm">
                        {f.emoji || '🌸'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                          {f.displayName}
                        </div>
                        <div className="text-[10px] text-[#00a6ff] font-mono font-semibold truncate">
                          @{f.username}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isAlreadyMember ? (
                        <span className="text-[10px] text-slate-500 font-bold px-3 py-1 rounded-full bg-slate-200/60 dark:bg-slate-700 inline-flex items-center gap-1">
                          <Check size={11} className="text-emerald-500" /> อยู่ในห้องแล้ว
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            onInviteFriend(f.displayName);
                            setIsInviteOpen(false);
                          }}
                          className="btn-primary py-1 px-3.5 text-[11px] font-bold shadow-sm"
                        >
                          เชิญเข้าห้อง ✦
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
