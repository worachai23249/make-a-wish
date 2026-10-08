import React, { useState, useEffect } from 'react';
import {
  supabase,
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
  editWish,
  toggleWishFulfilled,
  deleteWish,
  getFriends,
  addFriend,
  acceptFriend,
  deleteFriend,
  getSpaceEvents,
  addSpaceEvent,
  deleteSpaceEvent,
  inviteFriendToSpace,
  subscribeToWishes,
  getAdminStats,
  getAdminUsers,
  deleteUserAdmin,
  ADMIN_ACCOUNT,
  DEMO_USER_ACCOUNT,
} from './supabase';
import { sound } from './audio';

import {
  LayoutDashboard,
  Users,
  User,
  ShieldCheck,
  Sun,
  Moon,
  LogOut,
  Sparkles,
  Menu,
  Eye,
  EyeOff,
  CheckCheck,
  X,
} from 'lucide-react';

import ConfettiHearts from './components/ConfettiHearts';
import DashboardView from './components/DashboardView';
import SpaceDetail from './components/SpaceDetail';
import FriendsView from './components/FriendsView';
import ProfileView from './components/ProfileView';
import AdminPanel from './components/AdminPanel';
import CreateSpaceModal from './components/CreateSpaceModal';
import JoinSpaceModal from './components/JoinSpaceModal';
import AddWishModal from './components/AddWishModal';
import EditWishModal from './components/EditWishModal';
import RouletteModal from './components/RouletteModal';

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
  const [spaceEvents, setSpaceEvents] = useState([]);
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
  const [isEditWishOpen, setIsEditWishOpen] = useState(false);
  const [editingWish, setEditingWish] = useState(null);
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auth Forms state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
    emoji: '🌸',
  });

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

  // Load initial data on user change
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

  // Space data loading & Supabase Real-time Subscription
  useEffect(() => {
    if (!activeSpace) return;

    let isMounted = true;

    const loadSpaceData = async () => {
      const w = await getWishes(activeSpace.id);
      if (isMounted) setWishes(w);
      const ev = await getSpaceEvents(activeSpace.id);
      if (isMounted) setSpaceEvents(ev);
    };

    loadSpaceData();

    // Subscribe to Realtime Wish changes
    const channel = subscribeToWishes(activeSpace.id, async () => {
      const updatedWishes = await getWishes(activeSpace.id);
      if (isMounted) setWishes(updatedWishes);
    });

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [activeSpace]);

  // Open Space handler
  const openSpace = (space) => {
    setActiveSpace(space);
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
  const handleCreateSpace = async (spaceFormData) => {
    const newSpace = await createSpace(spaceFormData, currentUser);
    setSpaces([newSpace, ...spaces]);
    setIsCreateSpaceOpen(false);
    showToast('สร้างห้องสำเร็จ! 💕', `รหัสเชิญ: ${newSpace.inviteCode}`);
  };

  // Join Space
  const handleJoinSpace = async (joinCode) => {
    const res = await joinSpace(joinCode, currentUser);
    if (res.status === 'success') {
      setSpaces([res.space, ...spaces.filter((s) => s.id !== res.space.id)]);
      setIsJoinSpaceOpen(false);
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

  // Add Wish
  const handleAddWish = async (wishFormData) => {
    if (!activeSpace) return;
    setIsAddWishOpen(false);
    const newWish = await addWish(activeSpace.id, wishFormData, currentUser);
    setWishes([newWish, ...wishes]);
    sound.playSuccess();
    showToast('เพิ่มรายการสำเร็จ! 🎁', newWish.title);
  };

  // Edit Wish
  const handleOpenEditWish = (wish) => {
    setEditingWish(wish);
    setIsEditWishOpen(true);
  };

  const handleSaveEditWish = async (wishId, updateData) => {
    if (!activeSpace) return;
    const updated = await editWish(activeSpace.id, wishId, updateData);
    if (updated) {
      setWishes(wishes.map((w) => (w.id === wishId ? updated : w)));
      setIsEditWishOpen(false);
      setEditingWish(null);
      showToast('แก้ไขรายการสำเร็จ! ✏️', updated.title);
    }
  };

  // Toggle Fulfilled
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

  // Delete Wish
  const handleDeleteWish = async (wishId, title) => {
    if (!confirm(`คุณต้องการลบ "${title}" ใช่หรือไม่?`)) return;
    setWishes(wishes.filter((w) => w.id !== wishId));
    await deleteWish(activeSpace.id, wishId);
    showToast('ลบรายการเรียบร้อย');
  };

  // Space Events Handlers
  const handleAddEvent = async (eventData) => {
    if (!activeSpace) return;
    const newEvent = await addSpaceEvent(activeSpace.id, eventData);
    setSpaceEvents([...spaceEvents, newEvent]);
    showToast('เพิ่มวันสำคัญแล้ว! ⏰', newEvent.title);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!activeSpace) return;
    await deleteSpaceEvent(activeSpace.id, eventId);
    setSpaceEvents(spaceEvents.filter((e) => e.id !== eventId));
    showToast('ลบวันสำคัญเรียบร้อย');
  };

  // Invite Friend to Space
  const handleInviteFriend = async (friendDisplayName) => {
    if (!activeSpace) return;
    const res = await inviteFriendToSpace(activeSpace.id, friendDisplayName);
    if (res.status === 'success') {
      const updatedMembers = [...(activeSpace.members || []), friendDisplayName];
      const updatedSpace = {
        ...activeSpace,
        members: updatedMembers,
        memberCount: updatedMembers.length,
      };
      setActiveSpace(updatedSpace);
      setSpaces(spaces.map((s) => (s.id === activeSpace.id ? updatedSpace : s)));
      showToast('เชิญเพื่อนเข้าห้องสำเร็จ! 🌸', friendDisplayName);
    } else {
      showToast('ข้อผิดพลาด', res.message);
    }
  };

  // Friends Handlers
  const handleAddFriend = async (username) => {
    const res = await addFriend(username);
    if (res.status === 'success') {
      setFriends([res.friend, ...friends]);
    }
    return res;
  };

  const handleAcceptFriend = async (friendId) => {
    await acceptFriend(friendId);
    setFriends(friends.map((item) => (item.id === friendId ? { ...item, status: 'accepted' } : item)));
  };

  const handleDeleteFriend = async (friendId) => {
    await deleteFriend(friendId);
    setFriends(friends.filter((item) => item.id !== friendId));
  };

  // Admin Handler
  const handleDeleteUser = async (userId, username) => {
    if (!confirm(`ต้องการลบบัญชี @${username} ใช่หรือไม่?`)) return;
    await deleteUserAdmin(userId);
    setAdminUsers(adminUsers.filter((u) => u.id !== userId));
    showToast('ลบผู้ใช้สำเร็จ');
  };

  // Avatar Upload with Canvas Compression
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

  // ==================== RENDER: AUTH SCREEN ====================
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

        {/* Main Content Router */}
        {activeSpace ? (
          <SpaceDetail
            space={activeSpace}
            wishes={wishes}
            friends={friends}
            currentUser={currentUser}
            spaceEvents={spaceEvents}
            onBack={() => setActiveSpace(null)}
            onDeleteSpace={handleDeleteSpace}
            onCopyInviteCode={handleCopyInviteCode}
            onShareSpace={handleShareSpace}
            onOpenAddWish={() => setIsAddWishOpen(true)}
            onOpenEditWish={handleOpenEditWish}
            onOpenRoulette={() => setIsRouletteOpen(true)}
            onDeleteWish={handleDeleteWish}
            onToggleFulfilled={handleToggleWishFulfilled}
            onAddEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent}
            onInviteFriend={handleInviteFriend}
            showToast={showToast}
            copiedCode={copiedCode}
          />
        ) : activeTab === 'dashboard' ? (
          <DashboardView
            spaces={spaces}
            onOpenSpace={openSpace}
            onCreateSpace={() => setIsCreateSpaceOpen(true)}
            onJoinSpace={() => setIsJoinSpaceOpen(true)}
          />
        ) : activeTab === 'friends' ? (
          <FriendsView
            friends={friends}
            onAddFriend={handleAddFriend}
            onAcceptFriend={handleAcceptFriend}
            onDeleteFriend={handleDeleteFriend}
            showToast={showToast}
          />
        ) : activeTab === 'profile' ? (
          <ProfileView
            currentUser={currentUser}
            onAvatarChange={handleAvatarChange}
          />
        ) : activeTab === 'admin' ? (
          <AdminPanel
            stats={adminStats}
            users={adminUsers}
            onDeleteUser={handleDeleteUser}
            showToast={showToast}
          />
        ) : null}
      </main>

      {/* Mobile Bottom Dock */}
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

      {/* Modals */}
      <CreateSpaceModal
        isOpen={isCreateSpaceOpen}
        onClose={() => setIsCreateSpaceOpen(false)}
        onSubmit={handleCreateSpace}
      />

      <JoinSpaceModal
        isOpen={isJoinSpaceOpen}
        onClose={() => setIsJoinSpaceOpen(false)}
        onSubmit={handleJoinSpace}
      />

      <AddWishModal
        isOpen={isAddWishOpen}
        onClose={() => setIsAddWishOpen(false)}
        onSubmit={handleAddWish}
      />

      <EditWishModal
        isOpen={isEditWishOpen}
        onClose={() => {
          setIsEditWishOpen(false);
          setEditingWish(null);
        }}
        wish={editingWish}
        onSave={handleSaveEditWish}
      />

      <RouletteModal
        isOpen={isRouletteOpen}
        onClose={() => setIsRouletteOpen(false)}
        wishes={wishes}
        onConfetti={() => {
          setConfettiActive(true);
          setTimeout(() => setConfettiActive(false), 3500);
        }}
      />
    </div>
  );
}
