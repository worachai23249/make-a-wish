import React, { useState } from 'react';
import { Users, Plus, X, UserPlus, Check } from 'lucide-react';

export default function SpaceMembers({ members = [], friends = [], onInviteFriend }) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  return (
    <div className="glass-card p-6 rounded-[28px] border-sky-200/50 dark:border-sky-500/20 mb-6 relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Users size={17} className="text-sky-500" /> สมาชิกในห้อง ({members.length})
        </h3>
        <button
          onClick={() => setIsInviteOpen(!isInviteOpen)}
          className="text-[11px] font-bold text-sky-600 dark:text-sky-300 hover:text-white hover:bg-sky-400 bg-sky-100 dark:bg-sky-500/15 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all border border-sky-200 dark:border-sky-400/20"
        >
          {isInviteOpen ? <X size={13} /> : <><Plus size={13} /> เชิญเพื่อน</>}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        {members.map((memberName, idx) => (
          <div
            key={idx}
            className={`w-9 h-9 rounded-full bg-sky-100 dark:bg-sky-500/15 text-sky-600 dark:text-sky-300 font-bold text-xs flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm ${
              idx > 0 ? '-ml-2.5' : ''
            }`}
            title={memberName}
          >
            {memberName.charAt(0).toUpperCase()}
          </div>
        ))}
      </div>

      {isInviteOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 glass-panel p-4 rounded-3xl shadow-2xl z-30 border-sky-300/40 dark:border-sky-500/30 animate-fade-in">
          <div className="text-xs font-bold text-slate-400 mb-2.5 px-1 flex items-center justify-between">
            <span>รายชื่อเพื่อนของคุณ</span>
            <button onClick={() => setIsInviteOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          </div>
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {friends.filter(f => f.status === 'accepted').length === 0 ? (
              <div className="text-[11px] text-slate-400 p-4 text-center">ยังไม่มีเพื่อนในรายชื่อ</div>
            ) : (
              friends
                .filter((f) => f.status === 'accepted')
                .map((f) => {
                  const isAlreadyMember = members.includes(f.displayName);
                  return (
                    <div key={f.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-sky-500/8 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{f.emoji}</span>
                        <div>
                          <div className="font-bold text-xs text-slate-800 dark:text-slate-200">{f.displayName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">@{f.username}</div>
                        </div>
                      </div>
                      {isAlreadyMember ? (
                        <span className="text-[10px] text-slate-400 font-bold px-2 py-0.5 rounded-full bg-slate-500/10">อยู่ในห้องแล้ว</span>
                      ) : (
                        <button
                          onClick={() => {
                            onInviteFriend(f.displayName);
                            setIsInviteOpen(false);
                          }}
                          className="btn-primary py-1 px-3 text-[11px]"
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
