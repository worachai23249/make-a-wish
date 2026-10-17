import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Trash2,
  Users,
  Sparkles,
  UserPlus,
  Check,
  X,
  Clock,
  UserCheck,
  UserX,
  Loader2,
  HeartHandshake,
} from 'lucide-react';
import { searchUsersRealtime, getSuggestedFriends } from '../supabase';

export default function FriendsView({
  friends = [],
  incomingRequests = [],
  outgoingRequests = [],
  currentUser,
  onAddFriend,
  onAcceptFriend,
  onDeclineFriend,
  onCancelRequest,
  onDeleteFriend,
  showToast,
}) {
  const [friendSearchInput, setFriendSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Suggested Friends state
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [isLoadingSuggested, setIsLoadingSuggested] = useState(false);
  const [pendingSentIds, setPendingSentIds] = useState(new Set());

  const searchTimerRef = useRef(null);

  // Normalize data in case friends is passed as array or object
  const acceptedFriends = Array.isArray(friends)
    ? friends.filter((f) => f.status === 'accepted')
    : friends?.friends || [];

  const incoming = incomingRequests.length > 0
    ? incomingRequests
    : Array.isArray(friends)
    ? friends.filter((f) => f.status === 'pending' && f.receiverId === currentUser?.id)
    : friends?.incomingRequests || [];

  const outgoing = outgoingRequests.length > 0
    ? outgoingRequests
    : Array.isArray(friends)
    ? friends.filter((f) => f.status === 'pending' && f.senderId === currentUser?.id)
    : friends?.outgoingRequests || [];

  // Load Suggested Friends on mount
  useEffect(() => {
    if (currentUser?.id) {
      loadSuggestions();
    }
  }, [currentUser, acceptedFriends.length, incoming.length, outgoing.length]);

  const loadSuggestions = async () => {
    setIsLoadingSuggested(true);
    try {
      const suggestions = await getSuggestedFriends(currentUser.id);
      setSuggestedFriends(suggestions);
    } catch (_) {
    } finally {
      setIsLoadingSuggested(false);
    }
  };

  // Debounced Instant Live Search
  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    const clean = friendSearchInput.trim();
    if (!clean) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchUsersRealtime(clean, currentUser?.id);
        setSearchResults(results);
      } catch (_) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [friendSearchInput, currentUser?.id]);

  // Friend status checker for search results and suggestions
  const getFriendshipStatus = (userId, username) => {
    const cleanUsername = (username || '').toLowerCase().replace(/^@/, '');
    if (acceptedFriends.some((f) => f.id === userId || (f.username || '').toLowerCase() === cleanUsername)) {
      return 'accepted';
    }
    if (incoming.some((r) => r.id === userId || (r.username || '').toLowerCase() === cleanUsername)) {
      return 'incoming';
    }
    if (
      outgoing.some((r) => r.id === userId || (r.username || '').toLowerCase() === cleanUsername) ||
      pendingSentIds.has(userId)
    ) {
      return 'outgoing';
    }
    return 'none';
  };

  // Add friend handler
  const handleAddFriendAction = async (targetUsername, targetUserId = null) => {
    const clean = targetUsername.trim();
    if (!clean) return;

    setIsSubmitting(true);
    try {
      const res = await onAddFriend(clean);
      if (res?.status === 'success') {
        if (targetUserId) {
          setPendingSentIds((prev) => new Set([...prev, targetUserId]));
        }
        showToast('ส่งคำขอสำเร็จ ✨', res.message || `ส่งคำขอเป็นเพื่อนไปยัง @${clean.replace(/^@/, '')} แล้ว`);
        // Refresh suggestions
        loadSuggestions();
      } else {
        showToast('ไม่สามารถส่งคำขอได้', res?.message || 'เกิดข้อผิดพลาด');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!friendSearchInput.trim()) return;
    await handleAddFriendAction(friendSearchInput);
    setFriendSearchInput('');
    setSearchResults([]);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
          เพื่อนของฉัน ✦
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          ระบบเพื่อนสไตล์ Facebook — ค้นหาแบบเรียลไทม์ แนะนำเพื่อนที่คุณอาจรู้จัก และตอบรับคำขอเพื่อแชร์ความปรารถนาร่วมกัน
        </p>
      </div>

      {/* ==================== 1. REAL-TIME INSTANT SEARCH BAR ==================== */}
      <div className="relative">
        <form
          onSubmit={handleSearchSubmit}
          className="glass-card p-3 rounded-2xl flex items-center gap-2.5 border-sky-200/50 dark:border-sky-500/20 shadow-sm"
        >
          {isSearching ? (
            <Loader2 className="text-[#00a6ff] ml-2 shrink-0 animate-spin" size={18} />
          ) : (
            <Search className="text-[#00a6ff] ml-2 shrink-0" size={18} />
          )}
          <input
            type="text"
            placeholder="ค้นหาเพื่อนด้วยชื่อ หรือ @username (พิมพ์เพื่อค้นหาทันที)..."
            className="bg-transparent flex-1 outline-none text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            value={friendSearchInput}
            onChange={(e) => setFriendSearchInput(e.target.value)}
          />
          {friendSearchInput && (
            <button
              type="button"
              onClick={() => {
                setFriendSearchInput('');
                setSearchResults([]);
              }}
              className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !friendSearchInput.trim()}
            className="btn-primary text-xs py-2 px-4 shadow-sm inline-flex items-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            <UserPlus size={14} /> ขอเป็นเพื่อน
          </button>
        </form>

        {/* Real-time Search Results Dropdown */}
        {friendSearchInput.trim() && (
          <div className="mt-2 glass-panel rounded-3xl p-3 shadow-2xl border border-sky-200/80 dark:border-sky-500/30 animate-fade-in space-y-2">
            <div className="text-[11px] font-bold text-slate-400 px-2 flex items-center justify-between">
              <span>ผลการค้นหาแบบเรียลไทม์ ({searchResults.length})</span>
              {isSearching && <span className="text-[#00a6ff]">กำลังค้นหา...</span>}
            </div>

            {searchResults.length === 0 && !isSearching ? (
              <div className="py-6 text-center text-xs text-slate-400 space-y-1">
                <div>ไม่พบผู้ใช้ที่ตรงกับ "{friendSearchInput}"</div>
                <div className="text-[11px] text-slate-500">
                  คุณยังสามารถกดปุ่ม "ขอเป็นเพื่อน" เพื่อส่งคำขอไปยัง @username นั้นได้
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                {searchResults.map((user) => {
                  const status = getFriendshipStatus(user.id, user.username);
                  return (
                    <div
                      key={user.id}
                      className="p-2.5 rounded-2xl flex items-center justify-between gap-3 bg-white/50 dark:bg-slate-800/50 hover:bg-sky-50/50 dark:hover:bg-slate-700/50 transition-all border border-sky-100 dark:border-sky-500/10"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-200 to-cyan-200 flex items-center justify-center text-lg overflow-hidden shrink-0 shadow-sm">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                          ) : (
                            user.emoji || '🌸'
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                            {user.displayName}
                          </div>
                          <div className="text-[11px] text-[#00a6ff] font-mono font-bold truncate">
                            @{user.username}
                          </div>
                          {user.bio && (
                            <div className="text-[10px] text-slate-400 truncate max-w-xs">{user.bio}</div>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0">
                        {status === 'accepted' ? (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 inline-flex items-center gap-1">
                            <Check size={11} /> เป็นเพื่อนแล้ว
                          </span>
                        ) : status === 'outgoing' ? (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 inline-flex items-center gap-1">
                            <Clock size={11} /> ส่งคำขอแล้ว
                          </span>
                        ) : status === 'incoming' ? (
                          <span className="text-[10px] font-bold text-rose-500 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-400/30">
                            รอคุณตอบรับ 🔔
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleAddFriendAction(user.username, user.id)}
                            className="btn-primary text-xs py-1.5 px-3.5 inline-flex items-center gap-1 shadow-sm"
                          >
                            <UserPlus size={13} /> เพิ่มเพื่อน
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ==================== 🌟 2. PEOPLE YOU MAY KNOW (SUGGESTED FRIENDS) ==================== */}
      {suggestedFriends.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="font-extrabold text-xs text-sky-600 dark:text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#00a6ff]" /> คนที่คุณอาจจะรู้จัก (Suggested Friends)
            </div>
            <span className="text-[11px] text-slate-400 font-medium">แนะนำสำหรับคุณ</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {suggestedFriends.map((sug) => {
              const isSent = pendingSentIds.has(sug.id);
              return (
                <div
                  key={sug.id}
                  className="glass-card p-3.5 rounded-3xl flex items-center justify-between gap-3 border-sky-200/60 dark:border-sky-500/20 hover:border-sky-300 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-sky-200 to-cyan-200 flex items-center justify-center text-xl shrink-0 overflow-hidden shadow-sm">
                      {sug.avatarUrl ? (
                        <img src={sug.avatarUrl} alt={sug.displayName} className="w-full h-full object-cover" />
                      ) : (
                        sug.emoji || '🌸'
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                        {sug.displayName}
                      </div>
                      <div className="text-[11px] text-[#00a6ff] font-mono font-bold truncate">
                        @{sug.username}
                      </div>
                      {sug.bio && (
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{sug.bio}</div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isSent ? (
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 inline-flex items-center gap-1">
                        <Clock size={11} /> รอตอบรับ
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleAddFriendAction(sug.username, sug.id)}
                        className="btn-primary text-xs py-1.5 px-3 inline-flex items-center gap-1 shadow-sm"
                      >
                        <UserPlus size={13} /> เพิ่มเพื่อน
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== 🔔 3. INCOMING FRIEND REQUESTS ==================== */}
      {incoming.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="font-black text-xs text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>🔔</span> คำขอเป็นเพื่อนใหม่ ({incoming.length})
            </div>
            <span className="text-[11px] text-slate-400 font-medium">รอการตอบรับจากคุณ</span>
          </div>

          <div className="space-y-2">
            {incoming.map((req) => (
              <div
                key={req.friendshipId || req.id}
                className="glass-card p-4 rounded-2xl flex items-center justify-between gap-3 border-rose-200/60 dark:border-rose-500/30 bg-rose-50/20"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-rose-100 to-sky-100 border border-white flex items-center justify-center text-xl shrink-0 overflow-hidden shadow-sm">
                    {req.avatarUrl ? (
                      <img src={req.avatarUrl} alt={req.displayName} className="w-full h-full object-cover" />
                    ) : (
                      req.emoji || '🌸'
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-sm text-slate-900 dark:text-slate-100 truncate">
                      {req.displayName}
                    </div>
                    <div className="text-xs text-sky-600 dark:text-sky-400 font-mono font-bold truncate">
                      @{req.username}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                      ส่งคำขอเป็นเพื่อนถึงคุณ 💌
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={async () => {
                      await onAcceptFriend(req.friendshipId || req.id);
                      showToast('ยอมรับคำขอแล้ว ✨', `คุณและ ${req.displayName} เป็นเพื่อนกันแล้ว`);
                    }}
                    className="btn-primary text-xs py-1.5 px-3.5 inline-flex items-center gap-1 shadow-sm"
                  >
                    <Check size={13} /> ตอบรับ
                  </button>
                  <button
                    onClick={async () => {
                      if (onDeclineFriend) {
                        await onDeclineFriend(req.friendshipId || req.id);
                      } else {
                        await onDeleteFriend(req.friendshipId || req.id);
                      }
                      showToast('ลบคำขอแล้ว', `ปฏิเสธคำขอจาก @${req.username}`);
                    }}
                    className="btn-secondary text-xs py-1.5 px-3 inline-flex items-center gap-1 text-slate-600 hover:text-rose-500"
                  >
                    <X size={13} /> ลบคำขอ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== ⏳ 4. OUTGOING FRIEND REQUESTS (SENT) ==================== */}
      {outgoing.length > 0 && (
        <div className="space-y-3">
          <div className="font-black text-xs text-amber-500 uppercase tracking-wider px-1 flex items-center gap-1.5">
            <Clock size={13} /> คำขอที่คุณส่งแล้ว รอการตอบรับ ({outgoing.length})
          </div>

          <div className="space-y-2">
            {outgoing.map((req) => (
              <div
                key={req.friendshipId || req.id}
                className="glass-card p-3.5 rounded-2xl flex items-center justify-between gap-3 border-amber-200/50 dark:border-amber-500/20 bg-amber-50/15"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-amber-100/60 border border-white flex items-center justify-center text-lg shrink-0 overflow-hidden shadow-sm">
                    {req.avatarUrl ? (
                      <img src={req.avatarUrl} alt={req.displayName} className="w-full h-full object-cover" />
                    ) : (
                      req.emoji || '👤'
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate">
                      {req.displayName}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">
                      @{req.username}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30">
                    รอการตอบรับ ⏳
                  </span>
                  <button
                    onClick={async () => {
                      if (onCancelRequest) {
                        await onCancelRequest(req.friendshipId || req.id);
                      } else {
                        await onDeleteFriend(req.friendshipId || req.id);
                      }
                      showToast('ยกเลิกคำขอแล้ว', `ยกเลิกคำขอถึง @${req.username}`);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-lg text-xs"
                    title="ยกเลิกคำขอ"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== 👥 5. ALL ACCEPTED FRIENDS ==================== */}
      <div className="space-y-3">
        <div className="font-bold text-xs text-slate-400 uppercase tracking-wider px-1 flex items-center justify-between">
          <span>เพื่อนทั้งหมด ({acceptedFriends.length})</span>
          {acceptedFriends.length > 0 && (
            <span className="text-[10px] text-emerald-600 font-bold inline-flex items-center gap-1">
              <UserCheck size={12} /> ยืนยันเป็นเพื่อนแล้ว
            </span>
          )}
        </div>

        {acceptedFriends.length === 0 ? (
          <div className="glass-card p-10 text-center rounded-[32px] border-sky-200/50 dark:border-sky-500/20 text-slate-400 space-y-3 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-sky-100 text-2xl mx-auto flex items-center justify-center shadow-inner">
              👥
            </div>
            <div className="font-black text-sm text-slate-700 dark:text-slate-200">
              ยังไม่มีเพื่อนในรายชื่อ
            </div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium leading-relaxed">
              ค้นหาเพื่อนด้วยช่องค้นหาด้านบน หรือเลือกจากรายชื่อ "คนที่คุณอาจจะรู้จัก" เพื่อส่งคำขอเป็นเพื่อน เมื่ออีกฝ่ายกดยอมรับคำขอแล้ว รายชื่อเพื่อนจะแสดงที่นี่ทันที
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {acceptedFriends.map((f) => (
              <div
                key={f.friendshipId || f.id}
                className="glass-card p-4 rounded-2xl flex items-center justify-between gap-3 border-sky-200/50 dark:border-sky-500/20 hover:border-sky-300 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-sky-100 to-sky-50 dark:bg-sky-500/15 border border-sky-200 dark:border-sky-400/20 flex items-center justify-center text-xl shrink-0 overflow-hidden shadow-sm">
                    {f.avatarUrl ? (
                      <img src={f.avatarUrl} alt={f.displayName} className="w-full h-full object-cover" />
                    ) : (
                      f.emoji || '🌸'
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-sm text-slate-900 dark:text-slate-100 truncate">
                      {f.displayName}
                    </div>
                    <div className="text-xs text-sky-500 dark:text-sky-300 font-mono font-bold truncate">
                      @{f.username}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30">
                    เพื่อนแล้ว ✦
                  </span>
                  <button
                    onClick={async () => {
                      if (!confirm(`คุณต้องการเลิกเป็นเพื่อนกับ ${f.displayName} ใช่หรือไม่?`)) return;
                      await onDeleteFriend(f.friendshipId || f.id);
                      showToast('เลิกเป็นเพื่อนแล้ว', f.displayName);
                    }}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                    title="เลิกเป็นเพื่อน"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
