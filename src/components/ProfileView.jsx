import React, { useState, useEffect } from 'react';
import {
  Camera,
  Sparkles,
  ShieldCheck,
  Edit3,
  Gift,
  Users,
  Info,
  Check,
  ExternalLink,
  Heart,
  Calendar,
  Save,
  Smile,
  X,
} from 'lucide-react';
import { updateUserProfile, getUserWishes } from '../supabase';

const EMOJI_OPTIONS = ['🌸', '✨', '💎', '🎀', '🎁', '⭐', '🦄', '🐱', '🐶', '🧸', '🌈', '🍰', '☕', '🪐', '👑', '🔥'];

export default function ProfileView({
  currentUser,
  onAvatarChange,
  onUpdateUser,
  friends = [],
  spaces = [],
  showToast,
}) {
  const [activeTab, setActiveTab] = useState('wishes'); // 'wishes' | 'friends' | 'about'
  const [userWishes, setUserWishes] = useState([]);
  const [isLoadingWishes, setIsLoadingWishes] = useState(false);

  // Bio state
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(currentUser?.bio || '');

  // Personal Info Edit state
  const [editForm, setEditForm] = useState({
    displayName: currentUser?.displayName || '',
    emoji: currentUser?.emoji || '🌸',
  });
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  // Load user wishes
  useEffect(() => {
    if (currentUser?.id) {
      loadWishes();
      setBioInput(currentUser.bio || '');
      setEditForm({
        displayName: currentUser.displayName || '',
        emoji: currentUser.emoji || '🌸',
      });
    }
  }, [currentUser]);

  const loadWishes = async () => {
    setIsLoadingWishes(true);
    try {
      const wishes = await getUserWishes(currentUser.id);
      setUserWishes(wishes);
    } catch (_) {
    } finally {
      setIsLoadingWishes(false);
    }
  };

  // Canvas Image Compression for Cover Photo
  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_W = 900;
        const MAX_H = 320;
        let w = img.width;
        let h = img.height;

        // Scale to fit max bounds
        if (w > MAX_W) {
          h = Math.round((h * MAX_W) / w);
          w = MAX_W;
        }
        if (h > MAX_H) {
          w = Math.round((w * MAX_H) / h);
          h = MAX_H;
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const base64 = canvas.toDataURL('image/jpeg', 0.82);

        await updateUserProfile(currentUser.id, { coverUrl: base64 });
        if (onUpdateUser) {
          onUpdateUser({ ...currentUser, coverUrl: base64 });
        }
        showToast?.('อัปเดตรูปภาพหน้าปกสำเร็จ 🎨', 'ขนาดภาพถูกบีบอัดและซิงก์เรียบร้อย');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Save Bio
  const handleSaveBio = async () => {
    const cleanBio = bioInput.trim();
    await updateUserProfile(currentUser.id, { bio: cleanBio });
    if (onUpdateUser) {
      onUpdateUser({ ...currentUser, bio: cleanBio });
    }
    setIsEditingBio(false);
    showToast?.('บันทึกคำแนะนำตัวแล้ว ✨');
  };

  // Save Personal Info
  const handleSaveInfo = async (e) => {
    e.preventDefault();
    if (!editForm.displayName.trim()) return;

    setIsSavingInfo(true);
    try {
      await updateUserProfile(currentUser.id, {
        displayName: editForm.displayName.trim(),
        emoji: editForm.emoji,
      });
      if (onUpdateUser) {
        onUpdateUser({
          ...currentUser,
          displayName: editForm.displayName.trim(),
          emoji: editForm.emoji,
        });
      }
      showToast?.('อัปเดตข้อมูลส่วนตัวสำเร็จ ✨');
    } finally {
      setIsSavingInfo(false);
    }
  };

  const acceptedFriends = Array.isArray(friends) ? friends : [];

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto pb-12">
      {/* ==================== 1. FACEBOOK-STYLE PROFILE HEADER CARD ==================== */}
      <div className="glass-card rounded-[36px] overflow-hidden border-sky-200/80 dark:border-sky-500/25 shadow-2xl relative">
        {/* Soft Ambient Light Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-300/20 rounded-full blur-3xl pointer-events-none" />

        {/* --- COVER PHOTO BANNER --- */}
        <div className="relative h-44 sm:h-64 w-full bg-gradient-to-r from-sky-200 via-sky-300 to-cyan-200 dark:from-sky-900/60 dark:via-sky-800/60 dark:to-cyan-900/60 overflow-hidden group">
          {currentUser.coverUrl ? (
            <img
              src={currentUser.coverUrl}
              alt="Cover"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center relative">
              {/* Decorative Subtle Background Pattern */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00a6ff_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="text-center text-sky-700/60 dark:text-sky-300/60 font-bold text-xs sm:text-sm flex items-center gap-2">
                <Sparkles size={16} /> ภาพหน้าปกสไตล์ Facebook — คลิกปุ่มด้านล่างเพื่ออัปโหลดภาพของคุณ
              </div>
            </div>
          )}

          {/* Floating Edit Cover Photo Button */}
          <label
            className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 py-2 px-3.5 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl cursor-pointer shadow-lg backdrop-blur-md transition-all hover:scale-105 active:scale-95 text-xs font-bold flex items-center gap-1.5 border border-white/60 dark:border-white/10"
            title="เปลี่ยนรูปภาพหน้าปก"
          >
            <Camera size={14} className="text-[#00a6ff]" />
            <span className="hidden sm:inline">แก้ไขรูปหน้าปก</span>
            <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
          </label>
        </div>

        {/* --- PROFILE AVATAR & INFO ROW (OVERLAPPING BANNER) --- */}
        <div className="px-6 sm:px-8 pb-6 pt-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4 relative z-10">
            {/* Avatar Circle with Floating Camera Button */}
            <div className="relative">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-sky-200 via-sky-300 to-cyan-200 flex items-center justify-center text-5xl sm:text-6xl overflow-hidden shadow-2xl shadow-sky-400/40 ring-4 sm:ring-[6px] ring-white dark:ring-slate-900 bg-white">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  currentUser.emoji || '🌸'
                )}
              </div>
              <label
                className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 p-2.5 bg-[#00a6ff] hover:bg-[#0284c7] text-white rounded-full cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-all border-2 border-white dark:border-slate-900"
                title="เปลี่ยนรูปโปรไฟล์"
              >
                <Camera size={16} />
                <input type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
              </label>
            </div>

            {/* Quick Action Buttons on Right (Facebook Style) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditingBio(!isEditingBio)}
                className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1.5 shadow-sm"
              >
                <Edit3 size={14} className="text-[#00a6ff]" />
                {currentUser.bio ? 'แก้ไข Bio' : '+ เพิ่ม Bio'}
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 shadow-sm"
              >
                <Info size={14} /> แก้ไขข้อมูล
              </button>
            </div>
          </div>

          {/* Name & Username */}
          <div className="text-center sm:text-left space-y-1">
            <h2 className="font-black text-2xl sm:text-3xl text-slate-900 dark:text-slate-100 flex items-center justify-center sm:justify-start gap-2 tracking-tight">
              {currentUser.displayName}
              {currentUser.role === 'admin' ? (
                <span className="text-base" title="ผู้ดูแลระบบ">👑</span>
              ) : (
                <span className="text-sky-500 inline-flex items-center" title="สมาชิกยืนยันตัวตนแล้ว">
                  <ShieldCheck size={20} />
                </span>
              )}
            </h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-400 font-medium">
              <span className="text-[#00a6ff] font-mono font-bold">@{currentUser.username}</span>
              <span>•</span>
              <span>เพื่อน {acceptedFriends.length} คน</span>
              <span>•</span>
              <span>{userWishes.length} ความปรารถนา</span>
            </div>
          </div>

          {/* --- BIO SECTION (FACEBOOK ABOUT INTRO) --- */}
          <div className="mt-4 pt-4 border-t border-sky-100 dark:border-sky-500/20">
            {isEditingBio ? (
              <div className="space-y-2.5 animate-fade-in">
                <textarea
                  rows={2}
                  maxLength={150}
                  placeholder="เขียนคำแนะนำสั้นๆ เกี่ยวกับตัวคุณ เช่น ชอบของขวัญน่ารักๆ หรือเกม..."
                  className="w-full text-xs sm:text-sm form-input resize-none"
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>เหลือ {150 - bioInput.length} ตัวอักษร</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditingBio(false)}
                      className="px-3 py-1 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={handleSaveBio}
                      className="btn-primary px-4 py-1 text-xs inline-flex items-center gap-1 shadow-sm"
                    >
                      <Save size={12} /> บันทึก Bio
                    </button>
                  </div>
                </div>
              </div>
            ) : currentUser.bio ? (
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic text-center sm:text-left bg-sky-50/50 dark:bg-sky-500/10 p-3 rounded-2xl border border-sky-100 dark:border-sky-500/20">
                "{currentUser.bio}"
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic text-center sm:text-left">
                ยังไม่มีคำอธิบายตัวเอง — คลิก "+ เพิ่ม Bio" เพื่อบอกให้เพื่อนรู้ว่าคุณชอบอะไร ✨
              </p>
            )}
          </div>

          {/* --- FACEBOOK PROFILE NAVIGATION TABS --- */}
          <div className="flex items-center gap-2 mt-6 pt-2 border-t border-sky-100 dark:border-sky-500/20 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('wishes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'wishes'
                  ? 'bg-[#00a6ff] text-white shadow-md shadow-sky-300/40'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800'
              }`}
            >
              <Gift size={14} /> ความปรารถนา ({userWishes.length})
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'friends'
                  ? 'bg-[#00a6ff] text-white shadow-md shadow-sky-300/40'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800'
              }`}
            >
              <Users size={14} /> เพื่อนทั้งหมด ({acceptedFriends.length})
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'about'
                  ? 'bg-[#00a6ff] text-white shadow-md shadow-sky-300/40'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800'
              }`}
            >
              <Info size={14} /> ข้อมูลส่วนตัว
            </button>
          </div>
        </div>
      </div>

      {/* ==================== 2. TAB CONTENT ==================== */}

      {/* TAB: WISHES */}
      {activeTab === 'wishes' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Gift size={16} className="text-[#00a6ff]" /> รายการของขวัญที่ฉันอยากได้
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              แสดงความปรารถนาทั้งหมดที่คุณสร้างไว้
            </span>
          </div>

          {isLoadingWishes ? (
            <div className="text-center py-12 text-slate-400 text-xs">กำลังโหลดรายการ...</div>
          ) : userWishes.length === 0 ? (
            <div className="glass-card p-10 text-center rounded-[32px] border-sky-200/60 dark:border-sky-500/20 text-slate-400 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-sky-100 dark:bg-sky-500/20 text-2xl mx-auto flex items-center justify-center">
                🎁
              </div>
              <div className="font-black text-sm text-slate-700 dark:text-slate-200">
                คุณยังไม่มีรายการความปรารถนา
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
                เข้าสู่ห้องของคุณแล้วกดปุ่ม "เพิ่มรายการ" เพื่อใส่ของขวัญที่คุณอยากได้ ให้เพื่อนๆ ได้เห็น
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {userWishes.map((w) => (
                <div
                  key={w.id}
                  className={`glass-card p-4 rounded-3xl border transition-all flex flex-col justify-between gap-3 ${
                    w.isFulfilled
                      ? 'border-emerald-200/80 bg-emerald-50/20 dark:border-emerald-500/25'
                      : 'border-sky-200/60 dark:border-sky-500/20 hover:border-sky-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-black text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                        {w.title}
                      </div>
                      {w.isFulfilled ? (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 shrink-0 inline-flex items-center gap-1">
                          <Check size={11} /> ได้รับแล้ว
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-400/30 shrink-0">
                          อยากได้ ✦
                        </span>
                      )}
                    </div>

                    {w.imageUrl && (
                      <div className="h-32 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img src={w.imageUrl} alt={w.title} className="w-full h-full object-cover" />
                      </div>
                    )}

                    {w.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {w.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="font-extrabold text-[#00a6ff]">
                      {w.price ? `฿${Number(w.price).toLocaleString()}` : 'ไม่ระบุราคา'}
                    </span>
                    {w.linkUrl && (
                      <a
                        href={w.linkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-[#00a6ff] transition-colors p-1"
                        title="เปิดลิงก์ร้านค้า"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: FRIENDS */}
      {activeTab === 'friends' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Users size={16} className="text-[#00a6ff]" /> เพื่อนที่ยืนยันแล้ว ({acceptedFriends.length})
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              เพื่อนของคุณในเครือข่าย Make a Wish
            </span>
          </div>

          {acceptedFriends.length === 0 ? (
            <div className="glass-card p-10 text-center rounded-[32px] border-sky-200/60 dark:border-sky-500/20 text-slate-400 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-sky-100 dark:bg-sky-500/20 text-2xl mx-auto flex items-center justify-center">
                👥
              </div>
              <div className="font-black text-sm text-slate-700 dark:text-slate-200">
                ยังไม่มีเพื่อนในรายชื่อ
              </div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
                ไปที่แท็บ "เพื่อนของฉัน" เพื่อค้นหาหรือเพิ่มเพื่อนใหม่จากระบบคนแนะนำ
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {acceptedFriends.map((f) => (
                <div
                  key={f.id || f.friendshipId}
                  className="glass-card p-4 rounded-3xl border border-sky-200/60 dark:border-sky-500/20 text-center space-y-2 hover:border-sky-300 transition-all shadow-sm"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-sky-200 to-cyan-200 mx-auto flex items-center justify-center text-2xl overflow-hidden ring-2 ring-white dark:ring-slate-900 shadow-md">
                    {f.avatarUrl ? (
                      <img src={f.avatarUrl} alt={f.displayName} className="w-full h-full object-cover" />
                    ) : (
                      f.emoji || '🌸'
                    )}
                  </div>
                  <div>
                    <div className="font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                      {f.displayName}
                    </div>
                    <div className="text-[11px] text-sky-600 dark:text-sky-400 font-mono font-bold truncate">
                      @{f.username}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: ABOUT / PERSONAL INFO */}
      {activeTab === 'about' && (
        <form onSubmit={handleSaveInfo} className="glass-card p-6 sm:p-8 rounded-[36px] space-y-6 border-sky-200/80 dark:border-sky-500/25 shadow-xl animate-fade-in">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Info size={18} className="text-[#00a6ff]" /> ข้อมูลส่วนตัวและบัญชี
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ปรับแต่งชื่อที่แสดงและอีโมจิประจำตัวของคุณ
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                ชื่อที่แสดง (Display Name)
              </label>
              <input
                type="text"
                required
                className="form-input text-xs sm:text-sm"
                value={editForm.displayName}
                onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                อีโมจิประจำตัว
              </label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setEditForm({ ...editForm, emoji: em })}
                    className={`w-10 h-10 rounded-2xl text-lg flex items-center justify-center transition-all ${
                      editForm.emoji === em
                        ? 'bg-[#00a6ff] text-white scale-110 shadow-md ring-2 ring-sky-300'
                        : 'bg-white/60 dark:bg-slate-800/60 hover:bg-white text-slate-700'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">ชื่อผู้ใช้ (@username)</label>
                <div className="form-input text-xs sm:text-sm bg-slate-100/60 dark:bg-slate-800/60 text-slate-500 font-mono select-none cursor-not-allowed">
                  @{currentUser.username}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">อีเมลที่ลงทะเบียน</label>
                <div className="form-input text-xs sm:text-sm bg-slate-100/60 dark:bg-slate-800/60 text-slate-500 select-none cursor-not-allowed">
                  {currentUser.email}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-sky-100 dark:border-sky-500/20">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#00a6ff]" /> ข้อมูลถูกเข้ารหัสและซิงก์ Cloud
            </div>
            <button
              type="submit"
              disabled={isSavingInfo}
              className="btn-primary py-2.5 px-6 text-xs inline-flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              <Save size={14} /> {isSavingInfo ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
            </button>
          </div>
        </form>
      )}

      {/* Canvas Edge Compression Note */}
      <div className="text-xs text-slate-600 dark:text-slate-300 bg-[#e0f2fe]/70 border border-[#bae6fd]/80 p-4 rounded-2xl space-y-1 shadow-sm">
        <div className="font-extrabold text-[#0284c7] flex items-center gap-1.5">
          <Sparkles size={14} className="text-[#00a6ff]" /> ระบบบีบอัดภาพ Canvas อัจฉริยะ (Facebook Style):
        </div>
        <div className="font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
          ทั้งภาพหน้าปก (Cover Photo ~30 KB) และรูปโปรไฟล์ (Avatar ~15 KB) จะถูกบีบอัดบน Browser ของคุณโดยตรงก่อนจัดเก็บ เพื่อความรวดเร็วและประหยัดพื้นที่ 100%
        </div>
      </div>
    </div>
  );
}
