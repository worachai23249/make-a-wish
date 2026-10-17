import { createClient } from '@supabase/supabase-js';

// Supabase Configuration matching church_accounting
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://trrcywwzljjtpzynejrk.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_0loAO_PKoZ0u1tvMMEmdHA_3oST-XxR';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==================== DATA MAPPING UTILITIES (camelCase <-> snake_case) ====================
const CAMEL_TO_SNAKE_MAP = {
  spaceId: 'space_id',
  inviteCode: 'invite_code',
  ownerId: 'owner_id',
  ownerName: 'owner_name',
  memberCount: 'member_count',
  wishCount: 'wish_count',
  createdAt: 'created_at',
  imageUrl: 'image_url',
  isFulfilled: 'is_fulfilled',
  fulfilledBy: 'fulfilled_by',
  fulfilledAt: 'fulfilled_at',
  linkUrl: 'link_url',
  userId: 'user_id',
  userName: 'user_name',
  userEmoji: 'user_emoji',
  displayName: 'display_name',
  avatarUrl: 'avatar_url',
  eventDate: 'event_date',
  date: 'event_date',
  senderId: 'sender_id',
  receiverId: 'receiver_id',
  joinedAt: 'joined_at',
  senderUsername: 'sender_username',
  senderDisplayName: 'sender_display_name',
  senderEmoji: 'sender_emoji',
  senderAvatarUrl: 'sender_avatar_url',
  receiverUsername: 'receiver_username',
  receiverDisplayName: 'receiver_display_name',
  receiverEmoji: 'receiver_emoji',
  receiverAvatarUrl: 'receiver_avatar_url',
  claimedBy: 'claimed_by',
  claimedByName: 'claimed_by_name',
  claimedAt: 'claimed_at',
  memberIds: 'member_ids',
  isRead: 'is_read',
  relatedId: 'related_id',
};

const SNAKE_TO_CAMEL_MAP = {
  space_id: 'spaceId',
  invite_code: 'inviteCode',
  owner_id: 'ownerId',
  owner_name: 'ownerName',
  member_count: 'memberCount',
  wish_count: 'wishCount',
  created_at: 'createdAt',
  image_url: 'imageUrl',
  is_fulfilled: 'isFulfilled',
  fulfilled_by: 'fulfilledBy',
  fulfilled_at: 'fulfilledAt',
  link_url: 'linkUrl',
  user_id: 'userId',
  user_name: 'userName',
  user_emoji: 'userEmoji',
  display_name: 'displayName',
  avatar_url: 'avatarUrl',
  event_date: 'eventDate',
  sender_id: 'senderId',
  receiver_id: 'receiverId',
  joined_at: 'joinedAt',
  sender_username: 'senderUsername',
  sender_display_name: 'senderDisplayName',
  sender_emoji: 'senderEmoji',
  sender_avatar_url: 'senderAvatarUrl',
  receiver_username: 'receiverUsername',
  receiver_display_name: 'receiverDisplayName',
  receiver_emoji: 'receiverEmoji',
  receiver_avatar_url: 'receiverAvatarUrl',
  claimed_by: 'claimedBy',
  claimed_by_name: 'claimedByName',
  claimed_at: 'claimedAt',
  member_ids: 'memberIds',
  is_read: 'isRead',
  related_id: 'relatedId',
};

/**
 * Converts a JS object with camelCase keys to snake_case for Supabase inserts/updates.
 */
export function toSnakeCase(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = CAMEL_TO_SNAKE_MAP[key] || key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result;
}

/**
 * Converts a Supabase row with snake_case keys to camelCase for React state.
 */
export function toCamelCase(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = SNAKE_TO_CAMEL_MAP[key] || key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = value;
    if (key === 'event_date') {
      result.date = value;
    }
  }
  return result;
}

// ==================== LOCAL STORAGE PERSISTENCE (Like Facebook) ====================
const STORAGE_KEY_AUTH = 'makewish_auth_user';
const STORAGE_KEY_SPACES = 'makewish_local_spaces';
const STORAGE_KEY_WISHES = 'makewish_local_wishes';
const STORAGE_KEY_FRIENDS = 'makewish_local_friends';
const STORAGE_KEY_FRIENDSHIPS = 'makewish_local_friendships';

