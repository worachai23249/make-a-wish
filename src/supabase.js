import { createClient } from '@supabase/supabase-js';

// Supabase Configuration matching church_accounting
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://trrcywwzljjtpzynejrk.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_0loAO_PKoZ0u1tvMMEmdHA_3oST-XxR';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==================== LOCAL STORAGE PERSISTENCE (Like Facebook) ====================
const STORAGE_KEY_AUTH = 'makewish_auth_user';
const STORAGE_KEY_SPACES = 'makewish_local_spaces';
const STORAGE_KEY_WISHES = 'makewish_local_wishes';
const STORAGE_KEY_FRIENDS = 'makewish_local_friends';

// Default initial admin account
const ADMIN_ACCOUNT = {
  id: 'admin-system-id',
  email: 'admin@gmail.com',
  password: '123456',
  displayName: 'ผู้ดูแลระบบ',
  username: 'admin',
  role: 'admin',
  emoji: '👑',
};

// ==================== AUTHENTICATION ====================
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function login(email, password) {
  // Check admin
  if (email === ADMIN_ACCOUNT.email && password === ADMIN_ACCOUNT.password) {
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(ADMIN_ACCOUNT));
    return { status: 'success', user: ADMIN_ACCOUNT };
  }

  // Try Supabase Auth or users table
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (data && !error) {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(data));
      return { status: 'success', user: data };
    }
  } catch (_) {}

  // Fallback to local stored registered users
  try {
    const users = JSON.parse(localStorage.getItem('makewish_all_users') || '[]');
    const match = users.find(u => u.email === email && u.password === password);
    if (match) {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(match));
      return { status: 'success', user: match };
    }
  } catch (_) {}

  return { status: 'error', message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
}

export async function register(userData) {
  const newUser = {
    id: 'user-' + Date.now(),
    displayName: userData.displayName,
    username: userData.username.replace(/^@/, '').toLowerCase(),
    email: userData.email,
    password: userData.password,
    emoji: userData.emoji || '🌸',
    avatarUrl: userData.avatarUrl || null,
    role: 'user',
    createdAt: new Date().toISOString(),
  };

  // Try saving to Supabase
  try {
    await supabase.from('users').insert([newUser]);
  } catch (_) {}

  // Save to local registry and auto-login like Facebook
  try {
    const users = JSON.parse(localStorage.getItem('makewish_all_users') || '[]');
    users.push(newUser);
    localStorage.setItem('makewish_all_users', JSON.stringify(users));
  } catch (_) {}

  localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(newUser));
  return { status: 'success', user: newUser };
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY_AUTH);
}

// ==================== SPACES ====================
export function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function getSpaces(userId) {
  // 1. Try Supabase
  try {
    const { data, error } = await supabase
      .from('spaces')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && !error && data.length > 0) {
      localStorage.setItem(STORAGE_KEY_SPACES, JSON.stringify(data));
      return data;
    }
  } catch (_) {}

  // 2. Fallback to LocalStorage cache
  try {
    const local = localStorage.getItem(STORAGE_KEY_SPACES);
    if (local) return JSON.parse(local);
  } catch (_) {}

  // Initial Demo Space
  const initialSpaces = [
    {
      id: 'space-demo-1',
      name: 'ของขวัญวันสำคัญ 💕',
      type: '1on1',
      emoji: '💕',
      inviteCode: 'LOVE26',
      ownerId: userId || 'admin-system-id',
      memberCount: 2,
      wishCount: 3,
      createdAt: new Date().toISOString(),
    }
  ];
  localStorage.setItem(STORAGE_KEY_SPACES, JSON.stringify(initialSpaces));
  return initialSpaces;
}

export async function createSpace(spaceData, user) {
  const newSpace = {
    id: 'space-' + Date.now(),
    name: spaceData.name,
    type: spaceData.type,
    emoji: spaceData.emoji || '💕',
    inviteCode: generateInviteCode(),
    ownerId: user.id,
    ownerName: user.displayName,
    memberCount: 1,
    wishCount: 0,
    createdAt: new Date().toISOString(),
  };

  try {
    await supabase.from('spaces').insert([newSpace]);
  } catch (_) {}

  // Update local storage
  const spaces = await getSpaces(user.id);
  const updated = [newSpace, ...spaces];
  localStorage.setItem(STORAGE_KEY_SPACES, JSON.stringify(updated));

  return newSpace;
}

export async function joinSpace(code, user) {
  const cleanCode = code.trim().toUpperCase();
  const spaces = await getSpaces(user.id);
  const target = spaces.find(s => s.inviteCode === cleanCode);

  if (!target) {
    return { status: 'error', message: 'ไม่พบห้องที่ตรงกับรหัสเชิญนี้' };
  }

  return { status: 'success', space: target };
}

// ==================== WISHES (Optimistic UI) ====================
export async function getWishes(spaceId) {
  try {
    const { data, error } = await supabase
      .from('wishes')
      .select('*')
      .eq('space_id', spaceId)
      .order('created_at', { ascending: false });

    if (data && !error && data.length > 0) {
      return data;
    }
  } catch (_) {}

  // Local fallback
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY_WISHES) || '{}');
    if (all[spaceId]) return all[spaceId];
  } catch (_) {}

  // Demo wishes
  const defaultWishes = [
    {
      id: 'w-1',
      spaceId,
      title: 'หูฟังไร้สาย AirPods Pro',
      description: 'สีขาว รุ่นตัดเสียงรบกวน',
      category: 'item',
      emoji: '🎧',
      userId: 'admin-system-id',
      userName: 'ผู้ดูแลระบบ',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'w-2',
      spaceId,
      title: 'ชาบูชิ สยามสแควร์',
      description: 'อยากกินบุฟเฟต์วันเสาร์นี้ 😋',
      category: 'food',
      emoji: '🍲',
      userId: 'user-sample',
      userName: 'แฟน',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'w-3',
      spaceId,
      title: 'คาเฟ่ริมทะเล บางแสน',
      description: 'ไปถ่ายรูปช่วงพระอาทิตย์ตกดิน',
      category: 'place',
      emoji: '🏖️',
      userId: 'admin-system-id',
      userName: 'ผู้ดูแลระบบ',
      createdAt: new Date().toISOString(),
    },
  ];

  const all = JSON.parse(localStorage.getItem(STORAGE_KEY_WISHES) || '{}');
  all[spaceId] = defaultWishes;
  localStorage.setItem(STORAGE_KEY_WISHES, JSON.stringify(all));
  return defaultWishes;
}

