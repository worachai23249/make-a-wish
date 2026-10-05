import React, { useState, useEffect, useRef } from 'react';
import {
  getCurrentUser,
  login,
  register,
  logout,
  getSpaces,
  createSpace,
  joinSpace,
  deleteSpace,
  getWishes,
  addWish,
  toggleWishFulfilled,
  deleteWish,
  getFriends,
  addFriend,
  acceptFriend,
  deleteFriend,
  getAdminStats,
  getAdminUsers,
  deleteUserAdmin,
  ADMIN_ACCOUNT,
  DEMO_USER_ACCOUNT,
} from './supabase';
import { sound } from './audio';

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
  Eye,
  EyeOff,
  ExternalLink,
  Share2,
  CheckCircle2,
  Circle,
  Volume2,
  VolumeX,
  Tag,
  Heart,
  ChevronRight,
  CheckCheck,
} from 'lucide-react';

// ==================== CONFETTI HEARTS & SPARKLES ====================
function ConfettiHearts({ active }) {
  if (!active) return null;
  const hearts = Array.from({ length: 36 }).map((_, i) => ({
    id: i,
    left: Math.random() * 96,
    size: Math.random() * 22 + 18,
    delay: Math.random() * 0.45,
    emoji: ['💖', '💕', '✨', '🌸', '🎁', '💗', '🎉', '🌟'][Math.floor(Math.random() * 8)],
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {hearts.map((h) => (
        <div
          key={h.id}
          className="absolute text-2xl select-none"
          style={{
            left: `${h.left}vw`,
            bottom: '-25px',
            fontSize: `${h.size}px`,
            animation: `floatConfetti 2.6s cubic-bezier(0.22, 1, 0.36, 1) ${h.delay}s forwards`,
          }}
        >
          {h.emoji}
        </div>
      ))}
      <style>{`
        @keyframes floatConfetti {
          0% { transform: translateY(0) scale(0.5) rotate(0deg); opacity: 0; }
          15% { opacity: 1; transform: translateY(-25vh) scale(1.2) rotate(45deg); }
          75% { opacity: 0.9; transform: translateY(-85vh) scale(1) rotate(-35deg); }
          100% { transform: translateY(-115vh) scale(0.7) rotate(90deg); opacity: 0; }
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
  const [showPassword, setShowPassword] = useState(false);

  // Nav tab state
  const [activeTab, setActiveTab] = useState(() => {
    const user = getCurrentUser();
    return user?.role === 'admin' ? 'admin' : 'dashboard';
  });

  // Active space view state
  const [activeSpace, setActiveSpace] = useState(null);

  // Data states
  const [spaces, setSpaces] = useState([]);
  const [wishes, setWishes] = useState([]);
  const [friends, setFriends] = useState([]);
  const [adminStats, setAdminStats] = useState({ users: 0, spaces: 0, wishes: 0, fulfilledWishes: 0 });
  const [adminUsers, setAdminUsers] = useState([]);

  // Toast state
  const [toast, setToast] = useState(null);
  const showToast = (title, message = '') => {
    setToast({ title, message });
    setTimeout(() => setToast(null), 3200);
  };

  // Modals state
  const [isCreateSpaceOpen, setIsCreateSpaceOpen] = useState(false);
  const [isJoinSpaceOpen, setIsJoinSpaceOpen] = useState(false);
  const [isAddWishOpen, setIsAddWishOpen] = useState(false);
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Forms
  const [spaceForm, setSpaceForm] = useState({ name: '', type: '1on1', emoji: '💕' });
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [wishForm, setWishForm] = useState({
    title: '',
    description: '',
    category: 'item',
    price: '',
    linkUrl: '',
    emoji: '🎁',
  });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
    emoji: '🌸',
  });
  const [friendSearchInput, setFriendSearchInput] = useState('');

  // Wish Filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');

  // Roulette States
  const [spinning, setSpinning] = useState(false);
  const [rouletteWinner, setRouletteWinner] = useState(null);
  const [rouletteIndex, setRouletteIndex] = useState(0);
  const [rouletteCategory, setRouletteCategory] = useState('all');
  const [isMuted, setIsMuted] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

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
    if (e) e.preventDefault();
    const res = await login(loginForm.email, loginForm.password);
    if (res.status === 'success') {
      setCurrentUser(res.user);
      setActiveTab(res.user.role === 'admin' ? 'admin' : 'dashboard');
      showToast('ยินดีต้อนรับกลับ! ✨', `${res.user.displayName}`);
    } else {
      showToast('เข้าสู่ระบบไม่สำเร็จ', res.message);
    }
  };

  const handleQuickLogin = async (account) => {
    setLoginForm({ email: account.email, password: account.password });
    const res = await login(account.email, account.password);
    if (res.status === 'success') {
      setCurrentUser(res.user);
      setActiveTab(res.user.role === 'admin' ? 'admin' : 'dashboard');
      showToast('เข้าสู่ระบบสำเร็จ! 🌸', `เข้าสู่ระบบในฐานะ ${res.user.displayName}`);
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
      showToast('สร้างบัญชีสำเร็จ! 🎉', 'เข้าสู่ระบบให้อัตโนมัติเรียบร้อย');
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setActiveSpace(null);
    showToast('ออกจากระบบแล้ว', 'ข้อมูลถูกบันทึกไว้อย่างปลอดภัย');
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
      setSpaces([res.space, ...spaces.filter((s) => s.id !== res.space.id)]);
      setIsJoinSpaceOpen(false);
      setJoinCodeInput('');
      showToast('เข้าร่วมห้องสำเร็จ! 🥳', res.space.name);
    } else {
      showToast('ข้อผิดพลาด', res.message);
    }
  };

  // Delete Space
  const handleDeleteSpace = async (spaceId, spaceName) => {
    if (!confirm(`ต้องการลบห้อง "${spaceName}" ใช่หรือไม่? รายการความปรารถนาทั้งหมดในห้องนี้จะถูกลบ`)) return;
    await deleteSpace(spaceId);
    setSpaces(spaces.filter((s) => s.id !== spaceId));
    setActiveSpace(null);
    showToast('ลบห้องเรียบร้อย');
  };

  // Copy or Share Invite Code
  const handleCopyInviteCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    showToast('คัดลอกรหัสเชิญแล้ว! 📋', `รหัส: ${code}`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShareSpace = async (space) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `เข้าร่วมห้อง "${space.name}" บน Make a Wish`,
          text: `ใส่รหัสเชิญ: ${space.inviteCode} เพื่อแชร์ของขวัญและความปรารถนากับฉันใน Make a Wish! 🎁`,
          url: window.location.origin,
        });
        showToast('แชร์สำเร็จ! 💌');
      } catch (_) {}
    } else {
      handleCopyInviteCode(space.inviteCode);
    }
  };

  // Add Wish (Optimistic UI 0s)
  const handleAddWish = async (e) => {
    e.preventDefault();
    if (!wishForm.title.trim() || !activeSpace) return;
    setIsAddWishOpen(false);
    const newWish = await addWish(activeSpace.id, wishForm, currentUser);
    setWishes([newWish, ...wishes]);
    setWishForm({
      title: '',
      description: '',
      category: 'item',
      price: '',
      linkUrl: '',
      emoji: '🎁',
    });
    sound.playSuccess();
    showToast('เพิ่มรายการสำเร็จ! 🎁', newWish.title);
  };

  // Toggle Wish Fulfilled / ได้รับแล้ว 🎉
  const handleToggleWishFulfilled = async (wish) => {
    const updated = await toggleWishFulfilled(activeSpace.id, wish.id, currentUser);
    if (updated) {
      setWishes(wishes.map((w) => (w.id === wish.id ? updated : w)));
      if (updated.isFulfilled) {
        sound.playSuccess();
        setConfettiActive(true);
        setTimeout(() => setConfettiActive(false), 2800);
        showToast('ซื้อให้แล้ว! 🎉', `ทำเครื่องหมายสำเร็จโดย ${currentUser.displayName}`);
      } else {
        showToast('เปลี่ยนสถานะ', 'เปลี่ยนกลับเป็นยังไม่ได้ซื้อ');
      }
    }
  };

  // Delete Wish (Optimistic UI 0s)
  const handleDeleteWish = async (wishId, title) => {
    if (!confirm(`คุณต้องการลบ "${title}" ใช่หรือไม่?`)) return;
    setWishes(wishes.filter((w) => w.id !== wishId));
    await deleteWish(activeSpace.id, wishId);
    showToast('ลบรายการเรียบร้อย');
  };

  // Roulette Candidate Wishes (Filtered by rouletteCategory)
  const eligibleRouletteWishes = wishes.filter((w) => {
    if (rouletteCategory === 'all') return !w.isFulfilled;
    return w.category === rouletteCategory && !w.isFulfilled;
  });

  // Roulette Spin Handler
  const startRoulette = () => {
    if (eligibleRouletteWishes.length === 0 || spinning) return;
    setSpinning(true);
    setRouletteWinner(null);
    setConfettiActive(false);

    let current = 0;
    const totalSteps = 28 + Math.floor(Math.random() * 12);
    let step = 0;
    let speed = 65;

    const spin = () => {
      current = (current + 1) % eligibleRouletteWishes.length;
      setRouletteIndex(current);
      sound.playTick();
      step++;
      if (step < totalSteps) {
        if (step > totalSteps - 9) speed += 35;
        setTimeout(spin, speed);
      } else {
        setSpinning(false);
        const winner = eligibleRouletteWishes[current];
        setRouletteWinner(winner);
        sound.playFanfare();
        setConfettiActive(true);
        setTimeout(() => setConfettiActive(false), 3500);
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
          if (w > MAX) {
            h = Math.round((h * MAX) / w);
            w = MAX;
          }
        } else {
          if (h > MAX) {
            w = Math.round((w * MAX) / h);
            h = MAX;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const base64 = canvas.toDataURL('image/jpeg', 0.82);

        const updated = { ...currentUser, avatarUrl: base64 };
        setCurrentUser(updated);
        localStorage.setItem('makewish_auth_user', JSON.stringify(updated));
        showToast('บีบอัดรูปสำเร็จ! ✨', 'ขนาดภาพย่อเหลือ ~15 KB เร็วและประหยัดพื้นที่');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Filtered Wishes for display
  const filteredWishes = wishes.filter((w) => {
    if (categoryFilter !== 'all' && w.category !== categoryFilter) return false;
    if (statusFilter === 'unfulfilled' && w.isFulfilled) return false;
    if (statusFilter === 'fulfilled' && !w.isFulfilled) return false;
    if (ownerFilter === 'mine' && w.userId !== currentUser.id) return false;
    if (ownerFilter === 'others' && w.userId === currentUser.id) return false;
    return true;
  });

  // ==================== RENDER: AUTH SCREEN (LOGIN / REGISTER) ====================
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="glass-panel w-full max-w-md rounded-3xl p-8 sm:p-10 shadow-2xl animate-fade-in relative z-10 border-rose-500/20">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-500 to-pink-400 text-white shadow-lg shadow-rose-500/30 text-3xl mb-4">
              🎁
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 bg-clip-text text-transparent">
              Make a Wish
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 font-medium">
              แชร์ความปรารถนากับคนพิเศษ • บันทึกอัตโนมัติตลอด 365 วัน
            </p>
          </div>

          {/* Quick Demo Access Bar */}
          <div className="mb-6 p-3 rounded-2xl bg-rose-500/8 border border-rose-500/15">
            <div className="text-[11px] font-bold text-rose-500 mb-2 flex items-center gap-1.5 justify-center">
              <Sparkles size={13} /> กดเข้าสู่ระบบด่วน 1 คลิกเพื่อทดลองใช้งาน:
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin(ADMIN_ACCOUNT)}
                className="py-2 px-2.5 rounded-xl text-xs font-bold bg-white dark:bg-stone-900 border border-rose-500/20 hover:border-rose-500 hover:text-rose-500 shadow-sm transition-all text-center truncate"
              >
                👑 แอดมินระบบ
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin(DEMO_USER_ACCOUNT)}
                className="py-2 px-2.5 rounded-xl text-xs font-bold bg-white dark:bg-stone-900 border border-rose-500/20 hover:border-rose-500 hover:text-rose-500 shadow-sm transition-all text-center truncate"
              >
                🌸 ผู้ใช้ทั่วไป (มุก)
              </button>
            </div>
          </div>

          {isRegisterMode ? (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 mb-1.5">ชื่อที่แสดง</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="เช่น มุก, พี่แบงค์, บีม"
                  value={registerForm.displayName}
                  onChange={(e) => setRegisterForm({ ...registerForm, displayName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 mb-1.5">
                  ชื่อผู้ใช้ (@username)
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="เช่น mook_ky (สำหรับให้เพื่อนค้นหา)"
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 mb-1.5">อีเมล</label>
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
                <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 mb-1.5">รหัสผ่าน</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    className="form-input pr-10"
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-rose-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-primary w-full py-3 mt-3 text-sm">
                สมัครสมาชิก & เริ่มใช้งานทันที 🚀
              </button>
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className="text-xs text-rose-500 font-bold hover:underline"
                >
                  มีบัญชีอยู่แล้ว? เข้าสู่ระบบที่นี่
                </button>
              </div>
            </form>
          ) : (
            /* LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 mb-1.5">อีเมล</label>
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-stone-500 dark:text-stone-400">รหัสผ่าน</label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="form-input pr-10"
                    placeholder="รหัสผ่านของคุณ"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-rose-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-primary w-full py-3 mt-3 text-sm">
                เข้าสู่ระบบ 🌸
              </button>
              <div className="text-center pt-3 space-y-2">
                <div>
                  <button
                    type="button"
                    onClick={() => setIsRegisterMode(true)}
                    className="text-xs text-rose-500 font-bold hover:underline"
                  >
                    ยังไม่มีบัญชี? สมัครสมาชิกใหม่ฟรี
                  </button>
                </div>
                <div className="text-[11px] text-stone-400 flex items-center justify-center gap-1.5">
                  <CheckCheck size={13} className="text-emerald-500" />
                  ระบบจดจำบัญชีค้างไว้ตลอดเหมือน Facebook ไม่ต้องกรอกใหม่
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ==================== RENDER: MAIN APPLICATION ====================
  return (
    <div className="min-h-screen flex flex-col lg:flex-row pb-20 lg:pb-0">
      <ConfettiHearts active={confettiActive} />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 glass-panel px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border-rose-500/30 animate-fade-in max-w-sm">
          <div className="w-8 h-8 rounded-full bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
            <Sparkles size={16} />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs sm:text-sm truncate">{toast.title}</div>
            {toast.message && <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">{toast.message}</div>}
          </div>
        </div>
      )}

      {/* Desktop Sidebar Navigation */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 glass-panel flex flex-col transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-rose-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center text-xl text-white shadow-md shadow-rose-500/25">
              🎁
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                Make a Wish
              </div>
              <div className="text-[10px] text-stone-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" /> Cloudflare • 0ms
              </div>
            </div>
          </div>
          <button className="lg:hidden text-stone-400 hover:text-stone-600" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* User Profile Card */}
        <div className="p-3.5 mx-4 my-3 rounded-2xl bg-rose-500/8 border border-rose-500/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white text-lg overflow-hidden shrink-0 shadow-sm">
            {currentUser.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              currentUser.emoji || '🌸'
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-xs truncate flex items-center gap-1">
              {currentUser.displayName}
              {currentUser.role === 'admin' && <span className="text-[10px]">👑</span>}
            </div>
            <div className="text-[11px] text-rose-500 font-mono truncate">@{currentUser.username}</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-2 space-y-1.5">
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setActiveSpace(null);
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
              activeTab === 'dashboard' && !activeSpace
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                : 'hover:bg-rose-500/10 text-stone-700 dark:text-stone-300'
            }`}
          >
            <LayoutDashboard size={17} /> ห้องทั้งหมด
          </button>

          <button
            onClick={() => {
              setActiveTab('friends');
              setActiveSpace(null);
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
              activeTab === 'friends'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                : 'hover:bg-rose-500/10 text-stone-700 dark:text-stone-300'
            }`}
          >
            <Users size={17} /> เพื่อนของฉัน
          </button>

          <button
            onClick={() => {
              setActiveTab('profile');
              setActiveSpace(null);
              setIsSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
              activeTab === 'profile'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                : 'hover:bg-rose-500/10 text-stone-700 dark:text-stone-300'
            }`}
          >
            <User size={17} /> โปรไฟล์
          </button>

          {currentUser.role === 'admin' && (
            <button
              onClick={() => {
                setActiveTab('admin');
                setActiveSpace(null);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                activeTab === 'admin' && !activeSpace
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md'
                  : 'hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
              }`}
            >
              <ShieldCheck size={17} /> แผงควบคุมแอดมิน 👑
            </button>
          )}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-rose-500/10 space-y-1.5">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-rose-500/10 transition-colors"
          >
            {isDarkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-stone-500" />}
            {isDarkMode ? 'โหมดสว่าง' : 'โหมดมืด'}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut size={16} /> ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-5 glass-panel p-3.5 rounded-2xl">
          <button onClick={() => setIsSidebarOpen(true)} className="p-1 text-stone-600 dark:text-stone-300">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🎁</span>
            <span className="font-extrabold text-sm bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
              Make a Wish
            </span>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-1 text-stone-600 dark:text-stone-300"
          >
            {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
          </button>
        </div>

        {/* ==================== VIEW 1: SPACE DETAIL ==================== */}
        {activeSpace ? (
          <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
            {/* Back button */}
            <button
              onClick={() => setActiveSpace(null)}
              className="inline-flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-rose-500 transition-colors"
            >
              <ArrowLeft size={15} /> กลับไปห้องทั้งหมด
            </button>

            {/* Space Header Banner */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl flex flex-wrap items-center justify-between gap-6 border-rose-500/20">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center text-3xl shadow-lg shadow-rose-500/25 shrink-0">
                  {activeSpace.emoji}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{activeSpace.name}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-500">
                      {activeSpace.type === '1on1' ? '1-on-1 คู่รัก/เพื่อนสนิท' : 'ห้องกลุ่ม'}
                    </span>
                    <button
                      onClick={() => handleCopyInviteCode(activeSpace.inviteCode)}
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-stone-500/10 hover:bg-rose-500/15 text-stone-600 dark:text-stone-300 hover:text-rose-500 inline-flex items-center gap-1 transition-all"
                    >
                      {copiedCode ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      #{activeSpace.inviteCode}
                    </button>
                    <button
                      onClick={() => handleShareSpace(activeSpace)}
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-500/10 hover:bg-rose-500/15 text-stone-600 dark:text-stone-300 hover:text-rose-500 inline-flex items-center gap-1 transition-all"
                    >
                      <Share2 size={12} /> แชร์ห้อง
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setIsRouletteOpen(true)}
                  className="btn-primary bg-gradient-to-r from-amber-500 to-rose-500 shadow-amber-500/20 text-xs py-2.5 px-4"
                >
                  <Sparkles size={16} /> 🎰 วงล้อสุ่มของขวัญ
                </button>
                <button onClick={() => setIsAddWishOpen(true)} className="btn-primary text-xs py-2.5 px-4">
                  <Plus size={16} /> ขอของขวัญ
                </button>
                {activeSpace.ownerId === currentUser.id && (
                  <button
                    onClick={() => handleDeleteSpace(activeSpace.id, activeSpace.name)}
                    className="p-2.5 rounded-full hover:bg-rose-500/10 text-stone-400 hover:text-rose-500 transition-colors"
                    title="ลบห้องนี้"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Toolbar */}
            <div className="glass-card p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3">
              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'ทั้งหมด' },
                  { id: 'item', label: '🎁 สิ่งของ' },
                  { id: 'food', label: '🍜 อาหาร' },
                  { id: 'place', label: '📍 สถานที่' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategoryFilter(c.id)}
                    className={`btn-pill ${
                      categoryFilter === c.id
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'text-stone-600 dark:text-stone-300 hover:bg-rose-500/10'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Status & Ownership Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Status Filter */}
                <div className="flex gap-1 bg-stone-500/10 p-1 rounded-full">
                  {[
                    { id: 'all', label: 'ทุกสถานะ' },
                    { id: 'unfulfilled', label: '⏳ ยังไม่ได้ซื้อ' },
                    { id: 'fulfilled', label: '✨ ซื้อให้แล้ว' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStatusFilter(s.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                        statusFilter === s.id ? 'bg-rose-500 text-white shadow-sm' : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Owner Filter */}
                <div className="flex gap-1 bg-stone-500/10 p-1 rounded-full">
                  {[
                    { id: 'all', label: 'ทุกคน' },
                    { id: 'mine', label: 'ของฉัน' },
                    { id: 'others', label: 'ของคนอื่น' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setOwnerFilter(f)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                        ownerFilter === f ? 'bg-rose-500 text-white shadow-sm' : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Wishes Grid */}
            {filteredWishes.length === 0 ? (
              <div className="glass-card p-14 text-center rounded-3xl space-y-3">
                <div className="text-5xl">⭐</div>
                <div className="font-bold text-base">ไม่พบรายการความปรารถนาในเงื่อนไขนี้</div>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  กดปุ่ม "ขอของขวัญ" ด้านบนเพื่อเพิ่มสิ่งของ อาหาร หรือสถานที่ที่อยากไปได้เลย
                </p>
                <button onClick={() => setIsAddWishOpen(true)} className="btn-primary text-xs py-2 px-5 mt-2">
                  <Plus size={15} /> ขอของขวัญเลย
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWishes.map((w) => (
                  <div
                    key={w.id}
                    className={`glass-card p-5 rounded-2xl flex flex-col justify-between gap-4 transition-all ${
                      w.isFulfilled ? 'border-emerald-500/30 bg-emerald-500/5' : ''
                    }`}
                  >
                    <div>
                      {/* Top Bar: Category & Status */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-rose-500/10 text-rose-500">
                          {w.category === 'food' ? '🍜 อาหาร' : w.category === 'place' ? '📍 สถานที่' : '🎁 สิ่งของ'}
                        </span>
                        {w.isFulfilled ? (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                            <CheckCircle2 size={12} /> ซื้อให้แล้ว 🎉
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold text-stone-400 bg-stone-500/10">
                            ยังไม่ได้ซื้อ
                          </span>
                        )}
                      </div>

                      {/* Title & Emoji */}
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-rose-500/10 flex items-center justify-center text-2xl shrink-0">
                          {w.emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4
                            className={`font-bold text-sm tracking-tight ${
                              w.isFulfilled ? 'line-through text-stone-400 dark:text-stone-500' : ''
                            }`}
                          >
                            {w.title}
                          </h4>
                          {w.description && (
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                              {w.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Price & Link Tags */}
                      <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-rose-500/10">
                        {w.price && (
                          <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 inline-flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg">
                            <Tag size={11} /> ฿{w.price}
                          </span>
                        )}
                        {w.linkUrl && (
                          <a
                            href={w.linkUrl.startsWith('http') ? w.linkUrl : `https://${w.linkUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-rose-500 hover:underline inline-flex items-center gap-1 font-semibold"
                          >
                            <ExternalLink size={11} /> ลิงก์รายละเอียด
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions: Toggle Fulfilled & Delete */}
                    <div className="flex items-center justify-between pt-2 border-t border-rose-500/10 text-xs">
                      <div className="text-[11px] text-stone-400 font-medium truncate">
                        โดย @{w.userName}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleWishFulfilled(w)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all inline-flex items-center gap-1 ${
                            w.isFulfilled
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-500 hover:bg-rose-500 hover:text-white'
                          }`}
                        >
                          {w.isFulfilled ? '🎉 สำเร็จแล้ว' : '🎁 ซื้อให้แล้ว'}
                        </button>
                        {w.userId === currentUser.id && (
                          <button
                            onClick={() => handleDeleteWish(w.id, w.title)}
                            className="p-1 rounded-lg text-stone-400 hover:text-rose-500 transition-colors"
                            title="ลบรายการ"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'dashboard' ? (
          /* ==================== VIEW 2: DASHBOARD (SPACES) ==================== */
          <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
            {/* Header Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">ห้องแชร์ความปรารถนา 🌸</h1>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
                  เลือกห้องเพื่อดูรายการของขวัญ หรือสร้างห้องใหม่เพื่อแชร์กับแฟนและเพื่อน
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <button onClick={() => setIsJoinSpaceOpen(true)} className="btn-secondary text-xs py-2.5 px-4">
                  <KeyRound size={15} /> ใส่รหัสเข้าห้อง
                </button>
                <button onClick={() => setIsCreateSpaceOpen(true)} className="btn-primary text-xs py-2.5 px-4">
                  <Plus size={16} /> สร้างห้องใหม่
                </button>
              </div>
            </div>

            {/* Spaces Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {spaces.map((s) => (
                <div
                  key={s.id}
                  onClick={() => openSpace(s)}
                  className="glass-card p-6 rounded-3xl cursor-pointer hover:border-rose-500/40 transition-all space-y-4 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform shadow-sm">
                      {s.emoji}
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500">
                      #{s.inviteCode}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg group-hover:text-rose-500 transition-colors">
                      {s.name}
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {s.type === '1on1' ? 'ห้องคู่ 1-on-1 (คู่รัก/เพื่อนสนิท)' : 'ห้องกลุ่ม (เพื่อนหลายคน)'}
                    </p>
                  </div>

                  {/* Members count & wishes */}
                  <div className="pt-3 border-t border-rose-500/10 flex items-center justify-between text-xs text-stone-500 font-semibold">
                    <span>🎁 {s.wishCount || 0} ความปรารถนา</span>
                    <span className="text-rose-500 flex items-center gap-1 font-bold group-hover:translate-x-0.5 transition-transform">
                      เข้าห้อง <ChevronRight size={15} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'friends' ? (
          /* ==================== VIEW 3: FRIENDS ==================== */
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
                          await acceptFriend(f.id);
                          setFriends(friends.map((item) => (item.id === f.id ? { ...item, status: 'accepted' } : item)));
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
                        await deleteFriend(f.id);
                        setFriends(friends.filter((item) => item.id !== f.id));
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
        ) : activeTab === 'profile' ? (
          /* ==================== VIEW 4: PROFILE ==================== */
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
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
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
        ) : activeTab === 'admin' ? (
          /* ==================== VIEW 5: ADMIN PANEL ==================== */
          <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">แผงควบคุมผู้ดูแลระบบ 👑</h1>
              <span className="text-xs font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full">
                Admin Privilege
              </span>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="glass-card p-5 rounded-2xl">
                <div className="text-xs font-bold text-stone-400">ผู้ใช้ทั้งหมด</div>
                <div className="text-2xl sm:text-3xl font-extrabold mt-1 text-rose-500">{adminStats.users}</div>
              </div>
              <div className="glass-card p-5 rounded-2xl">
                <div className="text-xs font-bold text-stone-400">ห้องความปรารถนา</div>
                <div className="text-2xl sm:text-3xl font-extrabold mt-1 text-pink-500">{adminStats.spaces}</div>
              </div>
              <div className="glass-card p-5 rounded-2xl">
                <div className="text-xs font-bold text-stone-400">ของขวัญทั้งหมด</div>
                <div className="text-2xl sm:text-3xl font-extrabold mt-1 text-amber-500">{adminStats.wishes}</div>
              </div>
              <div className="glass-card p-5 rounded-2xl">
                <div className="text-xs font-bold text-stone-400">ซื้อสำเร็จแล้ว</div>
                <div className="text-2xl sm:text-3xl font-extrabold mt-1 text-emerald-500">
                  {adminStats.fulfilledWishes}
                </div>
              </div>
            </div>

            {/* Admin Users Table */}
            <div className="glass-card rounded-3xl overflow-hidden p-6">
              <h3 className="font-bold text-base mb-4">รายชื่อผู้ใช้ทั้งหมดในระบบ</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-rose-500/10 text-stone-400 text-left">
                      <th className="pb-3">ผู้ใช้</th>
                      <th className="pb-3">อีเมล</th>
                      <th className="pb-3">สิทธิ์</th>
                      <th className="pb-3 text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-500/10">
                    {adminUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-rose-500/5">
                        <td className="py-3 font-bold flex items-center gap-2">
                          <span>{u.emoji}</span> {u.displayName} (@{u.username})
                        </td>
                        <td className="py-3 text-stone-500">{u.email}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              u.role === 'admin'
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                : 'bg-rose-500/10 text-rose-500'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {u.role !== 'admin' && (
                            <button
                              onClick={async () => {
                                if (confirm(`ต้องการลบบัญชี @${u.username} ใช่หรือไม่?`)) {
                                  await deleteUserAdmin(u.id);
                                  setAdminUsers(adminUsers.filter((item) => item.id !== u.id));
                                  showToast('ลบผู้ใช้สำเร็จ');
                                }
                              }}
                              className="text-rose-500 hover:text-rose-700 p-1"
                              title="ลบผู้ใช้"
                            >
                              <Trash2 size={15} />
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

      {/* ==================== MOBILE BOTTOM DOCK ==================== */}
      <div className="lg:hidden fixed bottom-3 inset-x-4 z-40 glass-panel rounded-full p-1.5 shadow-2xl flex items-center justify-around border-rose-500/20">
        <button
          onClick={() => {
            setActiveTab('dashboard');
            setActiveSpace(null);
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
            activeTab === 'dashboard' && !activeSpace ? 'bg-rose-500 text-white' : 'text-stone-500'
          }`}
        >
          <LayoutDashboard size={18} />
          <span>ห้อง</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('friends');
            setActiveSpace(null);
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
            activeTab === 'friends' ? 'bg-rose-500 text-white' : 'text-stone-500'
          }`}
        >
          <Users size={18} />
          <span>เพื่อน</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('profile');
            setActiveSpace(null);
          }}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
            activeTab === 'profile' ? 'bg-rose-500 text-white' : 'text-stone-500'
          }`}
        >
          <User size={18} />
          <span>โปรไฟล์</span>
        </button>

        {currentUser.role === 'admin' && (
          <button
            onClick={() => {
              setActiveTab('admin');
              setActiveSpace(null);
            }}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
              activeTab === 'admin' && !activeSpace ? 'bg-amber-500 text-white' : 'text-amber-500'
            }`}
          >
            <ShieldCheck size={18} />
            <span>แอดมิน</span>
          </button>
        )}
      </div>

      {/* ==================== MODAL: CREATE SPACE ==================== */}
      {isCreateSpaceOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateSpaceOpen(false)}>
          <div
            className="glass-panel w-full max-w-md p-6 sm:p-8 rounded-3xl space-y-5 border-rose-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold">สร้างห้องความปรารถนาใหม่ 💕</h3>
              <button onClick={() => setIsCreateSpaceOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSpace} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1.5">ประเภทห้อง</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSpaceForm({ ...spaceForm, type: '1on1' })}
                    className={`p-3 rounded-2xl text-xs font-bold border transition-all ${
                      spaceForm.type === '1on1'
                        ? 'border-rose-500 bg-rose-500/10 text-rose-500'
                        : 'border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    1-on-1 (คู่รัก/เพื่อนสนิท)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpaceForm({ ...spaceForm, type: 'group' })}
                    className={`p-3 rounded-2xl text-xs font-bold border transition-all ${
                      spaceForm.type === 'group'
                        ? 'border-rose-500 bg-rose-500/10 text-rose-500'
                        : 'border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    กลุ่ม (เพื่อนหลายคน)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1.5">ชื่อห้อง</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ของขวัญวันครบรอบ, ปาร์ตี้ปีใหม่"
                  className="form-input"
                  value={spaceForm.name}
                  onChange={(e) => setSpaceForm({ ...spaceForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1.5">ไอคอนห้อง</label>
                <div className="flex gap-2">
                  {['💕', '🎁', '🏖️', '🍜', '✨', '🌸'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSpaceForm({ ...spaceForm, emoji })}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${
                        spaceForm.emoji === emoji ? 'border-rose-500 bg-rose-500/15 scale-110' : 'border-stone-200 dark:border-stone-800'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-primary w-full py-3 text-xs font-bold mt-2">
                สร้างห้องทันที 🚀
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: JOIN SPACE ==================== */}
      {isJoinSpaceOpen && (
        <div className="modal-overlay" onClick={() => setIsJoinSpaceOpen(false)}>
          <div
            className="glass-panel w-full max-w-sm p-6 sm:p-8 rounded-3xl space-y-5 text-center border-rose-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-2xl mx-auto">
              🔑
            </div>
            <h3 className="text-lg font-extrabold">ใส่รหัสเชิญเข้าห้อง</h3>
            <p className="text-xs text-stone-400">กรอกรหัสเชิญ 6 ตัวอักษรที่ได้รับจากเพื่อนหรือแฟน</p>

            <form onSubmit={handleJoinSpace} className="space-y-4">
              <input
                type="text"
                required
                maxLength={6}
                placeholder="เช่น LOVE26"
                className="form-input text-center text-2xl font-mono tracking-widest uppercase font-bold"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value)}
              />
              <button type="submit" className="btn-primary w-full py-3 text-xs font-bold">
                เข้าร่วมห้องทันที 🌸
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ADD WISH ==================== */}
      {isAddWishOpen && (
        <div className="modal-overlay" onClick={() => setIsAddWishOpen(false)}>
          <div
            className="glass-panel w-full max-w-md p-6 sm:p-8 rounded-3xl space-y-4 border-rose-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold">ขอของขวัญ / ความปรารถนา 🎁</h3>
              <button onClick={() => setIsAddWishOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddWish} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">หมวดหมู่</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'item', label: '🎁 สิ่งของ', emoji: '🎁' },
                    { id: 'food', label: '🍜 อาหาร', emoji: '🍲' },
                    { id: 'place', label: '📍 สถานที่', emoji: '🏖️' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setWishForm({ ...wishForm, category: c.id, emoji: c.emoji })}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                        wishForm.category === c.id
                          ? 'border-rose-500 bg-rose-500/10 text-rose-500'
                          : 'border-stone-200 dark:border-stone-800'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">สิ่งที่อยากได้</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น หูฟัง AirPods, ชาบูชิ, ทะเลพัทยา"
                  className="form-input"
                  value={wishForm.title}
                  onChange={(e) => setWishForm({ ...wishForm, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">ราคาโดยประมาณ (฿)</label>
                  <input
                    type="text"
                    placeholder="เช่น 1,590"
                    className="form-input text-xs"
                    value={wishForm.price}
                    onChange={(e) => setWishForm({ ...wishForm, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">ลิงก์สินค้า / พิกัดร้าน</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    className="form-input text-xs"
                    value={wishForm.linkUrl}
                    onChange={(e) => setWishForm({ ...wishForm, linkUrl: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">รายละเอียดเพิ่มเติม</label>
                <textarea
                  placeholder="สี ไซส์ นัดวันไหน หรือสิ่งที่อยากบอก"
                  className="form-input text-xs"
                  rows={2}
                  value={wishForm.description}
                  onChange={(e) => setWishForm({ ...wishForm, description: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-primary w-full py-3 text-xs font-bold mt-2">
                เพิ่มความปรารถนาทันที (0 วิ) ✨
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: GIFT ROULETTE ==================== */}
      {isRouletteOpen && (
        <div className="modal-overlay" onClick={() => !spinning && setIsRouletteOpen(false)}>
          <div
            className="glass-panel w-full max-w-sm p-6 sm:p-8 rounded-3xl space-y-5 text-center border-rose-500/30"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const nextMuted = !isMuted;
                  setIsMuted(nextMuted);
                  sound.setMuted(nextMuted);
                }}
                className="p-2 rounded-xl text-stone-400 hover:text-rose-500 transition-colors"
                title={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <h3 className="font-extrabold text-base flex items-center gap-1.5">
                🎰 วงล้อสุ่มของขวัญ
              </h3>
              <button
                onClick={() => !spinning && setIsRouletteOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Category Selector for Roulette */}
            <div className="flex gap-1 justify-center bg-stone-500/10 p-1 rounded-full">
              {[
                { id: 'all', label: 'ทั้งหมด' },
                { id: 'item', label: '🎁 ของขวัญ' },
                { id: 'food', label: '🍜 ของกิน' },
                { id: 'place', label: '📍 ที่เที่ยว' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    if (!spinning) {
                      setRouletteCategory(cat.id);
                      setRouletteWinner(null);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                    rouletteCategory === cat.id
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {eligibleRouletteWishes.length === 0 ? (
              <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/15 space-y-2">
                <div className="text-3xl">💫</div>
                <div className="font-bold text-xs">ไม่มีรายการที่ยังไม่ได้ซื้อในหมวดนี้</div>
                <p className="text-[11px] text-stone-400">ลองเปลี่ยนหมวดหมู่หรือเพิ่มความปรารถนาใหม่</p>
              </div>
            ) : (
              <>
                {/* Spinning Wheel Showcase Display */}
                <div
                  className={`glass-card p-6 rounded-3xl border-2 transition-all min-h-[140px] flex flex-col items-center justify-center ${
                    rouletteWinner
                      ? 'border-emerald-500 shadow-xl shadow-emerald-500/20 bg-emerald-500/5 animate-pulse-glow'
                      : 'border-rose-500/30'
                  }`}
                >
                  <div className="text-4xl mb-1.5 animate-bounce">
                    {eligibleRouletteWishes[rouletteIndex % eligibleRouletteWishes.length]?.emoji || '🎁'}
                  </div>
                  <div className="font-extrabold text-base text-rose-500 truncate max-w-[220px]">
                    {eligibleRouletteWishes[rouletteIndex % eligibleRouletteWishes.length]?.title}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    ของ @{eligibleRouletteWishes[rouletteIndex % eligibleRouletteWishes.length]?.userName}
                  </div>
                  {eligibleRouletteWishes[rouletteIndex % eligibleRouletteWishes.length]?.price && (
                    <div className="text-[11px] font-mono text-amber-500 font-bold mt-1">
                      ฿{eligibleRouletteWishes[rouletteIndex % eligibleRouletteWishes.length]?.price}
                    </div>
                  )}
                </div>

                {/* Winner Card */}
                {rouletteWinner && (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs animate-fade-in flex items-center justify-center gap-1.5">
                    <Sparkles size={16} /> ผู้โชคดีได้รับ: {rouletteWinner.title}! 🎉
                  </div>
                )}

                {/* Spin Button */}
                <button
                  type="button"
                  onClick={startRoulette}
                  disabled={spinning}
                  className="btn-primary w-full py-3.5 bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 text-sm font-bold shadow-lg shadow-rose-500/30"
                >
                  {spinning ? 'กำลังสุ่มของขวัญ...' : rouletteWinner ? 'สุ่มใหม่อีกครั้ง 🎲' : 'เริ่มสุ่มของขวัญ! 🎰'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
