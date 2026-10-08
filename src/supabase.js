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
export const ADMIN_ACCOUNT = {
  id: 'admin-system-id',
  email: 'admin@gmail.com',
  password: '123456',
  displayName: 'ผู้ดูแลระบบ 👑',
  username: 'admin',
  role: 'admin',
  emoji: '👑',
};

// Quick Demo User account for 1-tap testing
export const DEMO_USER_ACCOUNT = {
  id: 'demo-user-id',
  email: 'demo@gmail.com',
  password: '123456',
  displayName: 'น้องมุก 🌸',
  username: 'mook_ky',
  role: 'user',
  emoji: '🎀',
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

  // Check demo user
  if (email === DEMO_USER_ACCOUNT.email && password === DEMO_USER_ACCOUNT.password) {
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(DEMO_USER_ACCOUNT));
    return { status: 'success', user: DEMO_USER_ACCOUNT };
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
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
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

  // Initial Demo Spaces
  const initialSpaces = [
    {
      id: 'space-demo-1',
      name: 'ของขวัญวันสำคัญ 💕',
      type: '1on1',
      emoji: '💕',
      inviteCode: 'LOVE26',
      ownerId: userId || 'admin-system-id',
      ownerName: 'ผู้ดูแลระบบ 👑',
      memberCount: 2,
      members: ['ผู้ดูแลระบบ 👑', 'น้องมุก 🌸'],
      wishCount: 4,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'space-demo-2',
      name: 'ทริปเที่ยว & ปาร์ตี้สิ้นปี ✈️',
      type: 'group',
      emoji: '🏝️',
      inviteCode: 'TRIP26',
      ownerId: userId || 'admin-system-id',
      ownerName: 'ผู้ดูแลระบบ 👑',
      memberCount: 4,
      members: ['ผู้ดูแลระบบ 👑', 'น้องมุก 🌸', 'พี่แบงค์ 🎸', 'แป้ง 🐱'],
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
    type: spaceData.type || '1on1',
    emoji: spaceData.emoji || (spaceData.type === 'group' ? '🎉' : '💕'),
    inviteCode: generateInviteCode(),
    ownerId: user.id,
    ownerName: user.displayName,
    memberCount: 1,
    members: [user.displayName],
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

  // Add user to members list if not already
  const members = target.members || [target.ownerName || 'สมาชิก'];
  if (!members.includes(user.displayName)) {
    target.members = [...members, user.displayName];
    target.memberCount = target.members.length;
    const updated = spaces.map(s => s.id === target.id ? target : s);
    localStorage.setItem(STORAGE_KEY_SPACES, JSON.stringify(updated));
  }

  return { status: 'success', space: target };
}

export async function deleteSpace(spaceId) {
  try {
    await supabase.from('spaces').delete().eq('id', spaceId);
  } catch (_) {}

  const spaces = JSON.parse(localStorage.getItem(STORAGE_KEY_SPACES) || '[]');
  const updated = spaces.filter(s => s.id !== spaceId);
  localStorage.setItem(STORAGE_KEY_SPACES, JSON.stringify(updated));

  const allWishes = JSON.parse(localStorage.getItem(STORAGE_KEY_WISHES) || '{}');
  delete allWishes[spaceId];
  localStorage.setItem(STORAGE_KEY_WISHES, JSON.stringify(allWishes));

  return { status: 'success' };
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
      title: 'หูฟังไร้สาย AirPods Pro 2',
      description: 'สีขาว รุ่นตัดเสียงรบกวน เคสชาร์จ USB-C',
      category: 'item',
      price: '8,990',
      linkUrl: 'https://apple.com/th/airpods-pro',
      emoji: '🎧',
      isFulfilled: true,
      fulfilledBy: 'ผู้ดูแลระบบ 👑',
      fulfilledAt: '2026-10-01',
      userId: 'admin-system-id',
      userName: 'ผู้ดูแลระบบ 👑',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'w-2',
      spaceId,
      title: 'ชาบูชิ หรือ โมโม่ พาราไดซ์',
      description: 'อยากกินบุฟเฟต์เนื้อวันเสาร์นี้ 😋 ชวนทุกคน!',
      category: 'food',
      price: '659',
      linkUrl: '',
      emoji: '🍲',
      isFulfilled: false,
      userId: 'demo-user-id',
      userName: 'น้องมุก 🌸',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'w-3',
      spaceId,
      title: 'คาเฟ่ริมทะเล บางแสน / พัทยา',
      description: 'ไปถ่ายรูปช่วงพระอาทิตย์ตกดิน เสาร์-อาทิตย์นี้',
      category: 'place',
      price: '1,200',
      linkUrl: '',
      emoji: '🏖️',
      isFulfilled: false,
      userId: 'admin-system-id',
      userName: 'ผู้ดูแลระบบ 👑',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'w-4',
      spaceId,
      title: 'โคมไฟพระจันทร์ดวงกลม 3D',
      description: 'โคมไฟตั้งโต๊ะแสงวอร์มไวท์ ปรับแสงได้ 3 ระดับ',
      category: 'item',
      price: '450',
      linkUrl: '',
      emoji: '🌙',
      isFulfilled: false,
      userId: 'demo-user-id',
      userName: 'น้องมุก 🌸',
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
    title: wishData.title.trim(),
    description: wishData.description ? wishData.description.trim() : '',
    category: wishData.category || 'item',
    price: wishData.price ? wishData.price.trim() : '',
    linkUrl: wishData.linkUrl ? wishData.linkUrl.trim() : '',
    emoji: wishData.emoji || (wishData.category === 'food' ? '🍜' : wishData.category === 'place' ? '📍' : '🎁'),
    isFulfilled: false,
    fulfilledBy: null,
    fulfilledAt: null,
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

export async function toggleWishFulfilled(spaceId, wishId, currentUser) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY_WISHES) || '{}');
  let toggled = null;

  if (all[spaceId]) {
    all[spaceId] = all[spaceId].map(w => {
      if (w.id === wishId) {
        const nextFulfilled = !w.isFulfilled;
        toggled = {
          ...w,
          isFulfilled: nextFulfilled,
          fulfilledBy: nextFulfilled ? currentUser.displayName : null,
          fulfilledAt: nextFulfilled ? new Date().toISOString() : null,
        };
        return toggled;
      }
      return w;
    });
    localStorage.setItem(STORAGE_KEY_WISHES, JSON.stringify(all));
  }

  try {
    if (toggled) {
      await supabase.from('wishes').update({
        is_fulfilled: toggled.isFulfilled,
        fulfilled_by: toggled.fulfilledBy,
        fulfilled_at: toggled.fulfilledAt,
      }).eq('id', wishId);
    }
  } catch (_) {}

  return toggled;
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
    { id: 'f-3', username: 'pang_cute', displayName: 'แป้ง 🐱', emoji: '🐾', status: 'pending' },
  ];
  localStorage.setItem(STORAGE_KEY_FRIENDS, JSON.stringify(defaultFriends));
  return defaultFriends;
}

