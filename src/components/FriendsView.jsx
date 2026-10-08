import React, { useState } from 'react';
import { Search, Trash2, Users, Sparkles, UserPlus } from 'lucide-react';

export default function FriendsView({ friends, onAddFriend, onAcceptFriend, onDeleteFriend, showToast }) {
  const [friendSearchInput, setFriendSearchInput] = useState('');

  const handleAddFriend = async () => {
    if (!friendSearchInput.trim()) return;
    const res = await onAddFriend(friendSearchInput);
    if (res.status === 'success') {
      setFriendSearchInput('');
      showToast('ส่งคำขอสำเร็จ ✨', `ขอเป็นเพื่อนกับ ${res.friend?.username}`);
    } else {
      showToast('ข้อผิดพลาด', res.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
          เพื่อนของฉัน ✦
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          ค้นหาเพื่อนด้วย @username เพื่อเริ่มแชร์และมอบของขวัญร่วมกัน
        </p>
      </div>

      {/* Friend Search Bar */}
      <div className="glass-card p-3.5 rounded-2xl flex items-center gap-3 border-sky-200/50 dark:border-sky-500/20 shadow-sm">
        <Search className="text-sky-500 ml-2" size={18} />
        <input
          type="text"
          placeholder="ค้นหาเพื่อนด้วย @username เช่น @mook_ky"
          className="bg-transparent flex-1 outline-none text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
          value={friendSearchInput}
          onChange={(e) => setFriendSearchInput(e.target.value)}
        />
        <button
          onClick={handleAddFriend}
          className="btn-primary text-xs py-2 px-4 shadow-sm"
        >
          ขอเป็นเพื่อน
        </button>
      </div>

      {/* Friends List */}
      <div className="space-y-3">
        <div className="font-bold text-xs text-slate-400 uppercase tracking-wider px-1">
          รายชื่อเพื่อน ({friends.length})
        </div>
        {friends.length === 0 ? (
          <div className="glass-card p-10 text-center rounded-3xl border-sky-200/50 dark:border-sky-500/20 text-slate-400 text-xs">
            ยังไม่มีเพื่อนในรายชื่อ ค้นหาด้วย @username ด้านบนได้เลย
          </div>
        ) : (
          friends.map((f) => (
            <div key={f.id} className="glass-card p-4 rounded-2xl flex items-center justify-between gap-3 border-sky-200/50 dark:border-sky-500/20">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-sky-100 dark:bg-sky-500/15 border border-sky-200 dark:border-sky-400/20 flex items-center justify-center text-xl shrink-0 shadow-sm">
                  {f.emoji}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{f.displayName}</div>
                  <div className="text-xs text-sky-500 dark:text-sky-300 font-mono">@{f.username}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {f.status === 'pending' ? (
                  <button
                    onClick={async () => {
                      await onAcceptFriend(f.id);
                      showToast('ยอมรับคำขอเป็นเพื่อนแล้ว ✨');
                    }}
                    className="btn-primary text-[11px] py-1 px-3.5"
                  >
                    ยอมรับคำขอ
                  </button>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30">
                    เพื่อนแล้ว ✦
                  </span>
                )}
                <button
                  onClick={async () => {
                    await onDeleteFriend(f.id);
                    showToast('ลบเพื่อนเรียบร้อย');
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-lg"
                  title="ลบเพื่อน"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
