import React, { useState } from 'react';
import { Users, Plus, X, UserPlus } from 'lucide-react';

export default function SpaceMembers({ members = [], friends = [], onInviteFriend }) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  return (
    <div className="glass-card p-4 rounded-2xl border-rose-500/20 mb-6 relative">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-extrabold text-sm text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
          <Users size={16} className="text-rose-500" /> สมาชิกในห้อง ({members.length})
        </h3>
        <button
          onClick={() => setIsInviteOpen(!isInviteOpen)}
          className="text-[11px] font-bold text-rose-500 hover:text-white bg-rose-500/10 hover:bg-rose-500 px-2.5 py-1 rounded-full flex items-center gap-1 transition-all"
        >
          {isInviteOpen ? <X size={12} /> : <><Plus size={12} /> เชิญเพื่อน</>}
        </button>
      </div>

      <div className="flex flex-wrap items-center">
        {members.map((memberName, idx) => (
          <div
            key={idx}
            className={`w-8 h-8 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center border-2 border-white dark:border-stone-900 ${
              idx > 0 ? '-ml-2' : ''
            }`}
            title={memberName}
          >
            {memberName.charAt(0).toUpperCase()}
          </div>
        ))}
      </div>

      {isInviteOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 glass-panel p-3 rounded-2xl shadow-xl z-30 border-rose-500/20">
          <div className="text-xs font-bold text-stone-500 mb-2 px-1">เพื่อนของคุณ</div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {friends.filter(f => f.status === 'accepted').length === 0 ? (
              <div className="text-[11px] text-stone-400 p-2 text-center">ยังไม่มีเพื่อนในรายชื่อ</div>
            ) : (
              friends
                .filter((f) => f.status === 'accepted')
                .map((f) => {
                  const isAlreadyMember = members.includes(f.displayName);
                  return (
                    <div key={f.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-500/5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{f.emoji}</span>
                        <div>
                          <div className="font-bold text-[11px]">{f.displayName}</div>
                          <div className="text-[9px] text-stone-400">@{f.username}</div>
                        </div>
                      </div>
                      {isAlreadyMember ? (
                        <span className="text-[10px] text-stone-400 font-medium">อยู่ในห้องแล้ว ✓</span>
                      ) : (
                        <button
                          onClick={() => {
                            onInviteFriend(f.displayName);
                            setIsInviteOpen(false);
                          }}
                          className="btn-primary py-1 px-2.5 text-[10px]"
                        >
                          เชิญ
                        </button>
                      )}
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