// One-time factory reset to wipe all accounts, dummy spaces, and dummy friends as requested by user
if (typeof window !== 'undefined' && !localStorage.getItem('makewish_clean_reset_v4')) {
  localStorage.removeItem('makewish_all_users');
  localStorage.removeItem(STORAGE_KEY_AUTH);
  localStorage.removeItem(STORAGE_KEY_SPACES);
  localStorage.removeItem(STORAGE_KEY_WISHES);
  localStorage.removeItem(STORAGE_KEY_FRIENDS);
  localStorage.removeItem(STORAGE_KEY_FRIENDSHIPS);
  localStorage.removeItem('makewish_space_events');
  localStorage.setItem('makewish_clean_reset_v4', 'true');
}

// Function to clear all accounts and data on demand
export async function clearAllAccounts() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('makewish_all_users');
    localStorage.removeItem(STORAGE_KEY_AUTH);
    localStorage.removeItem(STORAGE_KEY_SPACES);
    localStorage.removeItem(STORAGE_KEY_WISHES);
    localStorage.removeItem(STORAGE_KEY_FRIENDS);
    localStorage.removeItem(STORAGE_KEY_FRIENDSHIPS);
    localStorage.removeItem('makewish_space_events');
  }

  try {
    await supabase.from('users').delete().neq('id', 'keep-none');
    await supabase.from('spaces').delete().neq('id', 'keep-none');
    await supabase.from('wishes').delete().neq('id', 'keep-none');
    await supabase.from('friendships').delete().neq('id', 'keep-none');
    await supabase.from('space_events').delete().neq('id', 'keep-none');
  } catch (_) {}

  return { status: 'success' };
}

// Default initial admin account definition for fallback
export const ADMIN_ACCOUNT = {
  id: 'admin-system-id',
  email: 'admin@gmail.com',
  password: '123456',
  displayName: 'ผู้ดูแลระบบ 👑',
  username: 'admin',
  role: 'admin',
  emoji: '👑',
};

// ==================== PASSWORD HASHING (SHA-256 + Salt) ====================
export async function hashPassword(password) {
  if (!password) return '';
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode('makewish_salt_2026_' + password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (_) {
    return password;
  }
}

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
  const cleanEmail = (email || '').trim().toLowerCase();
  const hashed = await hashPassword(password);

  // Try Supabase Auth or users table
  try {
    let { data } = await supabase
      .from('users')
      .select('*')
      .eq('email', cleanEmail)
      .eq('password', hashed)
      .maybeSingle();

    if (!data) {
      // Backward compatibility for existing plaintext passwords
      const rawRes = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanEmail)
        .eq('password', password)
        .maybeSingle();
      data = rawRes.data;
      if (data) {
        // Upgrade password to hashed version
        supabase.from('users').update({ password: hashed }).eq('id', data.id).then(() => {});
      }
    }

    if (data) {
      const camelUser = toCamelCase(data);
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(camelUser));
      return { status: 'success', user: camelUser };
    }
  } catch (_) {}

  // Fallback to local stored registered users
  try {
    const users = JSON.parse(localStorage.getItem('makewish_all_users') || '[]');
    const match = users.find(u => (u.email || '').toLowerCase() === cleanEmail && (u.password === hashed || u.password === password));
    if (match) {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(match));
      return { status: 'success', user: match };
    }
  } catch (_) {}

  // Check system admin fallback if typed specifically
  if (cleanEmail === ADMIN_ACCOUNT.email && password === ADMIN_ACCOUNT.password) {
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(ADMIN_ACCOUNT));
    return { status: 'success', user: ADMIN_ACCOUNT };
  }

  return { status: 'error', message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
}

