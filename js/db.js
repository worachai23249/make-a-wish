/* ================================================================
   WISHY — DB JS (Global Cloud Sync + localStorage Database)
   Synchronizes local storage globally across all devices using KVDB.io
   ================================================================ */

const KEYS = {
  USERS:   'wishy_users',
  SPACES:  'wishy_spaces',
  WISHES:  'wishy_wishes',
  SESSION: 'wishy_session',
};

// ── Local Database Helpers ───────────────────────────────────────
function getAll(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
}

function setAll(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function generateCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ── Cloud Sync Engine (REST API via KVDB.io) ──────────────────────
// Custom bucket 'WDveAYa7PKJb5axxvkiBfN' verified for worachai23249@gmail.com
const SYNC_BUCKET = 'https://kvdb.io/WDveAYa7PKJb5axxvkiBfN/';

const CloudSync = {
  fetch: async (key) => {
    try {
      const res = await fetch(SYNC_BUCKET + key);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('[CloudSync] Pull failed for ' + key, e);
    }
    return null;
  },

  save: async (key, data) => {
    try {
      await fetch(SYNC_BUCKET + key, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (e) {
      console.warn('[CloudSync] Push failed for ' + key, e);
    }
  },

  pullAll: async () => {
    console.log('[CloudSync] Syncing database with cloud...');
    const users = await CloudSync.fetch(KEYS.USERS);
    if (users && Array.isArray(users)) {
      setAll(KEYS.USERS, users);
    }

    const spaces = await CloudSync.fetch(KEYS.SPACES);
    if (spaces && Array.isArray(spaces)) {
      setAll(KEYS.SPACES, spaces);
    }

    const wishes = await CloudSync.fetch(KEYS.WISHES);
    if (wishes && Array.isArray(wishes)) {
      setAll(KEYS.WISHES, wishes);
    }
    console.log('[CloudSync] Sync complete.');
  }
};

// ── Users ────────────────────────────────────────────────────────
const Users = {
  getAll: () => getAll(KEYS.USERS),

  findById: (id) => Users.getAll().find(u => u.id === id) || null,

  findByUsername: (username) =>
    Users.getAll().find(u => u.username.toLowerCase() === username.toLowerCase()) || null,

  findByEmail: (email) =>
    Users.getAll().find(u => u.email.toLowerCase() === email.toLowerCase()) || null,

  create: ({ username, displayName, email, password }) => {
    const users = Users.getAll();
    const newUser = {
      id:          generateId(),
      username:    username.trim(),
      displayName: displayName.trim(),
      email:       email.trim().toLowerCase(),
      passwordHash: btoa(password),
      createdAt:   new Date().toISOString(),
      emoji:       ['🌸','✨','🌙','🦋','🌈','💫','🎯','🔮'][Math.floor(Math.random()*8)],
      role:        username.trim().toLowerCase() === 'admin' ? 'admin' : 'user',
    };
    users.push(newUser);
    setAll(KEYS.USERS, users);
    CloudSync.save(KEYS.USERS, users); // Sync to cloud
    return newUser;
  },

  verifyPassword: (user, password) => user.passwordHash === btoa(password),

  update: (id, { displayName, email, password }) => {
    const users = Users.getAll();
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) throw new Error('ไม่พบผู้ใช้งาน');

    // Validate email uniqueness if changed
    const existingEmail = Users.findByEmail(email);
    if (existingEmail && existingEmail.id !== id) {
      throw new Error('อีเมลนี้ถูกใช้งานแล้ว');
    }

    users[userIndex].displayName = displayName.trim();
    users[userIndex].email = email.trim().toLowerCase();
    if (password) {
      users[userIndex].passwordHash = btoa(password);
    }

    setAll(KEYS.USERS, users);
    CloudSync.save(KEYS.USERS, users); // Sync to cloud
    return users[userIndex];
  },

  delete: (id) => {
    const user = Users.findById(id);
    if (user && user.username === 'admin') {
      throw new Error('ไม่สามารถลบผู้ดูแลระบบหลักได้');
    }
    
    // Remove user from users list
    const updatedUsers = Users.getAll().filter(u => u.id !== id);
    setAll(KEYS.USERS, updatedUsers);
    CloudSync.save(KEYS.USERS, updatedUsers); // Sync to cloud

    // Remove user from all spaces
    const spaces = Spaces.getAll();
    spaces.forEach(space => {
      if (space.memberIds.includes(id)) {
        Spaces.removeMember(space.id, id);
      }
    });

    // Remove user's wishes
    const updatedWishes = Wishes.getAll().filter(w => w.userId !== id);
    setAll(KEYS.WISHES, updatedWishes);
    CloudSync.save(KEYS.WISHES, updatedWishes); // Sync to cloud
  }
};

// ── Session ──────────────────────────────────────────────────────
const Session = {
  get: () => {
    try { return JSON.parse(sessionStorage.getItem(KEYS.SESSION) || 'null'); }
    catch { return null; }
  },

  set: (user) => {
    const session = {
      userId:      user.id,
      username:    user.username,
      displayName: user.displayName,
      emoji:       user.emoji,
      role:        user.role || 'user',
    };
    sessionStorage.setItem(KEYS.SESSION, JSON.stringify(session));
    return session;
  },

  clear: () => sessionStorage.removeItem(KEYS.SESSION),

  isLoggedIn: () => !!Session.get(),
};

// ── Spaces ───────────────────────────────────────────────────────
const Spaces = {
  getAll: () => getAll(KEYS.SPACES),

  findById: (id) => Spaces.getAll().find(s => s.id === id) || null,

  findByInviteCode: (code) =>
    Spaces.getAll().find(s => s.inviteCode === code.toUpperCase()) || null,

  getForUser: (userId) =>
    Spaces.getAll().filter(s => s.memberIds.includes(userId)),

  create: ({ name, type, ownerId }) => {
    const spaces = Spaces.getAll();
    const space = {
      id:         generateId(),
      name:       name.trim(),
      type,                         // '1on1' | 'group'
      ownerId,
      memberIds:  [ownerId],
      inviteCode: generateCode(6),
      emoji:      ['💑','👫','💕','🫂','✨','🎉','🔥','🌙'][Math.floor(Math.random()*8)],
      createdAt:  new Date().toISOString(),
    };
    spaces.push(space);
    setAll(KEYS.SPACES, spaces);
    CloudSync.save(KEYS.SPACES, spaces); // Sync to cloud
    return space;
  },

  addMember: (spaceId, userId) => {
    const spaces = Spaces.getAll();
    const idx = spaces.findIndex(s => s.id === spaceId);
    if (idx === -1) throw new Error('ไม่พบ Space');
    const space = spaces[idx];
    if (space.memberIds.includes(userId)) throw new Error('คุณอยู่ใน Space นี้แล้ว');
    const maxMembers = space.type === '1on1' ? 2 : 10;
    if (space.memberIds.length >= maxMembers) throw new Error(`Space นี้เต็มแล้ว (${maxMembers} คน)`);
    space.memberIds.push(userId);
    setAll(KEYS.SPACES, spaces);
    CloudSync.save(KEYS.SPACES, spaces); // Sync to cloud
    return space;
  },

  removeMember: (spaceId, userId) => {
    const spaces = Spaces.getAll();
    const idx = spaces.findIndex(s => s.id === spaceId);
    if (idx === -1) return;
    spaces[idx].memberIds = spaces[idx].memberIds.filter(id => id !== userId);
    if (spaces[idx].memberIds.length === 0) {
      spaces.splice(idx, 1);
    }
    setAll(KEYS.SPACES, spaces);
    CloudSync.save(KEYS.SPACES, spaces); // Sync to cloud
  },

  delete: (spaceId) => {
    const updatedSpaces = Spaces.getAll().filter(s => s.id !== spaceId);
    setAll(KEYS.SPACES, updatedSpaces);
    CloudSync.save(KEYS.SPACES, updatedSpaces); // Sync to cloud
    
    // Also delete all wishes in this space
    Wishes.deleteBySpace(spaceId);
  },
};

// ── Wishes ───────────────────────────────────────────────────────
const CATEGORIES = {
  item:  { id: 'item',  label: 'สิ่งของที่อยากได้', emoji: '🎁', color: 'var(--clr-primary)' },
  food:  { id: 'food',  label: 'อาหารที่อยากกิน',   emoji: '🍜', color: 'var(--clr-accent)' },
  place: { id: 'place', label: 'สถานที่ที่อยากไป',  emoji: '📍', color: 'var(--clr-teal)' },
};

const Wishes = {
  getAll: () => getAll(KEYS.WISHES),

  findById: (id) => Wishes.getAll().find(w => w.id === id) || null,

  getForSpace: (spaceId) =>
    Wishes.getAll().filter(w => w.spaceId === spaceId),

  getForSpaceByCategory: (spaceId, category) =>
    Wishes.getAll().filter(w => w.spaceId === spaceId && w.category === category),

  getForUser: (spaceId, userId) =>
    Wishes.getAll().filter(w => w.spaceId === spaceId && w.userId === userId),

  getForOthers: (spaceId, userId) =>
    Wishes.getAll().filter(w => w.spaceId === spaceId && w.userId !== userId),

  create: ({ spaceId, userId, category, title, description, emoji }) => {
    const wishes = Wishes.getAll();
    const wish = {
      id:          generateId(),
      spaceId,
      userId,
      category,
      title:       title.trim(),
      description: description ? description.trim() : '',
      emoji:       emoji || CATEGORIES[category]?.emoji || '⭐',
      createdAt:   new Date().toISOString(),
    };
    wishes.push(wish);
    setAll(KEYS.WISHES, wishes);
    CloudSync.save(KEYS.WISHES, wishes); // Sync to cloud
    return wish;
  },

  delete: (wishId) => {
    const updatedWishes = Wishes.getAll().filter(w => w.id !== wishId);
    setAll(KEYS.WISHES, updatedWishes);
    CloudSync.save(KEYS.WISHES, updatedWishes); // Sync to cloud
  },

  deleteBySpace: (spaceId) => {
    const updatedWishes = Wishes.getAll().filter(w => w.spaceId !== spaceId);
    setAll(KEYS.WISHES, updatedWishes);
    CloudSync.save(KEYS.WISHES, updatedWishes); // Sync to cloud
  },
};

// ── Database Seeding & Migration ─────────────────────────────────
try {
  const users = Users.getAll();
  let updated = false;

  // 1. Seed admin if not exists
  const adminExists = users.some(u => u.username === 'admin');
  if (!adminExists) {
    const adminUser = {
      id:          'admin_id',
      username:    'admin',
      displayName: 'ผู้ดูแลระบบ (Admin)',
      email:       'admin@wishy.com',
      passwordHash: btoa('admin123'), // Default password: admin123
      createdAt:   new Date().toISOString(),
      emoji:       '👑',
      role:        'admin'
    };
    users.push(adminUser);
    updated = true;
  }

  // 2. Migration: Ensure any user with username 'admin' has 'admin' role
  users.forEach(u => {
    if (u.username.toLowerCase() === 'admin' && u.role !== 'admin') {
      u.role = 'admin';
      updated = true;
    }
  });

  if (updated) {
    setAll(KEYS.USERS, users);
    console.log('[Wishy DB] Admin seeded/migrated successfully.');
  }
} catch (e) {
  console.error('Failed to seed/migrate admin user', e);
}

// Export everything
window.DB = { Users, Session, Spaces, Wishes, CATEGORIES, CloudSync };
