/**
 * db.js — localStorage abstraction layer (Wishy database)
 * All data is namespaced under 'wishy_' prefix
 */

const KEYS = {
  USERS:   'wishy_users',
  SPACES:  'wishy_spaces',
  WISHES:  'wishy_wishes',
  SESSION: 'wishy_session',
};

// ── Generic helpers ──────────────────────────────────────────────

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
    return newUser;
  },

  verifyPassword: (user, password) => user.passwordHash === btoa(password),

  delete: (id) => {
    const user = Users.findById(id);
    if (user && user.username === 'admin') {
      throw new Error('ไม่สามารถลบผู้ดูแลระบบหลักได้');
    }
    
    // Remove user from users list
    setAll(KEYS.USERS, Users.getAll().filter(u => u.id !== id));

    // Remove user from all spaces
    const spaces = Spaces.getAll();
    spaces.forEach(space => {
      if (space.memberIds.includes(id)) {
        Spaces.removeMember(space.id, id);
      }
    });

    // Remove user's wishes
    setAll(KEYS.WISHES, Wishes.getAll().filter(w => w.userId !== id));
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
  },

  delete: (spaceId) => {
    setAll(KEYS.SPACES, Spaces.getAll().filter(s => s.id !== spaceId));
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
    return wish;
  },

  delete: (wishId) => {
    setAll(KEYS.WISHES, Wishes.getAll().filter(w => w.id !== wishId));
  },

  deleteBySpace: (spaceId) => {
    setAll(KEYS.WISHES, Wishes.getAll().filter(w => w.spaceId !== spaceId));
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
window.DB = { Users, Session, Spaces, Wishes, CATEGORIES };