export async function register(userData) {
  const cleanUsername = userData.username.replace(/^@/, '').toLowerCase().trim();
  const cleanEmail = userData.email.trim().toLowerCase();

  const users = JSON.parse(localStorage.getItem('makewish_all_users') || '[]');
  
  // Check if email or username already taken
  if (users.some(u => (u.email || '').toLowerCase() === cleanEmail)) {
    return { status: 'error', message: 'อีเมลนี้ถูกใช้งานไปแล้ว' };
  }
  if (users.some(u => (u.username || '').toLowerCase() === cleanUsername)) {
    return { status: 'error', message: `ชื่อผู้ใช้ @${cleanUsername} ถูกใช้งานไปแล้ว` };
  }

  // The first user registered in the system or email admin@... gets role: 'admin'
  const isFirstUser = users.length === 0;
  const role = (isFirstUser || cleanEmail === 'admin@gmail.com') ? 'admin' : 'user';
  const hashedPassword = await hashPassword(userData.password);

  const newUser = {
    id: 'user-' + Date.now(),
    displayName: userData.displayName.trim(),
    username: cleanUsername,
    email: cleanEmail,
    password: hashedPassword,
    emoji: userData.emoji || '🌸',
    avatarUrl: userData.avatarUrl || null,
    role,
    createdAt: new Date().toISOString(),
  };

  // Try saving to Supabase
  try {
    await supabase.from('users').insert([toSnakeCase(newUser)]);
  } catch (_) {}

  users.push(newUser);
  localStorage.setItem('makewish_all_users', JSON.stringify(users));
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
  if (!userId) return [];
  const current = getCurrentUser();

  const userBelongsToSpace = (s) => {
    if (s.ownerId === userId) return true;
    if (Array.isArray(s.memberIds) && s.memberIds.includes(userId)) return true;
    if (Array.isArray(s.members)) {
      if (s.members.includes(userId)) return true;
      if (current && s.members.includes(current.displayName)) return true;
    }
    return false;
  };

  // 1. Try Supabase
  try {
    const { data, error } = await supabase
      .from('spaces')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && !error && data.length > 0) {
      const camelData = data.map(toCamelCase);
      localStorage.setItem(STORAGE_KEY_SPACES, JSON.stringify(camelData));
      return camelData.filter(userBelongsToSpace);
    }
  } catch (_) {}

  // 2. Fallback to LocalStorage cache
  try {
    const local = localStorage.getItem(STORAGE_KEY_SPACES);
    if (local) {
      const allSpaces = JSON.parse(local);
      return allSpaces.filter(userBelongsToSpace);
    }
  } catch (_) {}

  // Absolutely NO default spaces! A new account starts with 0 spaces!
  return [];
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
    memberIds: [user.id],
    wishCount: 0,
    createdAt: new Date().toISOString(),
  };

  try {
    await supabase.from('spaces').insert([toSnakeCase(newSpace)]);
    await supabase.from('space_members').upsert([{
      id: `sm-${newSpace.id}-${user.id}`,
      space_id: newSpace.id,
      user_id: user.id,
    }]);
  } catch (_) {}

  // Update local storage
  const spaces = await getSpaces(user.id);
  const updated = [newSpace, ...spaces.filter(s => s.id !== newSpace.id)];
  localStorage.setItem(STORAGE_KEY_SPACES, JSON.stringify(updated));

  return newSpace;
}

export async function joinSpace(code, user) {
  const cleanCode = (code || '').trim().toUpperCase();
  if (!cleanCode) {
    return { status: 'error', message: 'กรุณากรอกรหัสเชิญ' };
  }

  let target = null;

  // 1. First, search Supabase spaces table directly by invite_code!
  try {
    const { data, error } = await supabase
      .from('spaces')
      .select('*')
      .eq('invite_code', cleanCode)
      .maybeSingle();

    if (data && !error) {
      target = toCamelCase(data);
    }
  } catch (_) {}

  // 2. Fallback: search ALL spaces in localStorage
  if (!target) {
    try {
      const allSpaces = JSON.parse(localStorage.getItem(STORAGE_KEY_SPACES) || '[]');
      const found = allSpaces.find(s => (s.inviteCode || '').toUpperCase() === cleanCode);
      if (found) target = found;
    } catch (_) {}
  }

  if (!target) {
    return { status: 'error', message: 'ไม่พบห้องที่ตรงกับรหัสเชิญนี้' };
  }

  // Ensure members & memberIds arrays
  const members = Array.isArray(target.members) ? [...target.members] : [target.ownerName || 'สมาชิก'];
  const memberIds = Array.isArray(target.memberIds) ? [...target.memberIds] : (target.ownerId ? [target.ownerId] : []);

  if (!members.includes(user.displayName)) {
    members.push(user.displayName);
  }
  if (!memberIds.includes(user.id)) {
    memberIds.push(user.id);
  }

  target.members = members;
  target.memberIds = memberIds;
  target.memberCount = members.length;

  // Sync to Supabase
  try {
    await supabase.from('spaces').update(toSnakeCase({
      members: target.members,
      memberIds: target.memberIds,
      memberCount: target.memberCount,
    })).eq('id', target.id);

    await supabase.from('space_members').upsert([{
      id: `sm-${target.id}-${user.id}`,
      space_id: target.id,
      user_id: user.id,
    }], { onConflict: 'space_id,user_id' });
  } catch (_) {}

  // Update local storage
  try {
    const allSpaces = JSON.parse(localStorage.getItem(STORAGE_KEY_SPACES) || '[]');
    const existingIdx = allSpaces.findIndex(s => s.id === target.id);
    if (existingIdx >= 0) {
      allSpaces[existingIdx] = target;
    } else {
      allSpaces.unshift(target);
    }
    localStorage.setItem(STORAGE_KEY_SPACES, JSON.stringify(allSpaces));
  } catch (_) {}

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

export async function leaveSpace(spaceId, user) {
  const spaces = JSON.parse(localStorage.getItem(STORAGE_KEY_SPACES) || '[]');
  const target = spaces.find(s => s.id === spaceId);

  if (target) {
    target.members = (target.members || []).filter(m => m !== user.displayName);
    target.memberCount = target.members.length;
  }

  // Remove this space from user's list
  const updated = spaces.filter(s => s.id !== spaceId);
  localStorage.setItem(STORAGE_KEY_SPACES, JSON.stringify(updated));

  // Try removing from Supabase space_members
  try {
    await supabase.from('space_members').delete()
      .eq('space_id', spaceId)
      .eq('user_id', user.id);
  } catch (_) {}

  return { status: 'success' };
}

export async function editSpace(spaceId, updates) {
  const spaces = JSON.parse(localStorage.getItem(STORAGE_KEY_SPACES) || '[]');
  let updatedSpace = null;
  const updated = spaces.map(s => {
    if (s.id === spaceId) {
      updatedSpace = { ...s, ...updates };
      return updatedSpace;
    }
    return s;
  });
  localStorage.setItem(STORAGE_KEY_SPACES, JSON.stringify(updated));

  try {
    if (updatedSpace) {
      const dbUpdates = toSnakeCase(updates);
      await supabase.from('spaces').update(dbUpdates).eq('id', spaceId);
    }
  } catch (_) {}

  return updatedSpace;
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
      const camelData = data.map(toCamelCase);
      try {
        const all = JSON.parse(localStorage.getItem(STORAGE_KEY_WISHES) || '{}');
        all[spaceId] = camelData;
        localStorage.setItem(STORAGE_KEY_WISHES, JSON.stringify(all));
      } catch (_) {}
      return camelData;
    }
  } catch (_) {}

  // Local fallback
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY_WISHES) || '{}');
    if (all[spaceId]) return all[spaceId];
  } catch (_) {}

  // Return empty array for newly created spaces
  return [];
}

