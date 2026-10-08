import React, { useState } from 'react';
import { Search, Trash2, Users } from 'lucide-react';

export default function FriendsView({ friends, onAddFriend, onAcceptFriend, onDeleteFriend, showToast }) {
  const [friendSearchInput, setFriendSearchInput] = useState('');

  const handleAddFriend = async () => {
    if (!friendSearchInput.trim()) return;
    const res = await onAddFriend(friendSearchInput);
    if (res.status === 'success') {
      setFriendSearchInput('');
      showToast('ส่งคำขอสำเร็จ! 💕', `ขอเป็นเพื่อนกับ ${res.friend?.username}`);
    } else {
      showToast('ข้อผิดพลาด', res.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">เพื่อนของฉัน 💕</h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">ค้นหาเพื่อนด้วย @username เพื่อเริ่มแชร์ของขวัญร่วมกัน</p>
      </div>

      {/* Friend Search Bar */}
      <div className="glass-card p-3 rounded-2xl flex items-center gap-3">
        <Search className="text-stone-400 ml-2" size={18} />
        <input
          type="text"
          placeholder="ค้นหาเพื่อนด้วย @username เช่น @mook_ky"
          className="bg-transparent flex-1 outline-none text-xs sm:text-sm"
          value={friendSearchInput}
          onChange={(e) => setFriendSearchInput(e.target.value)}
        />
        <button
          onClick={handleAddFriend}
          className="btn-primary text-xs py-2 px-4"
        >
          ขอเป็นเพื่อน
        </button>
      </div>

      {/* Friends List */}
      <div className="space-y-3">
        <div className="font-bold text-xs text-stone-400 uppercase tracking-wider">
          รายชื่อเพื่อน ({friends.length})
        </div>
        {friends.map((f) => (
          <div key={f.id} className="glass-card p-4 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/15 flex items-center justify-center text-xl shrink-0">
                {f.emoji}
              </div>
              <div>
                <div className="font-bold text-sm">{f.displayName}</div>
                <div className="text-xs text-stone-400 font-mono">@{f.username}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {f.status === 'pending' ? (
                <button
                  onClick={async () => {
                    await onAcceptFriend(f.id);
                    showToast('ยอมรับคำขอเป็นเพื่อนแล้ว! 🌸');
                  }}
                  className="btn-primary text-[11px] py-1 px-3"
                >
                  ยอมรับคำขอ
                </button>
              ) : (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/15">
                  เพื่อนแล้ว ✨
                </span>
              )}
              <button
                onClick={async () => {
                  await onDeleteFriend(f.id);
                  showToast('ลบเพื่อนเรียบร้อย');
                }}
                className="p-1.5 text-stone-400 hover:text-rose-500 transition-colors"
                title="ลบเพื่อน"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