export async function addFriend(targetUsername) {
  const clean = targetUsername.replace(/^@/, '').toLowerCase().trim();
  if (!clean) return { status: 'error', message: 'กรุณากรอกชื่อผู้ใช้' };

  const friends = JSON.parse(localStorage.getItem(STORAGE_KEY_FRIENDS) || '[]');
  if (friends.some(f => f.username === clean)) {
    return { status: 'error', message: 'ผู้ใช้นี้เป็นเพื่อนอยู่แล้วหรือส่งคำขอไปแล้ว' };
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

export async function acceptFriend(friendId) {
  const friends = JSON.parse(localStorage.getItem(STORAGE_KEY_FRIENDS) || '[]');
  const updated = friends.map(f => f.id === friendId ? { ...f, status: 'accepted' } : f);
  localStorage.setItem(STORAGE_KEY_FRIENDS, JSON.stringify(updated));
  return { status: 'success' };
}

export async function deleteFriend(friendId) {
  const friends = JSON.parse(localStorage.getItem(STORAGE_KEY_FRIENDS) || '[]');
  const updated = friends.filter(f => f.id !== friendId);
  localStorage.setItem(STORAGE_KEY_FRIENDS, JSON.stringify(updated));
  return { status: 'success' };
}

// ==================== ADMIN ====================
export async function getAdminStats() {
  const spaces = JSON.parse(localStorage.getItem(STORAGE_KEY_SPACES) || '[]');
  const users = JSON.parse(localStorage.getItem('makewish_all_users') || '[]');
  const allWishes = JSON.parse(localStorage.getItem(STORAGE_KEY_WISHES) || '{}');
  
  let totalWishes = 0;
  let fulfilledWishes = 0;
  Object.values(allWishes).forEach(arr => {
    (arr || []).forEach(w => {
      totalWishes++;
      if (w.isFulfilled) fulfilledWishes++;
    });
  });

  return {
    users: users.length + 2, // admin + demo
    spaces: spaces.length,
    wishes: totalWishes,
    fulfilledWishes,
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
    {
      id: DEMO_USER_ACCOUNT.id,
      displayName: DEMO_USER_ACCOUNT.displayName,
      username: DEMO_USER_ACCOUNT.username,
      email: DEMO_USER_ACCOUNT.email,
      role: 'user',
      emoji: DEMO_USER_ACCOUNT.emoji,
      createdAt: '2026-02-14',
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

// ==================== NEW FUNCTIONS ====================

export async function editWish(spaceId, wishId, updates) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY_WISHES) || '{}');
  let updatedWish = null;

  if (all[spaceId]) {
    all[spaceId] = all[spaceId].map(w => {
      if (w.id === wishId) {
        updatedWish = { ...w, ...updates };
        return updatedWish;
      }
      return w;
    });
    localStorage.setItem(STORAGE_KEY_WISHES, JSON.stringify(all));
  }

  try {
    if (updatedWish) {
      const dbUpdates = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.linkUrl !== undefined) dbUpdates.link_url = updates.linkUrl;
      if (updates.emoji !== undefined) dbUpdates.emoji = updates.emoji;
      
      if (Object.keys(dbUpdates).length > 0) {
        await supabase.from('wishes').update(dbUpdates).eq('id', wishId);
      }
    }
  } catch (_) {}

  return updatedWish;
}

export async function getSpaceEvents(spaceId) {
  try {
    const { data, error } = await supabase
      .from('space_events')
      .select('*')
      .eq('space_id', spaceId)
      .order('event_date', { ascending: true });

    if (data && !error && data.length > 0) {
      return data;
    }
  } catch (_) {}

  try {
    const all = JSON.parse(localStorage.getItem('makewish_space_events') || '{}');
    if (all[spaceId]) return all[spaceId];
  } catch (_) {}

  let defaultEvents = [];
  if (spaceId === 'space-demo-1') {
    defaultEvents = [{ id: 'evt-1', spaceId, title: 'วันครบรอบ 1 ปี 💕', emoji: '💕', date: '2026-12-25', createdAt: new Date().toISOString() }];
  } else if (spaceId === 'space-demo-2') {
    defaultEvents = [{ id: 'evt-2', spaceId, title: 'ปาร์ตี้ปีใหม่ 2027 🎉', emoji: '🎉', date: '2027-01-01', createdAt: new Date().toISOString() }];
  }

  const all = JSON.parse(localStorage.getItem('makewish_space_events') || '{}');
  all[spaceId] = defaultEvents;
  localStorage.setItem('makewish_space_events', JSON.stringify(all));
  
  return defaultEvents;
}

export async function addSpaceEvent(spaceId, eventData) {
  const newEvent = {
    id: 'evt-' + Date.now(),
    spaceId,
    title: eventData.title,
    emoji: eventData.emoji,
    date: eventData.date,
    createdAt: new Date().toISOString(),
  };

  try {
    await supabase.from('space_events').insert([{
      id: newEvent.id,
      space_id: newEvent.spaceId,
      title: newEvent.title,
      emoji: newEvent.emoji,
      event_date: newEvent.date,
      created_at: newEvent.createdAt
    }]);
  } catch (_) {}

  const all = JSON.parse(localStorage.getItem('makewish_space_events') || '{}');
  all[spaceId] = [...(all[spaceId] || []), newEvent];
  localStorage.setItem('makewish_space_events', JSON.stringify(all));

  return newEvent;
}

export async function deleteSpaceEvent(spaceId, eventId) {
  try {
    await supabase.from('space_events').delete().eq('id', eventId);
  } catch (_) {}

  const all = JSON.parse(localStorage.getItem('makewish_space_events') || '{}');
  if (all[spaceId]) {
    all[spaceId] = all[spaceId].filter(e => e.id !== eventId);
    localStorage.setItem('makewish_space_events', JSON.stringify(all));
  }

  return { status: 'success' };
}

export async function inviteFriendToSpace(spaceId, friendDisplayName) {
  const spaces = JSON.parse(localStorage.getItem(STORAGE_KEY_SPACES) || '[]');
  const target = spaces.find(s => s.id === spaceId);

  if (!target) {
    return { status: 'error', message: 'ไม่พบห้องที่ต้องการเชิญ' };
  }

  const members = target.members || [];
  if (!members.includes(friendDisplayName)) {
    target.members = [...members, friendDisplayName];
    target.memberCount = target.members.length;
    const updated = spaces.map(s => s.id === spaceId ? target : s);
    localStorage.setItem(STORAGE_KEY_SPACES, JSON.stringify(updated));
    return { status: 'success' };
  }

  return { status: 'error', message: 'มีเพื่อนคนนี้ในห้องแล้ว' };
}

export function subscribeToWishes(spaceId, onWishChange) {
  const channel = supabase.channel(`wishes-${spaceId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'wishes', filter: `space_id=eq.${spaceId}` }, payload => {
      onWishChange();
    })
    .subscribe();
    
  return channel;
}

export function unsubscribeAll() {
  supabase.removeAllChannels();
}