export async function addWish(spaceId, wishData, user) {
  const newWish = {
    id: 'wish-' + Date.now(),
    spaceId,
    title: wishData.title.trim(),
    description: wishData.description ? wishData.description.trim() : '',
    category: wishData.category || 'item',
    priority: wishData.priority || 'high',
    price: wishData.price ? wishData.price.trim() : '',
    linkUrl: wishData.linkUrl ? wishData.linkUrl.trim() : '',
    imageUrl: wishData.imageUrl || null,
    emoji: wishData.emoji || (wishData.category === 'food' ? '🍜' : wishData.category === 'place' ? '📍' : '🎁'),
    notes: [],
    isFulfilled: false,
    fulfilledBy: null,
    fulfilledAt: null,
    claimedBy: null,
    claimedByName: null,
    claimedAt: null,
    reactions: {},
    userId: user.id,
    userName: user.displayName,
    userEmoji: user.emoji || '🌸',
    createdAt: new Date().toISOString(),
  };

  try {
    await supabase.from('wishes').insert([toSnakeCase(newWish)]);
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
      await supabase.from('wishes').update(toSnakeCase({
        isFulfilled: toggled.isFulfilled,
        fulfilledBy: toggled.fulfilledBy,
        fulfilledAt: toggled.fulfilledAt,
      })).eq('id', wishId);
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

// ==================== FRIENDS (Facebook-Style Friend Request System) ====================

export async function getFriendships(userId) {
  if (!userId) return { friends: [], incomingRequests: [], outgoingRequests: [] };

  let allFriendships = [];

  // Try Supabase first
  try {
    const { data, error } = await supabase
      .from('friendships')
      .select('*');
    if (data && !error && data.length > 0) {
      allFriendships = data.map(toCamelCase);
      localStorage.setItem(STORAGE_KEY_FRIENDSHIPS, JSON.stringify(allFriendships));
    }
  } catch (_) {}

  if (allFriendships.length === 0) {
    try {
      allFriendships = JSON.parse(localStorage.getItem(STORAGE_KEY_FRIENDSHIPS) || '[]');
    } catch (_) {}
  }

  // Filter for this user
  const relevant = allFriendships.filter(f => f.senderId === userId || f.receiverId === userId);

  // 1. Accepted friends
  const friends = relevant
    .filter(f => f.status === 'accepted')
    .map(f => {
      const isSender = f.senderId === userId;
      return {
        friendshipId: f.id,
        id: isSender ? f.receiverId : f.senderId,
        username: isSender ? f.receiverUsername : f.senderUsername,
        displayName: isSender ? f.receiverDisplayName : f.senderDisplayName,
        emoji: (isSender ? f.receiverEmoji : f.senderEmoji) || '🌸',
        avatarUrl: isSender ? f.receiverAvatarUrl : f.senderAvatarUrl,
        status: 'accepted',
        createdAt: f.createdAt,
      };
    });

  // 2. Incoming friend requests (Sent TO userId -> waiting for userId to accept)
  const incomingRequests = relevant
    .filter(f => f.receiverId === userId && f.status === 'pending')
    .map(f => ({
      friendshipId: f.id,
      id: f.senderId,
      username: f.senderUsername,
      displayName: f.senderDisplayName,
      emoji: f.senderEmoji || '🌸',
      avatarUrl: f.senderAvatarUrl,
      createdAt: f.createdAt,
    }));

  // 3. Outgoing friend requests (Sent BY userId -> waiting for other person to accept)
  const outgoingRequests = relevant
    .filter(f => f.senderId === userId && f.status === 'pending')
    .map(f => ({
      friendshipId: f.id,
      id: f.receiverId,
      username: f.receiverUsername,
      displayName: f.receiverDisplayName,
      emoji: f.receiverEmoji || '🌸',
      avatarUrl: f.receiverAvatarUrl,
      createdAt: f.createdAt,
    }));

  return { friends, incomingRequests, outgoingRequests };
}

// Backward-compatible alias for places expecting array of accepted friends
export async function getFriends(currentUserId) {
  const res = await getFriendships(currentUserId);
  return res.friends;
}

export async function sendFriendRequest(targetUsername, currentUser) {
  if (!currentUser) return { status: 'error', message: 'กรุณาเข้าสู่ระบบก่อน' };
  const clean = targetUsername.replace(/^@/, '').toLowerCase().trim();
  if (!clean) return { status: 'error', message: 'กรุณากรอกชื่อผู้ใช้ (@username)' };

  if (clean === (currentUser.username || '').toLowerCase()) {
    return { status: 'error', message: 'คุณไม่สามารถเพิ่มตัวเองเป็นเพื่อนได้' };
  }

  // Find target user from registered users
  let targetUser = null;

  try {
    const { data } = await supabase.from('users').select('*').eq('username', clean).single();
    if (data) {
      targetUser = toCamelCase(data);
    }
  } catch (_) {}

  if (!targetUser) {
    const allUsers = JSON.parse(localStorage.getItem('makewish_all_users') || '[]');
    targetUser = allUsers.find(u => (u.username || '').toLowerCase() === clean);
  }

  if (!targetUser && clean === ADMIN_ACCOUNT.username.toLowerCase()) {
    targetUser = ADMIN_ACCOUNT;
  }

  if (!targetUser) {
    return { status: 'error', message: `ไม่พบผู้ใช้ @${clean} ในระบบ` };
  }

  // Check existing friendships
  const allFriendships = JSON.parse(localStorage.getItem(STORAGE_KEY_FRIENDSHIPS) || '[]');
  const existing = allFriendships.find(f => 
    (f.senderId === currentUser.id && f.receiverId === targetUser.id) ||
    (f.senderId === targetUser.id && f.receiverId === currentUser.id)
  );

  if (existing) {
    if (existing.status === 'accepted') {
      return { status: 'error', message: `คุณและ @${clean} เป็นเพื่อนกันอยู่แล้ว ✦` };
    }
    if (existing.status === 'pending') {
      if (existing.senderId === currentUser.id) {
        return { status: 'error', message: `คุณได้ส่งคำขอเป็นเพื่อนไปยัง @${clean} แล้ว กรุณารอการตอบรับ` };
      }
      // Target user already sent request to current user: auto-accept!
      existing.status = 'accepted';
      localStorage.setItem(STORAGE_KEY_FRIENDSHIPS, JSON.stringify(allFriendships));
      try {
        await supabase.from('friendships').update({ status: 'accepted' }).eq('id', existing.id);
      } catch (_) {}
      return { status: 'success', message: `@${clean} เคยส่งคำขอหาคุณแล้ว ระบบเชื่อมต่อเป็นเพื่อนกันทันที ✨` };
    }
  }

  // Create new pending friendship
  const newFriendship = {
    id: 'fr-' + Date.now(),
    senderId: currentUser.id,
    senderUsername: currentUser.username,
    senderDisplayName: currentUser.displayName,
    senderEmoji: currentUser.emoji || '🌸',
    senderAvatarUrl: currentUser.avatarUrl || null,
    receiverId: targetUser.id,
    receiverUsername: targetUser.username,
    receiverDisplayName: targetUser.displayName,
    receiverEmoji: targetUser.emoji || '🌸',
    receiverAvatarUrl: targetUser.avatarUrl || null,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const updated = [newFriendship, ...allFriendships];
  localStorage.setItem(STORAGE_KEY_FRIENDSHIPS, JSON.stringify(updated));

  try {
    await supabase.from('friendships').insert([toSnakeCase(newFriendship)]);
  } catch (_) {}

  return { status: 'success', message: `ส่งคำขอเป็นเพื่อนไปยัง @${clean} สำเร็จ 💌 รออีกฝ่ายตอบรับ` };
}

// Backward-compatible alias
export const addFriend = (targetUsername, currentUser) => sendFriendRequest(targetUsername, currentUser);

export async function acceptFriendRequest(friendshipId) {
  const allFriendships = JSON.parse(localStorage.getItem(STORAGE_KEY_FRIENDSHIPS) || '[]');
  const updated = allFriendships.map(f => f.id === friendshipId ? { ...f, status: 'accepted' } : f);
  localStorage.setItem(STORAGE_KEY_FRIENDSHIPS, JSON.stringify(updated));

  try {
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId);
  } catch (_) {}

  return { status: 'success' };
}

export const acceptFriend = (friendshipId) => acceptFriendRequest(friendshipId);

export async function removeFriendship(friendshipId) {
  const allFriendships = JSON.parse(localStorage.getItem(STORAGE_KEY_FRIENDSHIPS) || '[]');
  const updated = allFriendships.filter(f => f.id !== friendshipId);
  localStorage.setItem(STORAGE_KEY_FRIENDSHIPS, JSON.stringify(updated));

  try {
    await supabase.from('friendships').delete().eq('id', friendshipId);
  } catch (_) {}

  return { status: 'success' };
}

export const deleteFriend = (friendshipId) => removeFriendship(friendshipId);
export const declineFriend = (friendshipId) => removeFriendship(friendshipId);
export const cancelFriendRequest = (friendshipId) => removeFriendship(friendshipId);

// ==================== ADMIN ====================
export async function getAdminStats() {
  try {
    const [usersRes, spacesRes, wishesRes] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('spaces').select('id', { count: 'exact', head: true }),
      supabase.from('wishes').select('id, is_fulfilled'),
    ]);

    const usersCount = typeof usersRes.count === 'number' ? usersRes.count : null;
    const spacesCount = typeof spacesRes.count === 'number' ? spacesRes.count : null;

    if (usersCount !== null && spacesCount !== null && wishesRes.data) {
      const totalWishes = wishesRes.data.length;
      const fulfilledWishes = wishesRes.data.filter(w => w.is_fulfilled).length;
      return {
        users: usersCount,
        spaces: spacesCount,
        wishes: totalWishes,
        fulfilledWishes,
      };
    }
  } catch (_) {}

  // Local fallback
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
    users: users.length,
    spaces: spaces.length,
    wishes: totalWishes,
    fulfilledWishes,
  };
}

