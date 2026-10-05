import React, { useState, useEffect, useRef } from 'react';
import {
  getCurrentUser,
  login,
  register,
  logout,
  getSpaces,
  createSpace,
  joinSpace,
  getWishes,
  addWish,
  deleteWish,
  getFriends,
  addFriend,
  getAdminStats,
  getAdminUsers,
  deleteUserAdmin,
} from './supabase';

import {
  LayoutDashboard,
  Box,
  Gift,
  Users,
  User,
  ShieldCheck,
  Sun,
  Moon,
  LogOut,
  Plus,
  KeyRound,
  Trash2,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Search,
  Camera,
  X,
  Utensils,
  MapPin,
  Trophy,
  RotateCcw,
  Menu,
} from 'lucide-react';

// Confetti Hearts Component
function ConfettiHearts({ active }) {
  if (!active) return null;
  const hearts = Array.from({ length: 35 }).map((_, i) => ({
    id: i,
    left: Math.random() * 95,
    size: Math.random() * 20 + 20,
    delay: Math.random() * 0.5,
    emoji: ['💖', '💕', '✨', '🌸', '🎁', '💗'][Math.floor(Math.random() * 6)],
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {hearts.map((h) => (
        <div
          key={h.id}
          className="absolute animate-bounce text-2xl"
          style={{
            left: `${h.left}vw`,
            bottom: '-20px',
            fontSize: `${h.size}px`,
            animation: `flyUp 2.8s cubic-bezier(0.25, 1, 0.5, 1) ${h.delay}s forwards`,
          }}
        >
          {h.emoji}
        </div>
      ))}
      <style>{`
        @keyframes flyUp {
          0% { transform: translateY(0) scale(0.6); opacity: 0; }
          15% { opacity: 1; transform: translateY(-20vh) scale(1.2); }
          100% { transform: translateY(-110vh) scale(0.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });

  // Auth state (Persistent like Facebook)
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Nav tab state
  const [activeTab, setActiveTab] = useState(() => {
    const user = getCurrentUser();
    return user?.role === 'admin' ? 'admin' : 'dashboard';
  });

  // Active space view state (if inside a space)
  const [activeSpace, setActiveSpace] = useState(null);

  // Data states
  const [spaces, setSpaces] = useState([]);
  const [wishes, setWishes] = useState([]);
  const [friends, setFriends] = useState([]);
  const [adminStats, setAdminStats] = useState({ users: 0, spaces: 0, wishes: 0 });
  const [adminUsers, setAdminUsers] = useState([]);

  // Toast state
  const [toast, setToast] = useState(null);
  const showToast = (title, message) => {
    setToast({ title, message });
    setTimeout(() => setToast(null), 3000);
  };

  // Modals state
  const [isCreateSpaceOpen, setIsCreateSpaceOpen] = useState(false);
  const [isJoinSpaceOpen, setIsJoinSpaceOpen] = useState(false);
  const [isAddWishOpen, setIsAddWishOpen] = useState(false);
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Form states
  const [spaceForm, setSpaceForm] = useState({ name: '', type: '1on1', emoji: '💕' });
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [wishForm, setWishForm] = useState({ title: '', description: '', category: 'item', emoji: '⭐' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ displayName: '', username: '', email: '', password: '', emoji: '🌸' });
  const [friendSearchInput, setFriendSearchInput] = useState('');

  // Wish Filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');

  // Roulette States
  const [spinning, setSpinning] = useState(false);
  const [rouletteWinner, setRouletteWinner] = useState(null);
  const [rouletteIndex, setRouletteIndex] = useState(0);
  const [confettiActive, setConfettiActive] = useState(false);

  // Sync theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Load initial data
  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    if (!currentUser) return;
    const s = await getSpaces(currentUser.id);
    setSpaces(s);
    const f = await getFriends(currentUser.id);
    setFriends(f);
    if (currentUser.role === 'admin') {
      const stats = await getAdminStats();
      setAdminStats(stats);
      const u = await getAdminUsers();
      setAdminUsers(u);
    }
  };

  // Switch to space
  const openSpace = async (space) => {
    setActiveSpace(space);
    const w = await getWishes(space.id);
    setWishes(w);
  };

  // Auth Handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await login(loginForm.email, loginForm.password);
    if (res.status === 'success') {
      setCurrentUser(res.user);
      setActiveTab(res.user.role === 'admin' ? 'admin' : 'dashboard');
      showToast('เข้าสู่ระบบสำเร็จ! 🌸', `ยินดีต้อนรับ ${res.user.displayName}`);
    } else {
      showToast('เกิดข้อผิดพลาด', res.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerForm.password.length < 6) {
      showToast('ข้อผิดพลาด', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }
    const res = await register(registerForm);
    if (res.status === 'success') {
      setCurrentUser(res.user);
      setActiveTab('dashboard');
      showToast('สมัครสมาชิกสำเร็จ! 🎉', 'เข้าสู่ระบบให้อัตโนมัติเรียบร้อย');
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setActiveSpace(null);
    showToast('ออกจากระบบเรียบร้อย');
  };

  // Create Space
  const handleCreateSpace = async (e) => {
    e.preventDefault();
    if (!spaceForm.name.trim()) return;
    const newSpace = await createSpace(spaceForm, currentUser);
    setSpaces([newSpace, ...spaces]);
    setIsCreateSpaceOpen(false);
    setSpaceForm({ name: '', type: '1on1', emoji: '💕' });
    showToast('สร้างห้องสำเร็จ! 💕', `รหัสเชิญ: ${newSpace.inviteCode}`);
  };

  // Join Space
  const handleJoinSpace = async (e) => {
    e.preventDefault();
    const res = await joinSpace(joinCodeInput, currentUser);
    if (res.status === 'success') {
      setSpaces([res.space, ...spaces]);
      setIsJoinSpaceOpen(false);
      setJoinCodeInput('');
      showToast('เข้าร่วมห้องสำเร็จ! 🥳', res.space.name);
    } else {
      showToast('ไม่สำเร็จ', res.message);
    }
  };

  // Add Wish (Optimistic UI 0s)
  const handleAddWish = async (e) => {
    e.preventDefault();
    if (!wishForm.title.trim() || !activeSpace) return;
    setIsAddWishOpen(false);
    // Instant 0s UI update
    const newWish = await addWish(activeSpace.id, wishForm, currentUser);
    setWishes([newWish, ...wishes]);
    setWishForm({ title: '', description: '', category: 'item', emoji: '⭐' });
    showToast('เพิ่มของขวัญสำเร็จ! 🎁', newWish.title);
  };

  // Delete Wish (Optimistic UI 0s)
  const handleDeleteWish = async (wishId, title) => {
    if (!confirm(`คุณต้องการลบ "${title}" ใช่หรือไม่?`)) return;
    setWishes(wishes.filter((w) => w.id !== wishId));
    await deleteWish(activeSpace.id, wishId);
    showToast('ลบรายการเรียบร้อย');
  };

  // Roulette Spin Handler
  const startRoulette = () => {
    if (wishes.length === 0 || spinning) return;
    setSpinning(true);
    setRouletteWinner(null);
    setConfettiActive(false);

    let current = 0;
    const totalSteps = 25 + Math.floor(Math.random() * 15);
    let step = 0;
    let speed = 70;

    const spin = () => {
      current = (current + 1) % wishes.length;
      setRouletteIndex(current);
      step++;
      if (step < totalSteps) {
        if (step > totalSteps - 10) speed += 30;
        setTimeout(spin, speed);
      } else {
        setSpinning(false);
        setRouletteWinner(wishes[current]);
        setConfettiActive(true);
      }
    };
    setTimeout(spin, speed);
  };

  // Profile Image Compression (HTML5 Canvas to 256x256 @ 82% quality)
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 256;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > MAX) { h = Math.round((h * MAX) / w); w = MAX; }
        } else {
          if (h > MAX) { w = Math.round((w * MAX) / h); h = MAX; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const base64 = canvas.toDataURL('image/jpeg', 0.82);

        // Update user profile
        const updated = { ...currentUser, avatarUrl: base64 };
        setCurrentUser(updated);
        localStorage.setItem('makewish_auth_user', JSON.stringify(updated));
        showToast('บีบอัดรูปสำเร็จ! 🌸', 'รูปโปรไฟล์ย่อเหลือขนาด ~15 KB');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Filtered Wishes
  const filteredWishes = wishes.filter((w) => {
    if (categoryFilter !== 'all' && w.category !== categoryFilter) return false;
    if (ownerFilter === 'mine' && w.userId !== currentUser.id) return false;
    if (ownerFilter === 'others' && w.userId === currentUser.id) return false;
    return true;
  });

  // ==================== RENDER: LOGIN / REGISTER ====================
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-panel w-full max-w-md rounded-3xl p-8 sm:p-10 shadow-2xl animate-fade-in relative">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🎁</div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-pink-500 to-rose-600 bg-clip-text text-transparent">
              Make a Wish
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isRegisterMode ? 'สร้างบัญชีเพื่อเริ่มแชร์ของขวัญกับคนพิเศษ' : 'เข้าสู่ระบบค้างไว้ตลอดเหมือน Facebook 🌸'}
            </p>
          </div>

          {isRegisterMode ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">ชื่อที่แสดง</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="เช่น มุก, แบงค์"
                  value={registerForm.displayName}
                  onChange={(e) => setRegisterForm({ ...registerForm, displayName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">ชื่อผู้ใช้ (@username)</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="เช่น mook_ky"
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">อีเมล</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="name@example.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="form-input"
                  placeholder="••••••••"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                />
              </div>
              <button type="submit" className="btn-primary w-full py-3 mt-2">
                สมัครสมาชิก & เข้าสู่ระบบทันที 🚀
              </button>
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className="text-xs text-rose-500 font-bold hover:underline"
                >
                  มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">อีเมล</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="admin@gmail.com หรือ อีเมลของคุณ"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">รหัสผ่าน</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  placeholder="123456"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
              </div>
              <button type="submit" className="btn-primary w-full py-3 mt-2">
                เข้าสู่ระบบ 🌸
              </button>
              <div className="text-center pt-3 space-y-2">
                <div>
                  <button
                    type="button"
                    onClick={() => setIsRegisterMode(true)}
                    className="text-xs text-rose-500 font-bold hover:underline"
                  >
                    ยังไม่มีบัญชี? สมัครสมาชิกใหม่
                  </button>
                </div>
                <div className="text-[11px] text-gray-400">
                  (เข้าครั้งเดียวค้างไว้ 1 ปีเต็ม ไม่ต้องกรอกรหัสใหม่)
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ==================== RENDER: MAIN APP ====================
  return (
    <div className="min-h-screen flex">
      <ConfettiHearts active={confettiActive} />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 glass-panel px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border-rose-300 animate-fade-in">
          <Sparkles className="text-rose-500" size={20} />
          <div>
            <div className="font-bold text-sm">{toast.title}</div>
            {toast.message && <div className="text-xs text-gray-500">{toast.message}</div>}
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 glass-panel flex flex-col transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-rose-200/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎁</span>
            <div>
              <div className="font-black text-lg bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                Make a Wish
              </div>
              <div className="text-[10px] text-gray-400 font-mono">Cloudflare • Supabase</div>
            </div>
          </div>
          <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 my-3 rounded-2xl bg-rose-500/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white text-lg overflow-hidden shrink-0">
            {currentUser.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              currentUser.emoji || '🌸'
            )}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm truncate">{currentUser.displayName}</div>
            <div className="text-xs text-rose-500 font-mono">@{currentUser.username}</div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-4 py-2 space-y-1">
          {currentUser.role === 'admin' ? (
            <button
              onClick={() => { setActiveTab('admin'); setActiveSpace(null); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === 'admin' && !activeSpace ? 'bg-rose-500 text-white shadow-md' : 'hover:bg-rose-500/10'
              }`}
            >
              <ShieldCheck size={18} /> แผงควบคุมแอดมิน
            </button>
          ) : (
            <>
              <button
                onClick={() => { setActiveTab('dashboard'); setActiveSpace(null); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  activeTab === 'dashboard' && !activeSpace ? 'bg-rose-500 text-white shadow-md' : 'hover:bg-rose-500/10'
                }`}
              >
                <LayoutDashboard size={18} /> ห้องทั้งหมด
              </button>
              <button
                onClick={() => { setActiveTab('friends'); setActiveSpace(null); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  activeTab === 'friends' ? 'bg-rose-500 text-white shadow-md' : 'hover:bg-rose-500/10'
                }`}
              >
                <Users size={18} /> เพื่อนของฉัน
              </button>
              <button
                onClick={() => { setActiveTab('profile'); setActiveSpace(null); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  activeTab === 'profile' ? 'bg-rose-500 text-white shadow-md' : 'hover:bg-rose-500/10'
                }`}
              >
                <User size={18} /> โปรไฟล์
              </button>
            </>
          )}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-rose-200/20 space-y-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-500/10"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            {isDarkMode ? 'โหมดสว่าง' : 'โหมดมืด'}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-500 hover:bg-rose-500/10"
          >
            <LogOut size={18} /> ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 overflow-y-auto">
        {/* Mobile Header Bar */}
        <div className="lg:hidden flex items-center justify-between mb-6 glass-panel p-4 rounded-2xl">
          <button onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <span className="font-bold">Make a Wish 🎁</span>
          <div className="w-6" />
        </div>

        {/* ==================== VIEW: SPACE DETAIL ==================== */}
        {activeSpace ? (
          <div className="space-y-6 animate-fade-in">
            {/* Back button */}
            <button
              onClick={() => setActiveSpace(null)}
              className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-rose-500"
            >
              <ArrowLeft size={16} /> กลับไปห้องทั้งหมด
            </button>

            {/* Space Header Banner */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center text-3xl shadow-lg">
                  {activeSpace.emoji}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black">{activeSpace.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-500">
                      {activeSpace.type === '1on1' ? '1-on-1 คู่รัก' : 'กลุ่ม'}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">#{activeSpace.inviteCode}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsRouletteOpen(true)}
                  className="btn-primary bg-gradient-to-r from-amber-500 to-rose-500"
                >
                  <Sparkles size={18} /> 🎰 สุ่มของขวัญ
                </button>
                <button onClick={() => setIsAddWishOpen(true)} className="btn-primary">
                  <Plus size={18} /> ขอของขวัญ
                </button>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2 bg-rose-500/10 p-1.5 rounded-2xl">
                {[
                  { id: 'all', label: 'ทั้งหมด' },
                  { id: 'item', label: '🎁 สิ่งของ' },
                  { id: 'food', label: '🍜 อาหาร' },
                  { id: 'place', label: '📍 สถานที่' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategoryFilter(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      categoryFilter === c.id ? 'bg-rose-500 text-white shadow-sm' : 'hover:bg-rose-500/20'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 bg-rose-500/10 p-1.5 rounded-2xl">
                {['all', 'mine', 'others'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setOwnerFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      ownerFilter === f ? 'bg-rose-500 text-white shadow-sm' : 'hover:bg-rose-500/20'
                    }`}
                  >
                    {f === 'all' ? 'ทุกคน' : f === 'mine' ? 'ของฉัน' : 'ของคนอื่น'}
                  </button>
                ))}
              </div>
            </div>

            {/* Wishes Grid (Optimistic UI) */}
            {filteredWishes.length === 0 ? (
              <div className="glass-card p-12 text-center rounded-3xl space-y-3">
                <div className="text-5xl">⭐</div>
                <div className="font-bold text-lg">ยังไม่มีรายการในหมวดนี้</div>
                <p className="text-xs text-gray-400">กดปุ่ม "ขอของขวัญ" เพื่อเพิ่มรายการแรกของคุณได้เลย</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWishes.map((w) => (
                  <div key={w.id} className="glass-card p-5 rounded-2xl flex items-start justify-between gap-3 group">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-2xl shrink-0">
                        {w.emoji}
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-base truncate">{w.title}</div>
                        {w.description && <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{w.description}</div>}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/10 text-rose-500">
                            {w.category === 'food' ? '🍜 อาหาร' : w.category === 'place' ? '📍 สถานที่' : '🎁 สิ่งของ'}
                          </span>
                          <span className="text-[11px] text-gray-400 font-medium">@{w.userName}</span>
                        </div>
                      </div>
                    </div>
                    {w.userId === currentUser.id && (
                      <button
                        onClick={() => handleDeleteWish(w.id, w.title)}
                        className="text-gray-400 hover:text-rose-500 p-1 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'dashboard' ? (
          /* ==================== VIEW: DASHBOARD ==================== */
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black">ห้องแชร์ความปรารถนา 🌸</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">แชร์ของขวัญและสิ่งที่อยากได้ร่วมกันแบบเรียลไทม์</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setIsJoinSpaceOpen(true)} className="btn-secondary">
                  <KeyRound size={16} /> ใส่รหัสเข้าห้อง
                </button>
                <button onClick={() => setIsCreateSpaceOpen(true)} className="btn-primary">
                  <Plus size={18} /> สร้างห้องใหม่
                </button>
              </div>
            </div>

            {/* Spaces Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {spaces.map((s) => (
                <div
                  key={s.id}
                  onClick={() => openSpace(s)}
                  className="glass-card p-6 rounded-3xl cursor-pointer hover:border-rose-400 transition-all space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-3xl">
                      {s.emoji}
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-rose-500/10 text-rose-500">
                      #{s.inviteCode}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-black text-lg">{s.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{s.type === '1on1' ? 'ห้องคู่ 1-on-1' : 'ห้องกลุ่ม'}</p>
                  </div>
                  <div className="pt-3 border-t border-rose-200/20 flex items-center justify-between text-xs text-gray-500 font-bold">
                    <span>🎁 {s.wishCount || 0} ความปรารถนา</span>
                    <span className="text-rose-500 flex items-center gap-1">
                      เข้าห้อง <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'friends' ? (
          /* ==================== VIEW: FRIENDS ==================== */
          <div className="space-y-6 animate-fade-in max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-black">ระบบเพื่อน 💕</h1>
            <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
              <Search className="text-gray-400" size={18} />
              <input
                type="text"
                placeholder="ค้นหาเพื่อนด้วย @username เช่น @mook_ky"
                className="bg-transparent flex-1 outline-none text-sm"
                value={friendSearchInput}
                onChange={(e) => setFriendSearchInput(e.target.value)}
              />
              <button
                onClick={async () => {
                  if (!friendSearchInput.trim()) return;
                  const res = await addFriend(friendSearchInput);
                  if (res.status === 'success') {
                    setFriends([res.friend, ...friends]);
                    setFriendSearchInput('');
                    showToast('ส่งคำขอสำเร็จ! 💕', `ขอเป็นเพื่อนกับ ${res.friend.username}`);
                  } else {
                    showToast('ข้อผิดพลาด', res.message);
                  }
                }}
                className="btn-primary text-xs py-2 px-4"
              >
                ขอเป็นเพื่อน
              </button>
            </div>

            <div className="space-y-3">
              <div className="font-bold text-sm text-gray-500">รายชื่อเพื่อน ({friends.length})</div>
              {friends.map((f) => (
                <div key={f.id} className="glass-card p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-xl">
                      {f.emoji}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{f.displayName}</div>
                      <div className="text-xs text-gray-400 font-mono">@{f.username}</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-rose-500 px-3 py-1 rounded-full bg-rose-500/10">
                    {f.status === 'accepted' ? 'เพื่อนแล้ว' : 'รอตอบรับ'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'profile' ? (
          /* ==================== VIEW: PROFILE ==================== */
          <div className="space-y-6 animate-fade-in max-w-md mx-auto">
            <h1 className="text-2xl sm:text-3xl font-black text-center">โปรไฟล์ของฉัน ✨</h1>
            <div className="glass-card p-8 rounded-3xl space-y-6 text-center">
              <div className="relative inline-block mx-auto">
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-5xl overflow-hidden shadow-xl mx-auto">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    currentUser.emoji || '🌸'
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2.5 bg-rose-500 text-white rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform">
                  <Camera size={16} />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>
              <div>
                <h3 className="font-black text-xl">{currentUser.displayName}</h3>
                <p className="text-sm text-rose-500 font-mono">@{currentUser.username}</p>
                <p className="text-xs text-gray-400 mt-1">{currentUser.email}</p>
              </div>
              <div className="text-xs text-gray-400 bg-rose-500/10 p-3 rounded-xl">
                ระบบบีบอัดรูปโปรไฟล์ด้วย HTML5 Canvas อัตโนมัติ (ขนาดไม่เกิน 256x256 px เพื่อความเร็วสูงสุด)
              </div>
            </div>
          </div>
        ) : activeTab === 'admin' ? (
          /* ==================== VIEW: ADMIN PANEL ==================== */
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl sm:text-3xl font-black">แผงควบคุมผู้ดูแลระบบ 👑</h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="glass-card p-6 rounded-3xl">
                <div className="text-xs font-bold text-gray-400">ผู้ใช้ทั้งหมด</div>
                <div className="text-3xl font-black mt-2 text-rose-500">{adminStats.users}</div>
              </div>
              <div className="glass-card p-6 rounded-3xl">
                <div className="text-xs font-bold text-gray-400">ห้องความปรารถนา</div>
                <div className="text-3xl font-black mt-2 text-pink-500">{adminStats.spaces}</div>
              </div>
              <div className="glass-card p-6 rounded-3xl">
                <div className="text-xs font-bold text-gray-400">ของขวัญทั้งหมด</div>
                <div className="text-3xl font-black mt-2 text-amber-500">{adminStats.wishes}</div>
              </div>
            </div>

            {/* Admin Users Table */}
            <div className="glass-card rounded-3xl overflow-hidden p-6">
              <h3 className="font-bold text-lg mb-4">รายชื่อผู้ใช้ทั้งหมด</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-rose-200/20 text-gray-400 text-left">
                      <th className="pb-3">ผู้ใช้</th>
                      <th className="pb-3">อีเมล</th>
                      <th className="pb-3">สิทธิ์</th>
                      <th className="pb-3 text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-200/10">
                    {adminUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-rose-500/5">
                        <td className="py-3 font-bold flex items-center gap-2">
                          <span>{u.emoji}</span> {u.displayName} (@{u.username})
                        </td>
                        <td className="py-3 text-gray-500">{u.email}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-500">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {u.role !== 'admin' && (
                            <button
                              onClick={async () => {
                                if (confirm(`ลบบัญชี @${u.username} ใช่หรือไม่?`)) {
                                  await deleteUserAdmin(u.id);
                                  setAdminUsers(adminUsers.filter((item) => item.id !== u.id));
                                  showToast('ลบผู้ใช้สำเร็จ');
                                }
                              }}
                              className="text-rose-500 hover:text-rose-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* ==================== MODAL: CREATE SPACE ==================== */}
      {isCreateSpaceOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateSpaceOpen(false)}>
          <div className="glass-panel w-full max-w-md p-6 sm:p-8 rounded-3xl space-y-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-black">สร้างห้องความปรารถนาใหม่ 💕</h3>
            <form onSubmit={handleCreateSpace} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">ประเภทห้อง</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSpaceForm({ ...spaceForm, type: '1on1' })}
                    className={`p-3 rounded-xl text-xs font-bold border transition-all ${
                      spaceForm.type === '1on1' ? 'border-rose-500 bg-rose-500/10 text-rose-500' : 'border-gray-200'
                    }`}
                  >
                    1-on-1 (คู่รัก/เพื่อนสนิท)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpaceForm({ ...spaceForm, type: 'group' })}
                    className={`p-3 rounded-xl text-xs font-bold border transition-all ${
                      spaceForm.type === 'group' ? 'border-rose-500 bg-rose-500/10 text-rose-500' : 'border-gray-200'
                    }`}
                  >
                    กลุ่ม (เพื่อนหลายคน)
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">ชื่อห้อง</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ของขวัญวันครบรอบ"
                  className="form-input"
                  value={spaceForm.name}
                  onChange={(e) => setSpaceForm({ ...spaceForm, name: e.target.value })}
                />
              </div>
              <button type="submit" className="btn-primary w-full py-3">
                สร้างห้องทันที
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: JOIN SPACE ==================== */}
      {isJoinSpaceOpen && (
        <div className="modal-overlay" onClick={() => setIsJoinSpaceOpen(false)}>
          <div className="glass-panel w-full max-w-sm p-6 sm:p-8 rounded-3xl space-y-5 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-4xl">🔑</div>
            <h3 className="text-xl font-black">ใส่รหัสเชิญเข้าห้อง</h3>
            <form onSubmit={handleJoinSpace} className="space-y-4">
              <input
                type="text"
                required
                maxLength={6}
                placeholder="เช่น AB12CD"
                className="form-input text-center text-2xl font-mono tracking-widest uppercase"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value)}
              />
              <button type="submit" className="btn-primary w-full py-3">
                เข้าร่วมห้อง
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ADD WISH ==================== */}
      {isAddWishOpen && (
        <div className="modal-overlay" onClick={() => setIsAddWishOpen(false)}>
          <div className="glass-panel w-full max-w-md p-6 sm:p-8 rounded-3xl space-y-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-black">ขอของขวัญ / ความปรารถนา 🎁</h3>
            <form onSubmit={handleAddWish} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">หมวดหมู่</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'item', label: '🎁 สิ่งของ' },
                    { id: 'food', label: '🍜 อาหาร' },
                    { id: 'place', label: '📍 สถานที่' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setWishForm({ ...wishForm, category: c.id })}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                        wishForm.category === c.id ? 'border-rose-500 bg-rose-500/10 text-rose-500' : 'border-gray-200'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">สิ่งที่อยากได้</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น เสื้อกันหนาว, ชาบู, ทะเลพัทยา"
                  className="form-input"
                  value={wishForm.title}
                  onChange={(e) => setWishForm({ ...wishForm, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">รายละเอียดเพิ่มเติม</label>
                <textarea
                  placeholder="สี ไซส์ หรือลิงก์ (ถ้ามี)"
                  className="form-input text-sm"
                  rows={2}
                  value={wishForm.description}
                  onChange={(e) => setWishForm({ ...wishForm, description: e.target.value })}
                />
              </div>
              <button type="submit" className="btn-primary w-full py-3">
                เพิ่มความปรารถนา (0 วิ)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: GIFT ROULETTE ==================== */}
      {isRouletteOpen && (
        <div className="modal-overlay" onClick={() => !spinning && setIsRouletteOpen(false)}>
          <div className="glass-panel w-full max-w-sm p-6 sm:p-8 rounded-3xl space-y-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-5xl">🎰</div>
            <h3 className="text-xl font-black">วงล้อสุ่มของขวัญ</h3>

            {wishes.length === 0 ? (
              <p className="text-xs text-gray-400">ยังไม่มีรายการของขวัญในห้องนี้</p>
            ) : (
              <>
                <div className="glass-card p-6 rounded-2xl border-2 border-rose-400/50 min-h-[120px] flex flex-col items-center justify-center">
                  <div className="text-4xl mb-1">{wishes[rouletteIndex]?.emoji || '🎁'}</div>
                  <div className="font-black text-lg text-rose-500">{wishes[rouletteIndex]?.title}</div>
                  <div className="text-[11px] text-gray-400">ของ @{wishes[rouletteIndex]?.userName}</div>
                </div>

                {rouletteWinner && (
                  <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-rose-500 font-bold text-sm animate-bounce">
                    🎉 ผู้โชคดีได้รับ: {rouletteWinner.title}!
                  </div>
                )}

                <button
                  onClick={startRoulette}
                  disabled={spinning}
                  className="btn-primary w-full py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-base"
                >
                  {spinning ? 'กำลังหมุน...' : rouletteWinner ? 'สุ่มใหม่อีกครั้ง 🎲' : 'เริ่มสุ่มของขวัญ! 🎰'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
