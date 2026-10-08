import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Users, Plus, X, UserPlus, Check, Search, Sparkles } from 'lucide-react';

export default function SpaceMembers({ members = [], friends = [], onInviteFriend }) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [searchFriend, setSearchFriend] = useState('');

  const acceptedFriends = friends.filter((f) => f.status === 'accepted');
  const filteredFriends = acceptedFriends.filter((f) =>
    f.displayName.toLowerCase().includes(searchFriend.toLowerCase()) ||
    f.username.toLowerCase().includes(searchFriend.toLowerCase())
  );

  return (
    <>
      {/* ==================== 💎 SPACE MEMBERS CARD (COMPACT & CLEAN) ==================== */}
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
            onClick={() => setIsInviteModalOpen(true)}
            className="btn-primary text-xs py-2 px-4 shadow-sm"
          >
            <Plus size={14} /> เชิญเพื่อน
          </button>
        </div>

        {/* Members Avatars Stack */}
        <div className="flex flex-wrap items-center gap-2 py-1">
          {members.length === 0 ? (
            <span className="text-xs text-slate-400 font-medium">ยังไม่มีสมาชิกในห้อง</span>
          ) : (
            members.map((memberName, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-white dark:border-slate-700 shadow-sm text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-sky-300 to-cyan-300 text-[#0284c7] font-black text-[10px] flex items-center justify-center">
                  {memberName.charAt(0).toUpperCase()}
                </div>
                <span className="truncate max-w-[120px]">{memberName}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ==================== 🌟 INVITE FRIENDS MODAL (PORTAL TO BODY) ==================== */}
      {/* Mounted to document.body via createPortal to eliminate any container clipping or rectangles */}
      {isInviteModalOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="modal-overlay" 
          onClick={() => setIsInviteModalOpen(false)}
        >
          <div
            className="glass-panel w-full max-w-md p-6 sm:p-8 rounded-[38px] space-y-5 border-white dark:border-sky-500/30 shadow-2xl relative animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-[#00a6ff]" /> เชิญเพื่อนเข้าห้อง ✦
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  เพื่อนทั้งหมดที่ตอบรับคำขอแล้ว ({acceptedFriends.length} คน)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-500/10 text-slate-400 hover:text-slate-600 transition-colors"
                title="ปิด"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อเพื่อน หรือ @username..."
                value={searchFriend}
                onChange={(e) => setSearchFriend(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-white dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-[#00a6ff] shadow-sm"
              />
            </div>

            {/* Friends Scrollable List Container */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {acceptedFriends.length === 0 ? (
                <div className="py-7 px-4 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
                  <div className="text-3xl">👥</div>
                  <div className="font-bold text-sm text-slate-700 dark:text-slate-200">ยังไม่มีเพื่อนในรายชื่อ</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mx-auto">
                    คุณสามารถไปที่แท็บ "เพื่อนของฉัน" ด้านบน เพื่อค้นหาและเพิ่มเพื่อนด้วย @username ก่อนได้ครับ
                  </p>
                </div>
              ) : filteredFriends.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 font-medium">
                  ไม่พบเพื่อนที่ตรงกับคำค้นหา "{searchFriend}"
                </div>
              ) : (
                filteredFriends.map((f) => {
                  const isAlreadyMember = members.includes(f.displayName);
                  return (
                    <div
                      key={f.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-white dark:border-slate-700/80 hover:bg-white/95 dark:hover:bg-slate-800 transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-100 to-sky-50 dark:bg-slate-700 border border-white dark:border-slate-600 flex items-center justify-center text-xl shrink-0 shadow-sm">
                          {f.emoji || '🌸'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                            {f.displayName}
                          </div>
                          <div className="text-[10px] text-[#00a6ff] font-mono font-bold truncate">
                            @{f.username}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 ml-2">
                        {isAlreadyMember ? (
                          <span className="text-[10px] text-slate-500 font-bold px-3 py-1 rounded-full bg-slate-200/70 dark:bg-slate-700 inline-flex items-center gap-1">
                            <Check size={11} className="text-emerald-500" /> อยู่ในห้องแล้ว
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              onInviteFriend(f.displayName);
                            }}
                            className="btn-primary py-1.5 px-4 text-xs font-bold shadow-sm"
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

            {/* Modal Bottom Close Button */}
            <div className="pt-2 border-t border-white/60 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="btn-secondary w-full py-2.5 text-xs font-bold"
              >
                เสร็จสิ้น / ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