export async function addWish(spaceId, wishData, user) {
  const newWish = {
    id: 'wish-' + Date.now(),
    spaceId,
    title: wishData.title,
    description: wishData.description || '',
    category: wishData.category || 'item',
    emoji: wishData.emoji || '⭐',
    userId: user.id,
    userName: user.displayName,
    userEmoji: user.emoji || '🌸',
    createdAt: new Date().toISOString(),
  };

  try {
    await supabase.from('wishes').insert([newWish]);
  } catch (_) {}

  // Save to local cache
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY_WISHES) || '{}');
  all[spaceId] = [newWish, ...(all[spaceId] || [])];
  localStorage.setItem(STORAGE_KEY_WISHES, JSON.stringify(all));

  // Update space wish count
  const spaces = JSON.parse(localStorage.getItem(STORAGE_KEY_SPACES) || '[]');
  const updatedSpaces = spaces.map(s => s.id === spaceId ? { ...s, wishCount: (s.wishCount || 0) + 1 } : s);
  localStorage.setItem(STORAGE_KEY_SPACES, JSON.stringify(updatedSpaces));

  return newWish;
}

export async function deleteWish(spaceId, wishId) {
  try {
    await supabase.from('wishes').delete().eq('id', wishId);
  } catch (_) {}

  const all = JSON.parse(localStorage.getItem(STORAGE_KEY_WISHES) || '{}');
  if (all[spaceId]) {
    all[spaceId] = all[spaceId].filter(w => w.id !== wishId);
    localStorage.setItem(STORAGE_KEY_WISHES, JSON.stringify(all));
  }

  const spaces = JSON.parse(localStorage.getItem(STORAGE_KEY_SPACES) || '[]');
  const updatedSpaces = spaces.map(s => s.id === spaceId ? { ...s, wishCount: Math.max(0, (s.wishCount || 1) - 1) } : s);
  localStorage.setItem(STORAGE_KEY_SPACES, JSON.stringify(updatedSpaces));

  return { status: 'success' };
}

// ==================== FRIENDS ====================
export async function getFriends(currentUserId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FRIENDS);
    if (raw) return JSON.parse(raw);
  } catch (_) {}

  const defaultFriends = [
    { id: 'f-1', username: 'mook_ky', displayName: 'น้องมุก 🌸', emoji: '🎀', status: 'accepted' },
    { id: 'f-2', username: 'bank_ton', displayName: 'พี่แบงค์', emoji: '🎸', status: 'accepted' },
  ];
  localStorage.setItem(STORAGE_KEY_FRIENDS, JSON.stringify(defaultFriends));
  return defaultFriends;
}

export async function addFriend(targetUsername) {
  const clean = targetUsername.replace(/^@/, '').toLowerCase();
  const friends = JSON.parse(localStorage.getItem(STORAGE_KEY_FRIENDS) || '[]');
  
  if (friends.some(f => f.username === clean)) {
    return { status: 'error', message: 'ผู้ใช้นี้เป็นเพื่อนอยู่แล้วหรือส่งคำขอแล้ว' };
  }

  const newFriend = {
    id: 'f-' + Date.now(),
    username: clean,
    displayName: clean,
    emoji: '🌸',
    status: 'pending',
  };

  const updated = [newFriend, ...friends];
  localStorage.setItem(STORAGE_KEY_FRIENDS, JSON.stringify(updated));
  return { status: 'success', friend: newFriend };
}

// ==================== ADMIN ====================
export async function getAdminStats() {
  const spaces = JSON.parse(localStorage.getItem(STORAGE_KEY_SPACES) || '[]');
  const users = JSON.parse(localStorage.getItem('makewish_all_users') || '[]');
  const allWishes = JSON.parse(localStorage.getItem(STORAGE_KEY_WISHES) || '{}');
  
  let totalWishes = 0;
  Object.values(allWishes).forEach(arr => { totalWishes += (arr || []).length; });

  return {
    users: users.length + 1, // + admin
    spaces: spaces.length,
    wishes: totalWishes,
  };
}

export async function getAdminUsers() {
  const users = JSON.parse(localStorage.getItem('makewish_all_users') || '[]');
  return [
    {
      id: ADMIN_ACCOUNT.id,
      displayName: ADMIN_ACCOUNT.displayName,
      username: ADMIN_ACCOUNT.username,
      email: ADMIN_ACCOUNT.email,
      role: 'admin',
      emoji: ADMIN_ACCOUNT.emoji,
      createdAt: '2026-01-01',
    },
    ...users,
  ];
}

export async function deleteUserAdmin(userId) {
  const users = JSON.parse(localStorage.getItem('makewish_all_users') || '[]');
  const filtered = users.filter(u => u.id !== userId);
  localStorage.setItem('makewish_all_users', JSON.stringify(filtered));
  return { status: 'success' };
}