export async function getAdminUsers() {
  try {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (data && !error && data.length > 0) {
      const camelData = data.map(toCamelCase);
      localStorage.setItem('makewish_all_users', JSON.stringify(camelData));
      return camelData;
    }
  } catch (_) {}

  const users = JSON.parse(localStorage.getItem('makewish_all_users') || '[]');
  return users;
}

export async function deleteUserAdmin(userId) {
  try {
    await supabase.from('users').delete().eq('id', userId);
  } catch (_) {}

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
      const dbUpdates = toSnakeCase(updates);
      if (Object.keys(dbUpdates).length > 0) {
        await supabase.from('wishes').update(dbUpdates).eq('id', wishId);
      }
    }
  } catch (_) {}

  return updatedWish;
}

export async function addWishNote(spaceId, wishId, noteText, user) {
  if (!noteText || !noteText.trim()) return null;
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY_WISHES) || '{}');
  const newNote = {
    id: 'note-' + Date.now(),
    text: noteText.trim(),
    authorName: user?.displayName || 'สมาชิก',
    authorEmoji: user?.emoji || '🌸',
    createdAt: new Date().toISOString(),
  };
  let updatedWish = null;

  if (all[spaceId]) {
    all[spaceId] = all[spaceId].map(w => {
      if (w.id === wishId) {
        const updatedNotes = [...(w.notes || []), newNote];
        updatedWish = { ...w, notes: updatedNotes };
        return updatedWish;
      }
      return w;
    });
    localStorage.setItem(STORAGE_KEY_WISHES, JSON.stringify(all));
  }

  try {
    if (updatedWish) {
      await supabase.from('wishes').update({ notes: updatedWish.notes }).eq('id', wishId);
    } else {
      const { data } = await supabase.from('wishes').select('*').eq('id', wishId).single();
      if (data) {
        const camelWish = toCamelCase(data);
        const updatedNotes = [...(camelWish.notes || []), newNote];
        await supabase.from('wishes').update({ notes: updatedNotes }).eq('id', wishId);
        updatedWish = { ...camelWish, notes: updatedNotes };
      }
    }
  } catch (_) {}

  return { wish: updatedWish, note: newNote };
}

