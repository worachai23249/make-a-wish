import React, { useState, useEffect, lazy, Suspense } from 'react';
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
  leaveSpace,
  getWishes,
  addWish,
  editWish,
  toggleWishFulfilled,
  deleteWish,
  getFriendships,
  getFriends,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriendship,
  clearAllAccounts,
  getSpaceEvents,
  addSpaceEvent,
  deleteSpaceEvent,
  inviteFriendToSpace,
  subscribeToWishes,
  getAdminStats,
  getAdminUsers,
  deleteUserAdmin,
  ADMIN_ACCOUNT,
  editSpace,
  addWishNote,
  updateUserProfile,
  claimWish,
  unclaimWish,
  toggleReaction,
  getNotifications,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  subscribeToNotifications,
} from './supabase';
import { sound } from './audio';

import {
  LayoutDashboard,
  Users,
  User,
  ShieldCheck,
  LogOut,
  Sparkles,
  Eye,
  EyeOff,
  CheckCheck,
  X,
  Compass,
  Volume2,
  VolumeX,
  Bell,
  Sun,
  Moon,
} from 'lucide-react';

import ConfettiHearts from './components/ConfettiHearts';
import DashboardView from './components/DashboardView';
import SpaceDetail from './components/SpaceDetail';
import FriendsView from './components/FriendsView';
import ProfileView from './components/ProfileView';
import AdminPanel from './components/AdminPanel';
import CreateSpaceModal from './components/CreateSpaceModal';
import JoinSpaceModal from './components/JoinSpaceModal';
const AddWishModal = lazy(() => import('./components/AddWishModal'));
const EditWishModal = lazy(() => import('./components/EditWishModal'));
const RouletteModal = lazy(() => import('./components/RouletteModal'));

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Navigation tab
  const [activeTab, setActiveTab] = useState(() => {
    const user = getCurrentUser();
    return user?.role === 'admin' ? 'admin' : 'dashboard';
  });

  // Active space view state
  const [activeSpace, setActiveSpace] = useState(null);

  // Data states
  const [spaces, setSpaces] = useState([]);
  const [wishes, setWishes] = useState([]);
  const [friendships, setFriendships] = useState({ friends: [], incomingRequests: [], outgoingRequests: [] });
  const [spaceEvents, setSpaceEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
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
  const [isMuted, setIsMuted] = useState(() => sound.isMuted());
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem('makewish_theme') === 'dark';
    } catch {
      return false;
    }
  });

  // Dark mode handler
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('makewish_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('makewish_theme', 'light');
    }
  }, [isDarkMode]);

  // Load user data
  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    if (!currentUser) return;
    const s = await getSpaces(currentUser.id);
    setSpaces(s);
    const f = await getFriendships(currentUser.id);
    setFriendships(f);
    const notifs = await getNotifications(currentUser.id);
    setNotifications(notifs);
    if (currentUser.role === 'admin') {
      const stats = await getAdminStats();
      setAdminStats(stats);
      const u = await getAdminUsers();
      setAdminUsers(u);
    }
  };

  // Subscribe to Realtime Notifications
  useEffect(() => {
    if (!currentUser) return;
    const channel = subscribeToNotifications(currentUser.id, (newNotif) => {
      setNotifications(prev => [newNotif, ...prev]);
      sound.playSuccess();
      showToast(newNotif.title, newNotif.message);
    });
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [currentUser]);

  // Auto-join from shared URL (?join=CODE)
  useEffect(() => {
    if (!currentUser) return;
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode) {
      // Clean URL without reload
      window.history.replaceState({}, '', window.location.pathname);
      // Auto-join the space
      (async () => {
        const res = await joinSpace(joinCode, currentUser);
        if (res.status === 'success') {
          setSpaces(prev => [res.space, ...prev.filter(s => s.id !== res.space.id)]);
          setActiveSpace(res.space);
          showToast('เข้าร่วมห้องสำเร็จ 💎', res.space.name);
        } else {
          showToast('ไม่สามารถเข้าร่วมห้องได้', res.message);
        }
      })();
    }
  }, [currentUser]);

  // Space data loading & Real-time Subscription
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
      showToast('ยินดีต้อนรับกลับ ✨', `${res.user.displayName}`);
    } else {
      showToast('เข้าสู่ระบบไม่สำเร็จ', res.message);
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
      showToast('สร้างบัญชีสำเร็จ 💎', 'เข้าสู่ระบบเรียบร้อย');
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setActiveSpace(null);
    showToast('ออกจากระบบแล้ว', 'ข้อมูลถูกบันทึกไว้อย่างปลอดภัย');
  };

  // Space Handlers
  const handleCreateSpace = async (spaceFormData) => {
    const newSpace = await createSpace(spaceFormData, currentUser);
    setSpaces([newSpace, ...spaces]);
    setIsCreateSpaceOpen(false);
    showToast('สร้างห้องสำเร็จ ✨', `รหัสเชิญ: ${newSpace.inviteCode}`);
  };

  const handleJoinSpace = async (joinCode) => {
    const res = await joinSpace(joinCode, currentUser);
    if (res.status === 'success') {
      setSpaces([res.space, ...spaces.filter((s) => s.id !== res.space.id)]);
      setIsJoinSpaceOpen(false);
      showToast('เข้าร่วมห้องสำเร็จ 💎', res.space.name);
    } else {
      showToast('ข้อผิดพลาด', res.message);
    }
  };

  const handleDeleteSpace = async (spaceId, spaceName) => {
    if (!confirm(`ต้องการลบห้อง "${spaceName}" ใช่หรือไม่? รายการความปรารถนาทั้งหมดในห้องนี้จะถูกลบ`)) return;
    await deleteSpace(spaceId);
    setSpaces(spaces.filter((s) => s.id !== spaceId));
    setActiveSpace(null);
    showToast('ลบห้องเรียบร้อย');
  };

  const handleLeaveSpace = async (spaceId, spaceName) => {
    if (!confirm(`คุณต้องการออกจากห้อง "${spaceName}" ใช่หรือไม่?`)) return;
    await leaveSpace(spaceId, currentUser);
    setSpaces(spaces.filter(s => s.id !== spaceId));
    setActiveSpace(null);
    showToast('ออกจากห้องแล้ว', spaceName);
  };

  const handleEditSpace = async (spaceId, updates) => {
    const updated = await editSpace(spaceId, updates);
    if (updated) {
      setSpaces(spaces.map(s => s.id === spaceId ? updated : s));
      setActiveSpace(updated);
      showToast('แก้ไขห้องสำเร็จ ✨', updated.name);
    }
  };

  const handleAddNote = async (wishId, noteText) => {
    if (!activeSpace) return;
    const res = await addWishNote(activeSpace.id, wishId, noteText, currentUser);
    if (res?.wish) {
      setWishes(wishes.map(w => w.id === wishId ? res.wish : w));
      showToast('เพิ่มโน้ตสำเร็จ 💬');
    }
  };

  const handleCopyInviteCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    showToast('คัดลอกรหัสเชิญแล้ว 📋', `รหัส: ${code}`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShareSpace = async (space) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `เข้าร่วมห้อง "${space.name}" บน Make a Wish`,
          text: `ใส่รหัสเชิญ: ${space.inviteCode} เพื่อแชร์ของขวัญและความปรารถนากับฉันใน Make a Wish! ✨`,
          url: `${window.location.origin}?join=${space.inviteCode}`,
        });
        showToast('แชร์สำเร็จ 💌');
      } catch (_) {}
    } else {
      handleCopyInviteCode(space.inviteCode);
    }
  };

  // Wish Handlers
  const handleAddWish = async (wishFormData) => {
    if (!activeSpace) return;
    setIsAddWishOpen(false);
    const newWish = await addWish(activeSpace.id, wishFormData, currentUser);
    setWishes([newWish, ...wishes]);
    sound.playSuccess();
    showToast('เพิ่มรายการสำเร็จ ✨', newWish.title);
  };

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
      showToast('แก้ไขรายการสำเร็จ ✏️', updated.title);
    }
  };

  const handleToggleWishFulfilled = async (wish) => {
    const updated = await toggleWishFulfilled(activeSpace.id, wish.id, currentUser);
    if (updated) {
      setWishes(wishes.map((w) => (w.id === wish.id ? updated : w)));
      if (updated.isFulfilled) {
        sound.playSuccess();
        setConfettiActive(true);
        setTimeout(() => setConfettiActive(false), 3600);
        showToast('มอบของขวัญสำเร็จ ✦', `ทำเครื่องหมายโดย ${currentUser.displayName}`);
        if (wish.userId && wish.userId !== currentUser.id) {
          createNotification(wish.userId, {
            type: 'wish_fulfilled',
            title: 'มีคนมอบของขวัญให้คุณแล้ว! 🎁',
            message: `${currentUser.displayName} ได้มอบ "${wish.title}" ให้คุณแล้ว ✨`,
            emoji: '🎁',
            relatedId: wish.id,
          });
        }
      } else {
        showToast('เปลี่ยนสถานะ', 'เปลี่ยนกลับเป็นยังไม่ได้ซื้อ');
      }
    }
  };

  // Secret Claim (Surprise Mode) Handlers
  const handleClaimWish = async (wish) => {
    if (!activeSpace) return;
    const updated = await claimWish(activeSpace.id, wish.id, currentUser);
    if (updated) {
      setWishes(wishes.map((w) => (w.id === wish.id ? updated : w)));
      sound.playSuccess();
      showToast('แอบจองของขวัญสำเร็จ 🤫', `เก็บเป็นความลับเพื่อเซอร์ไพรส์ ${wish.userName || 'คนพิเศษ'}!`);
    }
  };

  const handleUnclaimWish = async (wish) => {
    if (!activeSpace) return;
    const updated = await unclaimWish(activeSpace.id, wish.id);
    if (updated) {
      setWishes(wishes.map((w) => (w.id === wish.id ? updated : w)));
      showToast('ยกเลิกการจองแล้ว', wish.title);
    }
  };

  // Reaction Handler
  const handleToggleReaction = async (wishId, emoji) => {
    if (!activeSpace) return;
    const updated = await toggleReaction(activeSpace.id, wishId, emoji, currentUser);
    if (updated) {
      setWishes(wishes.map((w) => (w.id === wishId ? updated : w)));
    }
  };

  const handleDeleteWish = async (wishId, title) => {
    if (!confirm(`คุณต้องการลบ "${title}" ใช่หรือไม่?`)) return;
    setWishes(wishes.filter((w) => w.id !== wishId));
    await deleteWish(activeSpace.id, wishId);
    showToast('ลบรายการเรียบร้อย');
  };

  // Space Events
  const handleAddEvent = async (eventData) => {
    if (!activeSpace) return;
    const newEvent = await addSpaceEvent(activeSpace.id, eventData);
    setSpaceEvents([...spaceEvents, newEvent]);
    showToast('เพิ่มวันสำคัญแล้ว ⏰', newEvent.title);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!activeSpace) return;
    await deleteSpaceEvent(activeSpace.id, eventId);
    setSpaceEvents(spaceEvents.filter((e) => e.id !== eventId));
    showToast('ลบวันสำคัญเรียบร้อย');
  };

  // Invite Friend
  const handleInviteFriend = async (friendDisplayName, friendUserId) => {
    if (!activeSpace) return;
    const res = await inviteFriendToSpace(activeSpace.id, friendDisplayName, friendUserId);
    if (res.status === 'success') {
      const updatedMembers = [...(activeSpace.members || []), friendDisplayName];
      const updatedMemberIds = [...(activeSpace.memberIds || []), friendUserId].filter(Boolean);
      const updatedSpace = {
        ...activeSpace,
        members: updatedMembers,
        memberIds: updatedMemberIds,
        memberCount: updatedMembers.length,
      };
      setActiveSpace(updatedSpace);
      setSpaces(spaces.map((s) => (s.id === activeSpace.id ? updatedSpace : s)));
      if (friendUserId) {
        createNotification(friendUserId, {
          type: 'room_invite',
          title: 'คำเชิญเข้าห้อง ✨',
          message: `${currentUser.displayName} ได้เชิญคุณเข้าร่วมห้อง "${activeSpace.name}"`,
          emoji: activeSpace.emoji || '🏛️',
          relatedId: activeSpace.id,
        });
      }
      showToast('เชิญเพื่อนเข้าห้องสำเร็จ ✨', friendDisplayName);
    } else {
      showToast('ข้อผิดพลาด', res.message);
    }
  };

  // Friends Handlers (Facebook-Style Friend Request System)
  const handleAddFriend = async (username) => {
    const res = await sendFriendRequest(username, currentUser);
    if (res.status === 'success') {
      const updated = await getFriendships(currentUser.id);
      setFriendships(updated);
      const clean = username.replace(/^@/, '').toLowerCase().trim();
      const newReq = updated.outgoingRequests?.find(r => (r.username || '').toLowerCase() === clean);
      if (newReq?.id) {
        createNotification(newReq.id, {
          type: 'friend_request',
          title: 'คำขอเป็นเพื่อนใหม่ 💌',
          message: `${currentUser.displayName} (@${currentUser.username}) ส่งคำขอเป็นเพื่อนถึงคุณ`,
          emoji: '💌',
          relatedId: newReq.friendshipId,
        });
      }
    }
    return res;
  };

  const handleAcceptFriend = async (friendshipId) => {
    const target = friendships.incomingRequests?.find(r => (r.friendshipId || r.id) === friendshipId);
    await acceptFriendRequest(friendshipId);
    const updated = await getFriendships(currentUser.id);
    setFriendships(updated);
    if (target?.id) {
      createNotification(target.id, {
        type: 'friend_accepted',
        title: 'ตอบรับเป็นเพื่อนแล้ว ✦',
        message: `${currentUser.displayName} ได้ตอบรับคำขอเป็นเพื่อนของคุณแล้ว!`,
        emoji: '👥',
        relatedId: friendshipId,
      });
    }
  };

  const handleDeclineFriend = async (friendshipId) => {
    await removeFriendship(friendshipId);
    const updated = await getFriendships(currentUser.id);
    setFriendships(updated);
  };

  const handleCancelFriendRequest = async (friendshipId) => {
    await removeFriendship(friendshipId);
    const updated = await getFriendships(currentUser.id);
    setFriendships(updated);
  };

  const handleDeleteFriend = async (friendshipId) => {
    await removeFriendship(friendshipId);
    const updated = await getFriendships(currentUser.id);
    setFriendships(updated);
  };

  // Admin Handler
  const handleDeleteUser = async (userId, username) => {
    if (!confirm(`ต้องการลบบัญชี @${username} ใช่หรือไม่?`)) return;
    await deleteUserAdmin(userId);
    setAdminUsers(adminUsers.filter((u) => u.id !== userId));
    showToast('ลบผู้ใช้สำเร็จ');
  };

  const handleClearAllAccounts = async () => {
    if (!confirm('คำเตือน: คุณต้องการล้างข้อมูลระบบและลบบัญชีทั้งหมดใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) return;
    await clearAllAccounts();
    setCurrentUser(null);
    setActiveSpace(null);
    setSpaces([]);
    setFriendships({ friends: [], incomingRequests: [], outgoingRequests: [] });
    setWishes([]);
    setAdminUsers([]);
    showToast('ล้างข้อมูลระบบทั้งหมดเรียบร้อยแล้ว ✨');
  };

  // Notifications Helpers
  const handleMarkNotifRead = async (notifId) => {
    await markNotificationRead(notifId);
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n));
  };

  const handleMarkAllNotifsRead = async () => {
    await markAllNotificationsRead(currentUser.id);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Profile Image Canvas Compression & Cloud Sync
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
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
        const base64 = canvas.toDataURL('image/jpeg', 0.85);

        const updated = { ...currentUser, avatarUrl: base64 };
        setCurrentUser(updated);
        await updateUserProfile(currentUser.id, { avatarUrl: base64 });
        showToast('อัปเดตรูปโปรไฟล์สำเร็จ ✨', 'ขนาดภาพย่อเหลือ ~15 KB และซิงก์ Cloud เรียบร้อย');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // ==================== RENDER: AUTH SCREEN (LUXURY PASTEL BLUE) ====================
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="glass-card w-full max-w-md rounded-[40px] p-8 sm:p-10 shadow-2xl animate-fade-in relative z-10 border-sky-200/80 dark:border-sky-400/20">
          {/* 💧 3D Glass Water Droplets on Auth Card (From Image 1) */}
          <div className="water-droplet-accent top-6 right-8 w-3 h-3.5 opacity-80" />
          <div className="water-droplet-accent top-11 right-6 w-2 h-2 opacity-70" />
          <div className="water-droplet-accent bottom-8 left-6 w-2.5 h-3 opacity-75" />

          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-300 via-sky-400 to-cyan-300 text-white shadow-xl shadow-sky-300/40 text-3xl mb-4">
              ✨
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-sky-500 to-cyan-400 bg-clip-text text-transparent">
              Make a Wish
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium tracking-wide">
              Luxury Private Wishlist • แชร์ความปรารถนากับคนพิเศษ
            </p>
          </div>


          {isRegisterMode ? (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">ชื่อที่แสดง</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="เช่น มุก, พัตเตอร์, บีม"
                  value={registerForm.displayName}
                  onChange={(e) => setRegisterForm({ ...registerForm, displayName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  ชื่อผู้ใช้ (@username)
                </label>
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
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">อีเมล</label>
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
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">รหัสผ่าน</label>
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-primary w-full py-3.5 mt-3 text-sm">
                สร้างบัญชีระดับพรีเมียม ✦
              </button>
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className="text-xs text-sky-600 dark:text-sky-400 font-bold hover:underline"
                >
                  มีบัญชีอยู่แล้ว? เข้าสู่ระบบที่นี่
                </button>
              </div>
            </form>
          ) : (
            /* LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">อีเมล</label>
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
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">รหัสผ่าน</label>
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-primary w-full py-3.5 mt-3 text-sm">
                เข้าสู่ระบบ ✨
              </button>
              <div className="text-center pt-3 space-y-2">
                <div>
                  <button
                    type="button"
                    onClick={() => setIsRegisterMode(true)}
                    className="text-xs text-sky-600 dark:text-sky-400 font-bold hover:underline"
                  >
                    ยังไม่มีบัญชี? สมัครสมาชิกใหม่ฟรี
                  </button>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                  <CheckCheck size={13} className="text-sky-500" />
                  ระบบจำการล็อกอินอัตโนมัติ ไม่ต้องกรอกใหม่
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ==================== RENDER: MAIN APPLICATION (PASTEL BLUE LUXURY) ====================
  return (
    <div className="min-h-screen flex flex-col pb-24 lg:pb-8">
      {/* 60fps Hardware Canvas Fireworks & Stardust */}
      <ConfettiHearts active={confettiActive} />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 glass-panel px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3.5 border-sky-300/40 dark:border-sky-500/30 animate-fade-in max-w-sm">
          <div className="w-8 h-8 rounded-full bg-sky-500/15 text-sky-500 flex items-center justify-center shrink-0">
            <Sparkles size={16} />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs sm:text-sm truncate text-slate-900 dark:text-slate-100">{toast.title}</div>
            {toast.message && <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{toast.message}</div>}
          </div>
        </div>
      )}

      {/* ==================== 💎 FLOATING LUXURY TOPBAR ==================== */}
      <header className="sticky top-4 z-40 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="glass-panel rounded-full px-5 py-3 flex items-center justify-between border-sky-200/50 dark:border-sky-500/20 shadow-lg">
          {/* Brand Logo & Emblem */}
          <div
            onClick={() => {
              setActiveTab('dashboard');
              setActiveSpace(null);
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-300 via-sky-400 to-cyan-300 flex items-center justify-center text-lg text-white shadow-md shadow-sky-300/40 group-hover:scale-105 transition-transform">
              ✨
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight bg-gradient-to-r from-sky-400 via-sky-500 to-cyan-400 bg-clip-text text-transparent">
                Make a Wish
              </div>
              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block animate-pulse" />
                Private Wishlist Sanctuary
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links (Matching Image 3) */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full border border-sky-200/90 dark:border-sky-500/30 bg-white/75 dark:bg-slate-900/60 shadow-inner">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setActiveSpace(null);
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs transition-all ${
                activeTab === 'dashboard' && !activeSpace
                  ? 'btn-pill-active font-extrabold'
                  : 'text-slate-800 dark:text-slate-200 hover:text-[#00a6ff] hover:bg-sky-50 dark:hover:bg-slate-800 font-bold'
              }`}
            >
              <LayoutDashboard size={16} /> ห้องทั้งหมด
            </button>

            <button
              onClick={() => {
                setActiveTab('friends');
                setActiveSpace(null);
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs transition-all ${
                activeTab === 'friends'
                  ? 'btn-pill-active font-extrabold'
                  : 'text-slate-800 dark:text-slate-200 hover:text-[#00a6ff] hover:bg-sky-50 dark:hover:bg-slate-800 font-bold'
              }`}
            >
              <Users size={16} /> เพื่อนของฉัน
            </button>

            <button
              onClick={() => {
                setActiveTab('profile');
                setActiveSpace(null);
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs transition-all ${
                activeTab === 'profile'
                  ? 'btn-pill-active font-extrabold'
                  : 'text-slate-800 dark:text-slate-200 hover:text-[#00a6ff] hover:bg-sky-50 dark:hover:bg-slate-800 font-bold'
              }`}
            >
              <User size={16} /> โปรไฟล์
            </button>

            {currentUser.role === 'admin' && (
              <button
                onClick={() => {
                  setActiveTab('admin');
                  setActiveSpace(null);
                }}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs transition-all ${
                  activeTab === 'admin' && !activeSpace
                    ? 'bg-gradient-to-r from-amber-500 to-[#00a6ff] text-white font-extrabold shadow-md'
                    : 'text-amber-500 hover:bg-amber-500/10 font-bold'
                }`}
              >
                <ShieldCheck size={16} /> แอดมิน
              </button>
            )}
          </nav>

          {/* Right Action Cluster: Theme, Notifications, Sound, Profile, Logout */}
          <div className="flex items-center gap-2 relative">
            {/* Dark / Light Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
              title={isDarkMode ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด'}
            >
              {isDarkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 rounded-full text-slate-400 hover:text-sky-500 hover:bg-sky-500/10 transition-colors relative"
                title="การแจ้งเตือน"
              >
                <Bell size={16} />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 top-12 w-80 sm:w-88 glass-panel rounded-3xl p-4 shadow-2xl z-50 border border-sky-200 dark:border-sky-500/30 animate-fade-in max-h-96 overflow-y-auto space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-sky-100 dark:border-sky-500/20">
                    <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <Bell size={13} className="text-sky-500" /> การแจ้งเตือน ({notifications.filter(n => !n.isRead).length})
                    </span>
                    {notifications.some(n => !n.isRead) && (
                      <button
                        onClick={handleMarkAllNotifsRead}
                        className="text-[10px] text-sky-600 dark:text-sky-400 font-bold hover:underline"
                      >
                        อ่านทั้งหมด
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      ยังไม่มีการแจ้งเตือนใหม่ ✨
                    </div>
                  ) : (
                    notifications.slice(0, 15).map(n => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkNotifRead(n.id)}
                        className={`p-3 rounded-2xl flex items-start gap-2.5 cursor-pointer transition-all ${
                          n.isRead
                            ? 'bg-white/40 dark:bg-slate-800/40 opacity-75'
                            : 'bg-sky-50 dark:bg-sky-500/15 border border-sky-200 dark:border-sky-400/20 shadow-sm'
                        }`}
                      >
                        <span className="text-lg shrink-0">{n.emoji || '🔔'}</span>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-slate-800 dark:text-slate-100 leading-snug truncate">
                            {n.title}
                          </div>
                          {n.message && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                              {n.message}
                            </div>
                          )}
                          <div className="text-[9px] text-slate-400 mt-1">
                            {new Date(n.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Sound FX Toggle */}
            <button
              onClick={() => {
                sound.setMuted(!isMuted);
                setIsMuted(!isMuted);
              }}
              className="p-2 rounded-full text-slate-400 hover:text-sky-500 hover:bg-sky-500/10 transition-colors"
              title={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            {/* Profile Avatar Pill */}
            <div
              onClick={() => {
                setActiveTab('profile');
                setActiveSpace(null);
              }}
              className="flex items-center gap-2 p-1 pl-1.5 pr-3 rounded-full bg-sky-500/10 hover:bg-sky-500/15 border border-sky-400/20 cursor-pointer transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs overflow-hidden">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  currentUser.emoji || '🌸'
                )}
              </div>
              <span className="text-xs font-bold truncate max-w-[90px]">{currentUser.displayName}</span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
              title="ออกจากระบบ"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ==================== MAIN CONTENT AREA ==================== */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 pt-6 pb-12">
        {activeSpace ? (
          <SpaceDetail
            space={activeSpace}
            wishes={wishes}
            friends={friendships.friends}
            currentUser={currentUser}
            spaceEvents={spaceEvents}
            onBack={() => setActiveSpace(null)}
            onDeleteSpace={handleDeleteSpace}
            onLeaveSpace={handleLeaveSpace}
            onCopyInviteCode={handleCopyInviteCode}
            onShareSpace={handleShareSpace}
            onOpenAddWish={() => setIsAddWishOpen(true)}
            onOpenEditWish={handleOpenEditWish}
            onOpenRoulette={() => setIsRouletteOpen(true)}
            onDeleteWish={handleDeleteWish}
            onToggleFulfilled={handleToggleWishFulfilled}
            onClaimWish={handleClaimWish}
            onUnclaimWish={handleUnclaimWish}
            onToggleReaction={handleToggleReaction}
            onAddEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent}
            onInviteFriend={handleInviteFriend}
            showToast={showToast}
            copiedCode={copiedCode}
            onEditSpace={handleEditSpace}
            onAddNote={handleAddNote}
          />
        ) : activeTab === 'dashboard' ? (
          <DashboardView
            spaces={spaces}
            currentUser={currentUser}
            onOpenSpace={openSpace}
            onCreateSpace={() => setIsCreateSpaceOpen(true)}
            onJoinSpace={() => setIsJoinSpaceOpen(true)}
          />
        ) : activeTab === 'friends' ? (
          <FriendsView
            friends={friendships.friends}
            incomingRequests={friendships.incomingRequests}
            outgoingRequests={friendships.outgoingRequests}
            currentUser={currentUser}
            onAddFriend={handleAddFriend}
            onAcceptFriend={handleAcceptFriend}
            onDeclineFriend={handleDeclineFriend}
            onCancelRequest={handleCancelFriendRequest}
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
            onClearAll={handleClearAllAccounts}
            showToast={showToast}
          />
        ) : null}
      </main>

      {/* ==================== MOBILE SLIM DOCK ==================== */}
      <div className="md:hidden fixed bottom-3 inset-x-6 z-40 glass-panel rounded-full p-2 shadow-2xl flex items-center justify-around border-sky-300/60 dark:border-sky-500/30">
        <button
          onClick={() => {
            setActiveTab('dashboard');
            setActiveSpace(null);
          }}
          className={`flex flex-col items-center gap-0.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold transition-all ${
            activeTab === 'dashboard' && !activeSpace ? 'bg-[#00a6ff] text-white shadow-md shadow-sky-400/35' : 'text-slate-700 dark:text-slate-300'
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
          className={`flex flex-col items-center gap-0.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold transition-all ${
            activeTab === 'friends' ? 'bg-[#00a6ff] text-white shadow-md shadow-sky-400/35' : 'text-slate-700 dark:text-slate-300'
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
          className={`flex flex-col items-center gap-0.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold transition-all ${
            activeTab === 'profile' ? 'bg-[#00a6ff] text-white shadow-md shadow-sky-400/35' : 'text-slate-700 dark:text-slate-300'
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
            className={`flex flex-col items-center gap-0.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold transition-all ${
              activeTab === 'admin' && !activeSpace ? 'bg-amber-500 text-white shadow-md shadow-amber-500/35' : 'text-amber-500 font-bold'
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

      <Suspense fallback={null}>
        {isAddWishOpen && (
          <AddWishModal
            isOpen={isAddWishOpen}
            onClose={() => setIsAddWishOpen(false)}
            onSubmit={handleAddWish}
          />
        )}

        {isEditWishOpen && (
          <EditWishModal
            isOpen={isEditWishOpen}
            onClose={() => {
              setIsEditWishOpen(false);
              setEditingWish(null);
            }}
            wish={editingWish}
            onSave={handleSaveEditWish}
          />
        )}

        {isRouletteOpen && (
          <RouletteModal
            isOpen={isRouletteOpen}
            onClose={() => setIsRouletteOpen(false)}
            wishes={wishes}
            onConfetti={() => {
              setConfettiActive(true);
              setTimeout(() => setConfettiActive(false), 3600);
            }}
          />
        )}
      </Suspense>
    </div>
  );
}