export async function getSpaceEvents(spaceId) {
  try {
    const { data, error } = await supabase
      .from('space_events')
      .select('*')
      .eq('space_id', spaceId)
      .order('event_date', { ascending: true });

    if (data && !error && data.length > 0) {
      const camelData = data.map(toCamelCase);
      try {
        const all = JSON.parse(localStorage.getItem('makewish_space_events') || '{}');
        all[spaceId] = camelData;
        localStorage.setItem('makewish_space_events', JSON.stringify(all));
      } catch (_) {}
      return camelData;
    }
  } catch (_) {}

  try {
    const all = JSON.parse(localStorage.getItem('makewish_space_events') || '{}');
    if (all[spaceId]) return all[spaceId];
  } catch (_) {}

  // Return empty array for newly created spaces
  return [];
}

export async function addSpaceEvent(spaceId, eventData) {
  const newEvent = {
    id: 'evt-' + Date.now(),
    spaceId,
    title: eventData.title,
    emoji: eventData.emoji,
    date: eventData.date,
    eventDate: eventData.date,
    createdAt: new Date().toISOString(),
  };

  try {
    await supabase.from('space_events').insert([toSnakeCase(newEvent)]);
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

export async function inviteFriendToSpace(spaceId, friendDisplayName, friendUserId) {
  let target = null;
  const spaces = JSON.parse(localStorage.getItem(STORAGE_KEY_SPACES) || '[]');
  target = spaces.find(s => s.id === spaceId);

  if (!target) {
    try {
      const { data } = await supabase.from('spaces').select('*').eq('id', spaceId).maybeSingle();
      if (data) target = toCamelCase(data);
    } catch (_) {}
  }

  if (!target) {
    return { status: 'error', message: 'ไม่พบห้องที่ต้องการเชิญ' };
  }

  const members = Array.isArray(target.members) ? [...target.members] : [];
  const memberIds = Array.isArray(target.memberIds) ? [...target.memberIds] : [];

  if (members.includes(friendDisplayName)) {
    return { status: 'error', message: 'มีเพื่อนคนนี้ในห้องแล้ว' };
  }

  members.push(friendDisplayName);
  if (friendUserId && !memberIds.includes(friendUserId)) {
    memberIds.push(friendUserId);
  }

  target.members = members;
  target.memberIds = memberIds;
  target.memberCount = members.length;

  const updatedSpaces = spaces.map(s => s.id === spaceId ? target : s);
  if (!spaces.find(s => s.id === spaceId)) {
    updatedSpaces.unshift(target);
  }
  localStorage.setItem(STORAGE_KEY_SPACES, JSON.stringify(updatedSpaces));

  // Sync to Supabase
  try {
    await supabase.from('spaces').update(toSnakeCase({
      members: target.members,
      memberIds: target.memberIds,
      memberCount: target.memberCount,
    })).eq('id', spaceId);

    if (friendUserId) {
      await supabase.from('space_members').upsert([{
        id: `sm-${spaceId}-${friendUserId}`,
        space_id: spaceId,
        user_id: friendUserId,
      }], { onConflict: 'space_id,user_id' });
    }
  } catch (_) {}

  return { status: 'success', space: target };
}

// ==================== PROFILE UPDATE ====================
export async function updateUserProfile(userId, updates) {
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    const updatedUser = { ...currentUser, ...updates };
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(updatedUser));
  }

  try {
    const users = JSON.parse(localStorage.getItem('makewish_all_users') || '[]');
    const updatedUsers = users.map(u => u.id === userId ? { ...u, ...updates } : u);
    localStorage.setItem('makewish_all_users', JSON.stringify(updatedUsers));
  } catch (_) {}

  try {
    const dbUpdates = toSnakeCase(updates);
    await supabase.from('users').update(dbUpdates).eq('id', userId);
  } catch (_) {}

  return { status: 'success' };
}

// ==================== SECRET CLAIM (Surprise Mode) ====================
export async function claimWish(spaceId, wishId, user) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY_WISHES) || '{}');
  let updatedWish = null;

  if (all[spaceId]) {
    all[spaceId] = all[spaceId].map(w => {
      if (w.id === wishId) {
        updatedWish = {
          ...w,
          claimedBy: user.id,
          claimedByName: user.displayName,
          claimedAt: new Date().toISOString(),
        };
        return updatedWish;
      }
      return w;
    });
    localStorage.setItem(STORAGE_KEY_WISHES, JSON.stringify(all));
  }

  try {
    if (updatedWish) {
      await supabase.from('wishes').update(toSnakeCase({
        claimedBy: updatedWish.claimedBy,
        claimedByName: updatedWish.claimedByName,
        claimedAt: updatedWish.claimedAt,
      })).eq('id', wishId);
    }
  } catch (_) {}

  return updatedWish;
}

export async function unclaimWish(spaceId, wishId) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY_WISHES) || '{}');
  let updatedWish = null;

  if (all[spaceId]) {
    all[spaceId] = all[spaceId].map(w => {
      if (w.id === wishId) {
        updatedWish = {
          ...w,
          claimedBy: null,
          claimedByName: null,
          claimedAt: null,
        };
        return updatedWish;
      }
      return w;
    });
    localStorage.setItem(STORAGE_KEY_WISHES, JSON.stringify(all));
  }

  try {
    await supabase.from('wishes').update({
      claimed_by: null,
      claimed_by_name: null,
      claimed_at: null,
    }).eq('id', wishId);
  } catch (_) {}

  return updatedWish;
}

// ==================== REACTIONS ====================
export async function toggleReaction(spaceId, wishId, emoji, user) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY_WISHES) || '{}');
  let updatedWish = null;

  if (all[spaceId]) {
    all[spaceId] = all[spaceId].map(w => {
      if (w.id === wishId) {
        const reactions = { ...(w.reactions || {}) };
        const users = Array.isArray(reactions[emoji]) ? [...reactions[emoji]] : [];
        const idx = users.indexOf(user.id);
        if (idx >= 0) {
          users.splice(idx, 1);
          if (users.length === 0) {
            delete reactions[emoji];
          } else {
            reactions[emoji] = users;
          }
        } else {
          users.push(user.id);
          reactions[emoji] = users;
        }
        updatedWish = { ...w, reactions };
        return updatedWish;
      }
      return w;
    });
    localStorage.setItem(STORAGE_KEY_WISHES, JSON.stringify(all));
  }

  try {
    if (updatedWish) {
      await supabase.from('wishes').update({ reactions: updatedWish.reactions }).eq('id', wishId);
    }
  } catch (_) {}

  return updatedWish;
}

// ==================== NOTIFICATIONS ====================
const STORAGE_KEY_NOTIFICATIONS = 'makewish_notifications';

export async function getNotifications(userId) {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (data && !error && data.length > 0) {
      const camelData = data.map(toCamelCase);
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(camelData));
      return camelData;
    }
  } catch (_) {}

  try {
    const local = JSON.parse(localStorage.getItem(STORAGE_KEY_NOTIFICATIONS) || '[]');
    return local.filter(n => n.userId === userId);
  } catch (_) {}

  return [];
}

export async function createNotification(targetUserId, { type, title, message, emoji, relatedId }) {
  if (!targetUserId) return null;
  const notification = {
    id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    userId: targetUserId,
    type,
    title,
    message: message || '',
    emoji: emoji || '🔔',
    relatedId: relatedId || null,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  try {
    await supabase.from('notifications').insert([toSnakeCase(notification)]);
  } catch (_) {}

  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY_NOTIFICATIONS) || '[]');
    all.unshift(notification);
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(all));
  } catch (_) {}

  return notification;
}

export async function markNotificationRead(notifId) {
  try {
    await supabase.from('notifications').update({ is_read: true }).eq('id', notifId);
  } catch (_) {}

  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY_NOTIFICATIONS) || '[]');
    const updated = all.map(n => n.id === notifId ? { ...n, isRead: true } : n);
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updated));
  } catch (_) {}
}

export async function markAllNotificationsRead(userId) {
  try {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
  } catch (_) {}

  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY_NOTIFICATIONS) || '[]');
    const updated = all.map(n => n.userId === userId ? { ...n, isRead: true } : n);
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updated));
  } catch (_) {}
}

export function subscribeToNotifications(userId, onNotification) {
  const channel = supabase.channel(`notifications-${userId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, payload => {
      onNotification(toCamelCase(payload.new));
    })
    .subscribe();
  return channel;
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
