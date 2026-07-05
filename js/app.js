/**
 * app.js — Main application router & controller
 * Hash-based SPA routing
 */

// ── Router ───────────────────────────────────────────────────────

const Router = {
  routes: {},

  register(path, handler) {
    this.routes[path] = handler;
  },

  navigate(path, replace = false) {
    if (replace) {
      history.replaceState(null, '', '#' + path);
    } else {
      history.pushState(null, '', '#' + path);
    }
    this.resolve();
  },

  resolve() {
    const hash = location.hash.slice(1) || '/';
    const [base, ...rest] = hash.split('?');
    const query = Object.fromEntries(new URLSearchParams(rest.join('?')));

    // Find matching route (supports :param)
    let handler = null;
    let params  = {};

    for (const pattern in this.routes) {
      const paramNames = [];
      const regexStr = pattern.replace(/:([^/]+)/g, (_, name) => {
        paramNames.push(name);
        return '([^/]+)';
      });
      const match = base.match(new RegExp(`^${regexStr}$`));
      if (match) {
        handler = this.routes[pattern];
        paramNames.forEach((name, i) => { params[name] = match[i + 1]; });
        break;
      }
    }

    if (!handler) {
      Router.navigate('/dashboard', true);
      return;
    }

    handler({ params, query });
  },

  back() { history.back(); },
};

// ── App utilities ────────────────────────────────────────────────

const App = {
  appEl: null,

  init() {
    this.appEl = document.getElementById('app');
    this.registerRoutes();
    this.registerServiceWorker();

    window.addEventListener('hashchange', () => Router.resolve());
    window.addEventListener('popstate',   () => Router.resolve());

    // Initial route
    if (!location.hash) {
      const session = DB.Session.get();
      Router.navigate(session ? '/dashboard' : '/login', true);
    } else {
      Router.resolve();
    }
  },

  registerRoutes() {
    Router.register('/login',          Pages.login);
    Router.register('/register',       Pages.register);
    Router.register('/dashboard',      Pages.dashboard);
    Router.register('/create-space',   Pages.createSpace);
    Router.register('/join-space',     Pages.joinSpace);
    Router.register('/space/:id',      Pages.spaceDetail);
    Router.register('/space/:id/add',  Pages.addWish);
    Router.register('/space/:id/roulette', Pages.roulette);
    Router.register('/profile',        Pages.profile);
    Router.register('/admin',          Pages.admin);
  },

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('[Wishy] Service Worker registered', reg.scope))
        .catch(err => console.warn('[Wishy] SW registration failed', err));
    }
  },

  render(html) {
    this.appEl.innerHTML = html;
  },

  requireAuth() {
    const session = DB.Session.get();
    if (!session) {
      Router.navigate('/login', true);
      return null;
    }
    return session;
  },

  requireUserAuth() {
    const session = this.requireAuth();
    if (!session) return null;
    if (session.role === 'admin') {
      Router.navigate('/admin', true);
      return null;
    }
    return session;
  },
};

// ── Toast ────────────────────────────────────────────────────────

const Toast = {
  container: null,

  init() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  },

  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { success: '✅', error: '❌', info: '💫' };
    toast.innerHTML = `${icons[type] || '💫'} ${message}`;
    this.container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('out');
      toast.addEventListener('animationend', () => toast.remove());
    }, duration);
  },

  success: (msg) => Toast.show(msg, 'success'),
  error:   (msg) => Toast.show(msg, 'error'),
  info:    (msg) => Toast.show(msg, 'info'),
};

// ── Modal ────────────────────────────────────────────────────────

const Modal = {
  open(contentHTML, onClose) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-overlay';

    overlay.innerHTML = `
      <div class="modal" id="modal-content">
        <div class="modal-handle"></div>
        ${contentHTML}
      </div>
    `;

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) Modal.close(onClose);
    });

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
  },

  close(callback) {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.remove();
    document.body.style.overflow = '';
    if (callback) callback();
  },
};

// ── Pages ────────────────────────────────────────────────────────

const Pages = {

  // ── Login page ────────────────────────────────────────────────
  login({ }) {
    if (DB.Session.isLoggedIn()) {
      Router.navigate('/dashboard', true);
      return;
    }

    App.render(`
      <div class="bg-gradient"></div>
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>

      <div class="page" style="justify-content: center; align-items: center; min-height: 100dvh; padding: 24px;">
        <div style="width: 100%; max-width: 400px;">

          <!-- Logo -->
          <div class="text-center mb-6">
            <div style="font-size: 3.5rem; margin-bottom: 8px; animation: float 3s ease-in-out infinite;">🌸</div>
            <h1 class="text-gradient" style="font-size: 2.5rem;">Wishy</h1>
            <p class="text-muted text-sm mt-2">พื้นที่ความปรารถนาของคุณ</p>
          </div>

          <!-- Card -->
          <div class="glass-card" style="padding: 28px;">
            <h2 style="font-size: 1.2rem; margin-bottom: 20px;">เข้าสู่ระบบ</h2>

            <form id="login-form" class="flex flex-col gap-4">
              <div class="form-group">
                <label class="form-label">อีเมล</label>
                <input id="login-email" type="email" class="form-input" placeholder="your@email.com" required autocomplete="email">
              </div>
              <div class="form-group">
                <label class="form-label">รหัสผ่าน</label>
                <div class="relative">
                  <input id="login-pass" type="password" class="form-input" placeholder="••••••••" required autocomplete="current-password" style="padding-right: 48px;">
                  <button type="button" id="toggle-pass" style="position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:1.1rem;color:var(--clr-text-muted);">👁️</button>
                </div>
              </div>
              <div id="login-error" class="form-error hidden"></div>
              <button type="submit" class="btn btn-primary btn-full btn-lg" id="login-btn">
                <span>เข้าสู่ระบบ</span>
              </button>
            </form>

            <div class="divider mt-5 mb-4">หรือ</div>

            <button class="btn btn-ghost btn-full" onclick="Router.navigate('/register')">
              สมัครสมาชิกใหม่ ✨
            </button>
          </div>

          <p class="text-center text-muted text-xs mt-5">
            ข้อมูลเก็บไว้ในอุปกรณ์ของคุณเท่านั้น 🔒
          </p>
        </div>
      </div>
    `);

    // Events
    const form      = document.getElementById('login-form');
    const emailEl   = document.getElementById('login-email');
    const passEl    = document.getElementById('login-pass');
    const toggleBtn = document.getElementById('toggle-pass');
    const errorEl   = document.getElementById('login-error');
    const loginBtn  = document.getElementById('login-btn');

    toggleBtn.addEventListener('click', () => {
      const isPass = passEl.type === 'password';
      passEl.type = isPass ? 'text' : 'password';
      toggleBtn.textContent = isPass ? '🙈' : '👁️';
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorEl.classList.add('hidden');
      loginBtn.disabled = true;
      loginBtn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;"></div>';

      // Simulate async
      await new Promise(r => setTimeout(r, 500));

      try {
        const email    = emailEl.value.trim();
        const password = passEl.value;
        const user = DB.Users.findByEmail(email);

        if (!user || !DB.Users.verifyPassword(user, password)) {
          throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        }

        DB.Session.set(user);
        Toast.success(`ยินดีต้อนรับกลับมา ${user.displayName}! 🎉`);
        Router.navigate('/dashboard', true);

      } catch (err) {
        errorEl.textContent = '⚠️ ' + err.message;
        errorEl.classList.remove('hidden');
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<span>เข้าสู่ระบบ</span>';
      }
    });
  },

  // ── Register page ─────────────────────────────────────────────
  register({ }) {
    if (DB.Session.isLoggedIn()) {
      Router.navigate('/dashboard', true);
      return;
    }

    App.render(`
      <div class="bg-gradient"></div>
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>

      <div class="page" style="justify-content: center; min-height: 100dvh; padding: 24px;">
        <div style="width: 100%; max-width: 400px; margin: auto;">
          <!-- Header -->
          <div class="flex items-center gap-3 mb-6">
            <button class="btn btn-ghost btn-icon" onclick="Router.back()">←</button>
            <div>
              <h2 style="font-size: 1.3rem;">สมัครสมาชิก</h2>
              <p class="text-muted text-xs">สร้างบัญชีของคุณ</p>
            </div>
          </div>

          <div class="glass-card" style="padding: 28px;">
            <form id="register-form" class="flex flex-col gap-4">
              <div class="form-group">
                <label class="form-label">ชื่อที่ใช้แสดง</label>
                <input id="reg-display" type="text" class="form-input" placeholder="เช่น แฟนต้า, อ้วน" required maxlength="30">
              </div>
              <div class="form-group">
                <label class="form-label">Username</label>
                <input id="reg-username" type="text" class="form-input" placeholder="เช่น fanta_ouw" required maxlength="20" pattern="[a-zA-Z0-9_]+">
                <span class="text-xs text-muted">ตัวอักษร, ตัวเลข, ขีดล่าง เท่านั้น</span>
              </div>
              <div class="form-group">
                <label class="form-label">อีเมล</label>
                <input id="reg-email" type="email" class="form-input" placeholder="your@email.com" required autocomplete="email">
              </div>
              <div class="form-group">
                <label class="form-label">รหัสผ่าน</label>
                <input id="reg-pass" type="password" class="form-input" placeholder="อย่างน้อย 6 ตัวอักษร" required minlength="6" autocomplete="new-password">
              </div>
              <div id="reg-error" class="form-error hidden"></div>
              <button type="submit" class="btn btn-primary btn-full btn-lg mt-2" id="reg-btn">
                สมัครสมาชิก 🌸
              </button>
            </form>
          </div>

          <p class="text-center mt-4 text-sm text-muted">
            มีบัญชีแล้ว?
            <button class="btn btn-ghost btn-sm" onclick="Router.navigate('/login')">เข้าสู่ระบบ</button>
          </p>
        </div>
      </div>
    `);

    const form     = document.getElementById('register-form');
    const errorEl  = document.getElementById('reg-error');
    const regBtn   = document.getElementById('reg-btn');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorEl.classList.add('hidden');
      regBtn.disabled = true;
      regBtn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;"></div>';

      await new Promise(r => setTimeout(r, 500));

      try {
        const displayName = document.getElementById('reg-display').value.trim();
        const username    = document.getElementById('reg-username').value.trim();
        const email       = document.getElementById('reg-email').value.trim().toLowerCase();
        const password    = document.getElementById('reg-pass').value;

        if (!/^[a-zA-Z0-9_]+$/.test(username)) throw new Error('Username ใช้ได้เฉพาะ a-z, 0-9, _ เท่านั้น');
        if (DB.Users.findByUsername(username))   throw new Error('Username นี้ถูกใช้แล้ว');
        if (DB.Users.findByEmail(email))          throw new Error('อีเมลนี้ถูกใช้แล้ว');

        const user = DB.Users.create({ username, displayName, email, password });
        DB.Session.set(user);
        Toast.success('สมัครสำเร็จ! ยินดีต้อนรับสู่ Wishy 🌸');
        Router.navigate('/dashboard', true);

      } catch (err) {
        errorEl.textContent = '⚠️ ' + err.message;
        errorEl.classList.remove('hidden');
        regBtn.disabled = false;
        regBtn.innerHTML = 'สมัครสมาชิก 🌸';
      }
    });
  },

  // ── Dashboard ─────────────────────────────────────────────────
  dashboard({ }) {
    const session = App.requireUserAuth();
    if (!session) return;

    const spaces  = DB.Spaces.getForUser(session.userId);
    const wishes  = DB.Wishes.getAll();

    const spacesHTML = spaces.length === 0
      ? `<div class="empty-state">
           <div class="empty-icon">🌙</div>
           <h3>ยังไม่มีพื้นที่ความสัมพันธ์</h3>
           <p>สร้างหรือเข้าร่วม Space แรกของคุณเลย!</p>
           <button class="btn btn-primary" onclick="Router.navigate('/create-space')">+ สร้าง Space ใหม่</button>
         </div>`
      : spaces.map(space => {
          const members    = space.memberIds.map(id => DB.Users.findById(id)).filter(Boolean);
          const spaceWishes = wishes.filter(w => w.spaceId === space.id);
          const isOwner    = space.ownerId === session.userId;

          const membersHTML = members.slice(0, 4).map(m =>
            `<div class="avatar avatar-sm" title="${m.displayName}" style="background: linear-gradient(135deg,${colorFromId(m.id)});">${m.displayName[0].toUpperCase()}</div>`
          ).join('') + (members.length > 4 ? `<div class="avatar avatar-sm" style="background:rgba(255,255,255,0.1);font-size:0.7rem;">+${members.length-4}</div>` : '');

          return `
            <div class="space-card" onclick="Router.navigate('/space/${space.id}')">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <span style="font-size:1.8rem;">${space.emoji}</span>
                  <div>
                    <h3 style="font-size:1rem;">${space.name}</h3>
                    <div class="flex gap-2 mt-1">
                      <span class="badge ${space.type === '1on1' ? 'badge-primary' : 'badge-accent'}">
                        ${space.type === '1on1' ? '💑 1-on-1' : '👥 กลุ่ม'}
                      </span>
                      ${isOwner ? '<span class="badge badge-gold">👑 เจ้าของ</span>' : ''}
                    </div>
                  </div>
                </div>
                <span style="color:var(--clr-text-muted);font-size:1.2rem;">›</span>
              </div>

              <div class="flex items-center justify-between" style="margin-top: 12px;">
                <div class="avatar-group">${membersHTML}</div>
                <div class="flex gap-3 text-muted text-xs">
                  <span>🎁 ${spaceWishes.filter(w=>w.category==='item').length}</span>
                  <span>🍜 ${spaceWishes.filter(w=>w.category==='food').length}</span>
                  <span>📍 ${spaceWishes.filter(w=>w.category==='place').length}</span>
                </div>
              </div>
            </div>
          `;
        }).join('');

    App.render(`
      <div class="bg-gradient"></div>
      <div class="orb orb-1"></div>
      <div class="orb orb-3"></div>

      <div class="page pb-24">
        <!-- Navbar -->
        <nav class="navbar">
          <div class="navbar-logo">
            <span>🌸</span>
            <span>Wishy</span>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="Router.navigate('/profile')">
            <div class="avatar avatar-sm">${session.emoji || session.displayName[0].toUpperCase()}</div>
          </button>
        </nav>

        <div class="container" style="padding-top: 24px;">
          <!-- Welcome -->
          <div class="mb-6">
            <h1 style="font-size:1.6rem;">สวัสดี, ${session.displayName} ${session.emoji || '👋'}</h1>
            <p class="text-muted text-sm mt-1">คุณมี ${spaces.length} พื้นที่ความสัมพันธ์</p>
          </div>

          <!-- Quick actions -->
          <div class="flex gap-3 mb-6">
            <button class="btn btn-primary flex-1" onclick="Router.navigate('/create-space')">
              ✨ สร้าง Space
            </button>
            <button class="btn btn-ghost flex-1" onclick="Pages.showJoinModal()">
              🔑 เข้าด้วยโค้ด
            </button>
          </div>

          <!-- Spaces list -->
          <div class="flex flex-col gap-4">
            ${spacesHTML}
          </div>
        </div>
      </div>

      <!-- Bottom nav -->
      <nav class="bottom-nav">
        <button class="bottom-nav-item active">
          <span class="icon">🏠</span><span>หน้าหลัก</span>
        </button>
        <button class="bottom-nav-item" onclick="Router.navigate('/create-space')">
          <span class="icon">✨</span><span>สร้าง</span>
        </button>
        <button class="bottom-nav-item" onclick="Pages.showJoinModal()">
          <span class="icon">🔑</span><span>เข้าร่วม</span>
        </button>
        <button class="bottom-nav-item" onclick="Router.navigate('/profile')">
          <span class="icon">👤</span><span>โปรไฟล์</span>
        </button>
      </nav>
    `);
  },

  // ── Join Space Modal ──────────────────────────────────────────
  showJoinModal() {
    const session = DB.Session.get();
    if (!session) return;

    Modal.open(`
      <h3 class="mb-4">🔑 เข้าร่วม Space</h3>
      <div class="form-group mb-4">
        <label class="form-label">Invite Code</label>
        <input id="join-code" type="text" class="form-input" placeholder="เช่น ABC123" maxlength="6"
          style="text-align:center; font-size:1.5rem; letter-spacing:0.3em; font-weight:800; text-transform:uppercase;">
        <span class="text-xs text-muted">กรอกโค้ด 6 หลักที่ได้รับ</span>
      </div>
      <div id="join-error" class="form-error hidden mb-3"></div>
      <button class="btn btn-primary btn-full" id="join-btn" onclick="Pages.joinByCode()">เข้าร่วม 🚀</button>
    `);

    const codeInput = document.getElementById('join-code');
    codeInput.focus();
    codeInput.addEventListener('input', () => {
      codeInput.value = codeInput.value.toUpperCase();
    });
  },

  joinByCode() {
    const session  = DB.Session.get();
    const codeInput = document.getElementById('join-code');
    const errorEl  = document.getElementById('join-error');
    const btn      = document.getElementById('join-btn');
    const code     = codeInput.value.trim().toUpperCase();

    if (code.length !== 6) {
      errorEl.textContent = '⚠️ กรุณากรอกโค้ด 6 หลัก';
      errorEl.classList.remove('hidden');
      return;
    }

    try {
      const space = DB.Spaces.findByInviteCode(code);
      if (!space) throw new Error('ไม่พบ Space ที่มีโค้ดนี้');

      DB.Spaces.addMember(space.id, session.userId);
      Modal.close();
      Toast.success(`เข้าร่วม "${space.name}" สำเร็จ! 🎉`);
      Router.navigate('/space/' + space.id);

    } catch (err) {
      errorEl.textContent = '⚠️ ' + err.message;
      errorEl.classList.remove('hidden');
    }
  },

  // ── Create Space ──────────────────────────────────────────────
  createSpace({ }) {
    const session = App.requireUserAuth();
    if (!session) return;

    App.render(`
      <div class="bg-gradient"></div>
      <div class="orb orb-2"></div>

      <div class="page pb-24">
        <nav class="navbar">
          <button class="btn btn-ghost btn-icon" onclick="Router.back()">←</button>
          <h2>สร้างพื้นที่ใหม่</h2>
          <div style="width: 40px;"></div>
        </nav>

        <div class="container" style="padding-top: 24px; max-width: 480px;">
          <form id="create-space-form" class="flex flex-col gap-5">

            <!-- Name -->
            <div class="form-group">
              <label class="form-label">ชื่อพื้นที่ความสัมพันธ์</label>
              <input id="space-name" type="text" class="form-input" required maxlength="50"
                placeholder="เช่น แฟนต้าวอ้วน 💑, แก๊งหมูกระทะ 🐷">
              <span class="text-xs text-muted">ตั้งชื่อที่มีความหมายสำหรับคุณ</span>
            </div>

            <!-- Type -->
            <div class="form-group">
              <label class="form-label">ประเภทพื้นที่</label>
              <div class="radio-group" id="space-type-group">
                <label class="radio-option selected" id="type-1on1">
                  <input type="radio" name="space-type" value="1on1" checked>
                  <span class="option-icon">💑</span>
                  <span class="option-label">1-on-1</span>
                  <span class="option-desc">สำหรับ 2 คน</span>
                </label>
                <label class="radio-option" id="type-group">
                  <input type="radio" name="space-type" value="group">
                  <span class="option-icon">👥</span>
                  <span class="option-label">Group</span>
                  <span class="option-desc">3-10 คน</span>
                </label>
              </div>
            </div>

            <div id="create-error" class="form-error hidden"></div>

            <button type="submit" class="btn btn-primary btn-full btn-lg" id="create-btn">
              ✨ สร้างพื้นที่
            </button>
          </form>
        </div>
      </div>
    `);

    // Radio selection
    document.querySelectorAll('.radio-option').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.radio-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        opt.querySelector('input[type=radio]').checked = true;
      });
    });

    // Submit
    const form = document.getElementById('create-space-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn     = document.getElementById('create-btn');
      const errorEl = document.getElementById('create-error');
      btn.disabled  = true;
      btn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;"></div>';

      await new Promise(r => setTimeout(r, 400));

      try {
        const name = document.getElementById('space-name').value.trim();
        const type = document.querySelector('input[name="space-type"]:checked').value;
        if (!name) throw new Error('กรุณาตั้งชื่อ Space');

        const space = DB.Spaces.create({ name, type, ownerId: session.userId });
        Toast.success(`สร้าง "${space.name}" สำเร็จ! 🎉`);
        Pages.showInviteCode(space);

      } catch (err) {
        errorEl.textContent = '⚠️ ' + err.message;
        errorEl.classList.remove('hidden');
        btn.disabled = false;
        btn.innerHTML = '✨ สร้างพื้นที่';
      }
    });
  },

  showInviteCode(space) {
    Modal.open(`
      <div class="text-center">
        <div style="font-size: 3rem; margin-bottom: 12px;">${space.emoji}</div>
        <h3 class="mb-2">"${space.name}" พร้อมแล้ว!</h3>
        <p class="text-muted text-sm mb-5">แชร์โค้ดนี้ให้เพื่อนเข้าร่วม</p>

        <div class="invite-code-box mb-4">
          <span class="invite-code">${space.inviteCode}</span>
          <button class="btn btn-ghost btn-icon btn-sm" onclick="Pages.copyCode('${space.inviteCode}')" title="คัดลอก">📋</button>
        </div>

        <p class="text-xs text-muted mb-5">โค้ดนี้สามารถแชร์ได้โดยตรง</p>

        <button class="btn btn-primary btn-full" onclick="Modal.close(); Router.navigate('/space/${space.id}')">
          เข้าสู่พื้นที่ →
        </button>
      </div>
    `);
  },

  copyCode(code) {
    navigator.clipboard.writeText(code).then(() => {
      Toast.success('คัดลอกโค้ดแล้ว! 📋');
    }).catch(() => {
      Toast.info('โค้ด: ' + code);
    });
  },

  // ── Space Detail ──────────────────────────────────────────────
  spaceDetail({ params }) {
    const session = App.requireUserAuth();
    if (!session) return;

    const space = DB.Spaces.findById(params.id);
    if (!space || !space.memberIds.includes(session.userId)) {
      Toast.error('ไม่พบ Space หรือคุณไม่ได้เป็นสมาชิก');
      Router.navigate('/dashboard');
      return;
    }

    const members = space.memberIds.map(id => DB.Users.findById(id)).filter(Boolean);
    const categories = ['item', 'food', 'place'];
    let activeCategory = 'item';
    let activeFilter   = 'all'; // 'all' | 'mine' | 'others'

    function renderWishes() {
      const wishContainer = document.getElementById('wish-list');
      if (!wishContainer) return;

      let wishes = DB.Wishes.getForSpaceByCategory(space.id, activeCategory);

      if (activeFilter === 'mine')   wishes = wishes.filter(w => w.userId === session.userId);
      if (activeFilter === 'others') wishes = wishes.filter(w => w.userId !== session.userId);

      if (wishes.length === 0) {
        wishContainer.innerHTML = `
          <div class="empty-state" style="padding: 40px 20px;">
            <div class="empty-icon">${DB.CATEGORIES[activeCategory].emoji}</div>
            <h3>ยังไม่มีรายการ</h3>
            <p>กด "+ เพิ่ม" เพื่อเพิ่ม${DB.CATEGORIES[activeCategory].label}แรก</p>
          </div>`;
        return;
      }

      wishContainer.innerHTML = wishes.map(wish => {
        const user    = DB.Users.findById(wish.userId);
        const isMe    = wish.userId === session.userId;
        return `
          <div class="wish-item" onclick="Pages.showWishDetail('${wish.id}')">
            <div class="wish-emoji">${wish.emoji}</div>
            <div class="wish-info min-w-0">
              <div class="wish-title">${wish.title}</div>
              <div class="wish-meta">
                <span>${isMe ? '🙋 ฉัน' : `👤 ${user?.displayName || 'ไม่ทราบ'}`}</span>
                ${wish.description ? `<span>📝 ${wish.description.slice(0,30)}${wish.description.length>30?'...':''}</span>` : ''}
              </div>
            </div>
            ${isMe ? `<button class="btn btn-ghost btn-icon btn-sm shrink-0" onclick="event.stopPropagation();Pages.deleteWish('${wish.id}','${params.id}')">🗑️</button>` : ''}
          </div>`;
      }).join('');
    }

    App.render(`
      <div class="bg-gradient"></div>
      <div class="orb orb-3"></div>

      <div class="page pb-24">
        <!-- Header -->
        <nav class="navbar">
          <button class="btn btn-ghost btn-icon" onclick="Router.navigate('/dashboard')">←</button>
          <div class="text-center">
            <div style="font-size: 1.1rem; font-weight: 700;">${space.emoji} ${space.name}</div>
            <div class="text-xs text-muted">${members.length} สมาชิก</div>
          </div>
          <button class="btn btn-ghost btn-icon" onclick="Pages.showSpaceMenu('${space.id}')">⋯</button>
        </nav>

        <div class="container" style="padding-top: 16px;">

          <!-- Members -->
          <div class="flex items-center justify-between mb-4">
            <div class="avatar-group">
              ${members.slice(0,5).map(m =>
                `<div class="avatar avatar-sm" title="${m.displayName}"
                  style="background: linear-gradient(135deg,${colorFromId(m.id)});">${m.displayName[0].toUpperCase()}</div>`
              ).join('')}
            </div>
            <div class="flex gap-2">
              <span class="badge ${space.type === '1on1' ? 'badge-primary' : 'badge-accent'}">
                ${space.type === '1on1' ? '💑 1-on-1' : '👥 กลุ่ม'}
              </span>
            </div>
          </div>

          <!-- Category tabs -->
          <div class="tab-bar mb-4" id="cat-tabs">
            ${categories.map(cat => `
              <button class="tab-item ${cat === activeCategory ? 'active' : ''}"
                onclick="Pages._spaceSetCat('${cat}', '${params.id}')"
                id="cat-tab-${cat}">
                ${DB.CATEGORIES[cat].emoji} ${DB.CATEGORIES[cat].label.split('ที่')[0]}
              </button>`).join('')}
          </div>

          <!-- Filter tabs -->
          <div class="flex gap-2 mb-4" id="filter-tabs">
            ${[['all','ทั้งหมด'],['mine','ของฉัน'],['others','ของคนอื่น']].map(([val,lbl]) => `
              <button class="btn btn-sm ${val === activeFilter ? 'btn-primary' : 'btn-ghost'}"
                id="filter-${val}" onclick="Pages._spaceSetFilter('${val}', '${params.id}')">
                ${lbl}
              </button>`).join('')}
          </div>

          <!-- Wish list -->
          <div id="wish-list" class="flex flex-col gap-3">
            <!-- filled by renderWishes() -->
          </div>
        </div>
      </div>

      <!-- Bottom nav -->
      <div class="bottom-nav">
        <button class="bottom-nav-item" onclick="Router.navigate('/dashboard')">
          <span class="icon">🏠</span><span>หน้าหลัก</span>
        </button>
        <button class="bottom-nav-item" onclick="Router.navigate('/space/${params.id}/add')">
          <span class="icon">➕</span><span>เพิ่ม</span>
        </button>
        <button class="bottom-nav-item" onclick="Router.navigate('/space/${params.id}/roulette')">
          <span class="icon">🎲</span><span>สุ่ม!</span>
        </button>
        <button class="bottom-nav-item" onclick="Pages.showSpaceMenu('${params.id}')">
          <span class="icon">⚙️</span><span>ตั้งค่า</span>
        </button>
      </div>
    `);

    // Store state on window for onclick handlers
    window.__activeCategory = activeCategory;
    window.__activeFilter   = activeFilter;
    window.__renderWishes   = renderWishes;

    Pages._spaceSetCat    = (cat, spaceId)    => { window.__activeCategory = cat;    Pages._refreshSpaceUI(spaceId); };
    Pages._spaceSetFilter = (filter, spaceId) => { window.__activeFilter = filter;   Pages._refreshSpaceUI(spaceId); };
    Pages._refreshSpaceUI = (spaceId) => {
      activeCategory = window.__activeCategory;
      activeFilter   = window.__activeFilter;

      // Update tabs
      document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
      const catTab = document.getElementById('cat-tab-' + activeCategory);
      if (catTab) catTab.classList.add('active');

      ['all','mine','others'].forEach(f => {
        const btn = document.getElementById('filter-' + f);
        if (!btn) return;
        btn.className = `btn btn-sm ${f === activeFilter ? 'btn-primary' : 'btn-ghost'}`;
      });

      renderWishes();
    };

    renderWishes();
  },

  showWishDetail(wishId) {
    const wish = DB.Wishes.findById(wishId);
    if (!wish) return;
    const user = DB.Users.findById(wish.userId);
    const cat  = DB.CATEGORIES[wish.category];

    Modal.open(`
      <div class="text-center mb-4">
        <div style="font-size: 3rem;">${wish.emoji}</div>
        <h3 class="mt-3">${wish.title}</h3>
        ${wish.description ? `<p class="text-muted text-sm mt-2">${wish.description}</p>` : ''}
      </div>
      <div class="flex flex-col gap-2" style="background:var(--glass-bg);border-radius:var(--radius-md);padding:16px;">
        <div class="flex justify-between text-sm">
          <span class="text-muted">หมวดหมู่</span>
          <span>${cat.emoji} ${cat.label}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-muted">เพิ่มโดย</span>
          <span>${user?.displayName || 'ไม่ทราบ'}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-muted">วันที่</span>
          <span>${new Date(wish.createdAt).toLocaleDateString('th-TH')}</span>
        </div>
      </div>
      <button class="btn btn-ghost btn-full mt-4" onclick="Modal.close()">ปิด</button>
    `);
  },

  deleteWish(wishId, spaceId) {
    if (!confirm('ลบรายการนี้?')) return;
    DB.Wishes.delete(wishId);
    Toast.success('ลบแล้ว 🗑️');
    // Re-render wish list
    if (window.__renderWishes) window.__renderWishes();
  },

  showSpaceMenu(spaceId) {
    const session = DB.Session.get();
    const space   = DB.Spaces.findById(spaceId);
    if (!space) return;

    const isOwner = space.ownerId === session.userId;

    Modal.open(`
      <h3 class="mb-4">⚙️ ตั้งค่า Space</h3>

      <div class="invite-code-box mb-4">
        <div>
          <div class="text-xs text-muted mb-1">Invite Code</div>
          <div class="invite-code" style="font-size: 1.4rem; letter-spacing: 0.3em;">${space.inviteCode}</div>
        </div>
        <button class="btn btn-ghost btn-icon btn-sm" onclick="Pages.copyCode('${space.inviteCode}')">📋</button>
      </div>

      <div class="flex flex-col gap-2">
        <button class="btn btn-ghost btn-full" onclick="Modal.close(); Router.navigate('/space/${spaceId}/roulette')">
          🎲 ไปสุ่ม!
        </button>
        <button class="btn btn-ghost btn-full" onclick="Pages.leaveSpace('${spaceId}')">
          🚪 ออกจาก Space
        </button>
        ${isOwner ? `<button class="btn btn-danger btn-full" onclick="Pages.deleteSpace('${spaceId}')">🗑️ ลบ Space</button>` : ''}
      </div>
    `);
  },

  leaveSpace(spaceId) {
    const session = DB.Session.get();
    if (!confirm('ออกจาก Space นี้?')) return;
    DB.Spaces.removeMember(spaceId, session.userId);
    Modal.close();
    Toast.info('ออกจาก Space แล้ว');
    Router.navigate('/dashboard');
  },

  deleteSpace(spaceId) {
    if (!confirm('ลบ Space นี้? ข้อมูลทั้งหมดจะหายไป')) return;
    DB.Spaces.delete(spaceId);
    Modal.close();
    Toast.success('ลบ Space แล้ว');
    Router.navigate('/dashboard');
  },

  // ── Add Wish ──────────────────────────────────────────────────
  addWish({ params }) {
    const session = App.requireUserAuth();
    if (!session) return;

    const space = DB.Spaces.findById(params.id);
    if (!space || !space.memberIds.includes(session.userId)) {
      Router.navigate('/dashboard');
      return;
    }

    const emojiOptions = {
      item:  ['🎁','👜','💻','📱','🎮','👟','💄','📚','🎵','💍','⌚','🎸','🌸','💎','🧸','🎨'],
      food:  ['🍜','🍕','🍣','🍔','🍰','🧋','🍱','🍝','🍛','🥗','🍗','🦞','🌮','🧇','🍦','🍩'],
      place: ['🗼','🏖️','🏔️','🎡','🏯','🌋','🗽','🎪','🏝️','🏕️','🌃','🗺️','🎭','🛍️','🏟️','🌅'],
    };

    let selectedCat  = 'item';
    let selectedEmoji = '🎁';

    App.render(`
      <div class="bg-gradient"></div>

      <div class="page pb-24">
        <nav class="navbar">
          <button class="btn btn-ghost btn-icon" onclick="Router.back()">←</button>
          <h2>เพิ่มความปรารถนา</h2>
          <div style="width:40px;"></div>
        </nav>

        <div class="container" style="padding-top: 20px; max-width: 480px;">
          <form id="wish-form" class="flex flex-col gap-5">

            <!-- Category -->
            <div class="form-group">
              <label class="form-label">หมวดหมู่</label>
              <div class="flex flex-col gap-2" id="wish-cats">
                ${Object.values(DB.CATEGORIES).map(cat => `
                  <button type="button" class="category-chip ${cat.id === 'item' ? 'selected' : ''}"
                    id="cat-chip-${cat.id}" onclick="Pages._wishSelectCat('${cat.id}')">
                    ${cat.emoji} ${cat.label}
                  </button>`).join('')}
              </div>
            </div>

            <!-- Emoji picker -->
            <div class="form-group">
              <label class="form-label">ไอคอน <span id="sel-emoji" style="font-size:1.4rem;">🎁</span></label>
              <div id="emoji-grid" style="display:grid;grid-template-columns:repeat(8,1fr);gap:8px;">
                ${emojiOptions['item'].map(em => `
                  <button type="button" class="btn btn-ghost btn-icon emoji-btn" onclick="Pages._wishSelectEmoji('${em}')"
                    style="font-size:1.3rem;padding:8px;">${em}</button>`).join('')}
              </div>
            </div>

            <!-- Title -->
            <div class="form-group">
              <label class="form-label">ชื่อ <span class="text-danger">*</span></label>
              <input id="wish-title" type="text" class="form-input" required maxlength="80"
                placeholder="เช่น ยากิโทริ ห้าดาว, AirPods Pro">
            </div>

            <!-- Description -->
            <div class="form-group">
              <label class="form-label">รายละเอียด (ไม่บังคับ)</label>
              <textarea id="wish-desc" class="form-input form-textarea" maxlength="200"
                placeholder="เพิ่มรายละเอียด เช่น ราคา, ที่อยู่, สี..."></textarea>
            </div>

            <div id="add-error" class="form-error hidden"></div>

            <button type="submit" class="btn btn-accent btn-full btn-lg" id="add-btn">
              💫 เพิ่มความปรารถนา
            </button>
          </form>
        </div>
      </div>
    `);

    // Store emoji & category in closure
    Pages._wishSelectCat = (cat) => {
      selectedCat   = cat;
      selectedEmoji = DB.CATEGORIES[cat].emoji;
      document.getElementById('sel-emoji').textContent = selectedEmoji;

      document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('selected'));
      document.getElementById('cat-chip-' + cat)?.classList.add('selected');

      const grid = document.getElementById('emoji-grid');
      grid.innerHTML = emojiOptions[cat].map(em => `
        <button type="button" class="btn btn-ghost btn-icon emoji-btn" onclick="Pages._wishSelectEmoji('${em}')"
          style="font-size:1.3rem;padding:8px;">${em}</button>`).join('');
    };

    Pages._wishSelectEmoji = (em) => {
      selectedEmoji = em;
      document.getElementById('sel-emoji').textContent = em;
      document.querySelectorAll('.emoji-btn').forEach(b => {
        b.style.background = b.textContent.trim() === em ? 'rgba(124,58,237,0.3)' : '';
      });
    };

    document.getElementById('wish-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn     = document.getElementById('add-btn');
      const errorEl = document.getElementById('add-error');
      btn.disabled  = true;
      btn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;"></div>';

      await new Promise(r => setTimeout(r, 300));

      try {
        const title = document.getElementById('wish-title').value.trim();
        const desc  = document.getElementById('wish-desc').value.trim();
        if (!title) throw new Error('กรุณากรอกชื่อ');

        DB.Wishes.create({
          spaceId:     params.id,
          userId:      session.userId,
          category:    selectedCat,
          title,
          description: desc,
          emoji:       selectedEmoji,
        });

        Toast.success('เพิ่มความปรารถนาแล้ว! 💫');
        Router.navigate('/space/' + params.id);

      } catch (err) {
        errorEl.textContent = '⚠️ ' + err.message;
        errorEl.classList.remove('hidden');
        btn.disabled = false;
        btn.innerHTML = '💫 เพิ่มความปรารถนา';
      }
    });
  },

  // ── Roulette ──────────────────────────────────────────────────
  roulette({ params }) {
    const session = App.requireUserAuth();
    if (!session) return;

    const space = DB.Spaces.findById(params.id);
    if (!space || !space.memberIds.includes(session.userId)) {
      Router.navigate('/dashboard');
      return;
    }

    const members     = space.memberIds.map(id => DB.Users.findById(id)).filter(Boolean);
    const otherMembers = members.filter(m => m.id !== session.userId);

    let selectedCat    = 'food';
    let selectedTarget = 'others'; // for 1on1: 'others' | for group: 'all'
    let isSpinning     = false;
    let spinInterval   = null;
    let resultWish     = null;

    function getPool() {
      let wishes = [];
      if (space.type === '1on1') {
        // Spin from the OTHER person's list
        const otherId = otherMembers[0]?.id;
        if (otherId) {
          wishes = DB.Wishes.getForSpaceByCategory(space.id, selectedCat)
            .filter(w => w.userId === otherId);
        }
      } else {
        // Group: collect all members' wishes in this category
        wishes = DB.Wishes.getForSpaceByCategory(space.id, selectedCat);
      }
      return wishes;
    }

    function spin() {
      if (isSpinning) return;
      const pool = getPool();

      if (pool.length === 0) {
        Toast.error('ไม่มีรายการให้สุ่ม! เพิ่มข้อมูลก่อนนะ 😅');
        return;
      }

      isSpinning = true;
      resultWish = null;

      const displayEl  = document.getElementById('roulette-display');
      const textEl     = document.getElementById('roulette-text');
      const spinBtn    = document.getElementById('spin-btn');
      const resultArea = document.getElementById('result-area');

      displayEl.classList.add('spinning');
      spinBtn.disabled = true;
      spinBtn.innerHTML = '🌀 กำลังสุ่ม...';
      resultArea.innerHTML = '';

      let count     = 0;
      const maxCount = 25 + Math.floor(Math.random() * 15); // 25-40 flips
      const picked  = pool[Math.floor(Math.random() * pool.length)];

      // Flash phase
      textEl.classList.add('flash');
      spinInterval = setInterval(() => {
        const randomWish = pool[Math.floor(Math.random() * pool.length)];
        textEl.textContent = `${randomWish.emoji} ${randomWish.title}`;
        count++;

        if (count >= maxCount) {
          clearInterval(spinInterval);

          // Slow down phase
          setTimeout(() => {
            textEl.classList.remove('flash');
            textEl.textContent = `${picked.emoji} ${picked.title}`;
            textEl.classList.add('landing');
            displayEl.classList.remove('spinning');

            // Show result
            setTimeout(() => {
              isSpinning = false;
              resultWish = picked;
              spinBtn.disabled = false;
              spinBtn.innerHTML = '🎲 สุ่มใหม่อีกรอบ';
              showResult(picked);
            }, 600);

          }, 200);
        }
      }, 80);
    }

    function showResult(wish) {
      const resultArea = document.getElementById('result-area');
      const user       = DB.Users.findById(wish.userId);
      const cat        = DB.CATEGORIES[wish.category];
      const isMe       = wish.userId === session.userId;

      resultArea.innerHTML = `
        <div class="result-card mt-5">
          <div class="confetti-emoji">🎉</div>
          <div style="font-size: 2.5rem; margin: 12px 0;">${wish.emoji}</div>
          <h2 style="font-size: 1.4rem;">${wish.title}</h2>
          ${wish.description ? `<p class="text-muted text-sm mt-2">${wish.description}</p>` : ''}
          <div style="margin-top: 16px; padding: 12px; background: rgba(255,255,255,0.05); border-radius: var(--radius-md);">
            <div class="text-sm text-muted">หมวด: ${cat.emoji} ${cat.label}</div>
            <div class="text-sm text-muted mt-1">รายการของ: ${isMe ? '🙋 คุณ' : `👤 ${user?.displayName || 'ไม่ทราบ'}`}</div>
          </div>
          ${space.type === '1on1' && !isMe ? `
            <p class="text-sm mt-3" style="color: var(--clr-primary-lt);">
              💡 นี่คือสิ่งที่ ${user?.displayName} อยากได้/อยากกิน/อยากไป!
            </p>` : ''}
        </div>
      `;
    }

    App.render(`
      <div class="bg-gradient"></div>
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>

      <div class="page pb-24">
        <nav class="navbar">
          <button class="btn btn-ghost btn-icon" onclick="Router.back()">←</button>
          <div class="text-center">
            <h2>🎲 สุ่มเลย!</h2>
            <div class="text-xs text-muted">${space.name}</div>
          </div>
          <div style="width:40px;"></div>
        </nav>

        <div class="container" style="padding-top: 20px; max-width: 480px;">

          <!-- Category selector -->
          <div class="form-group mb-5">
            <label class="form-label">เลือกหมวดที่จะสุ่ม</label>
            <div class="flex flex-col gap-2" id="roulette-cats">
              ${Object.values(DB.CATEGORIES).map(cat => `
                <button type="button" class="category-chip ${cat.id === 'food' ? 'selected' : ''}"
                  id="rcat-${cat.id}" onclick="Pages._rouletteSelectCat('${cat.id}')">
                  ${cat.emoji} ${cat.label}
                  <span class="text-xs text-muted" id="rcat-count-${cat.id}"></span>
                </button>`).join('')}
            </div>
          </div>

          ${space.type === '1on1' && otherMembers.length > 0 ? `
            <div class="glass-card mb-5" style="padding: 14px 16px;">
              <p class="text-sm text-muted">🎯 จะสุ่มจากลิสต์ของ <strong>${otherMembers[0]?.displayName}</strong> เพื่อเซอร์ไพรส์!</p>
            </div>` : ''}

          ${space.type === 'group' ? `
            <div class="glass-card mb-5" style="padding: 14px 16px;">
              <p class="text-sm text-muted">👥 จะรวมลิสต์ของทุกคนแล้วสุ่ม 1 อย่าง</p>
            </div>` : ''}

          <!-- Roulette display -->
          <div class="roulette-display mb-5" id="roulette-display">
            <div class="roulette-item-text" id="roulette-text" style="color: var(--clr-text-muted);">
              กด "สุ่ม!" เพื่อเริ่ม
            </div>
          </div>

          <!-- Spin button -->
          <button class="btn btn-primary btn-full btn-lg" id="spin-btn"
            onclick="Pages._doSpin()" style="font-size: 1.2rem; padding: 18px;">
            🎲 สุ่ม!
          </button>

          <!-- Result area -->
          <div id="result-area"></div>

        </div>
      </div>

      <!-- Bottom nav -->
      <div class="bottom-nav">
        <button class="bottom-nav-item" onclick="Router.navigate('/dashboard')">
          <span class="icon">🏠</span><span>หน้าหลัก</span>
        </button>
        <button class="bottom-nav-item" onclick="Router.navigate('/space/${params.id}')">
          <span class="icon">📋</span><span>ลิสต์</span>
        </button>
        <button class="bottom-nav-item active">
          <span class="icon">🎲</span><span>สุ่ม!</span>
        </button>
        <button class="bottom-nav-item" onclick="Router.navigate('/space/${params.id}/add')">
          <span class="icon">➕</span><span>เพิ่ม</span>
        </button>
      </div>
    `);

    // Assign to Pages for onclick
    Pages._rouletteSelectCat = (cat) => {
      selectedCat = cat;
      document.querySelectorAll('[id^="rcat-"]').forEach(el => {
        if (!el.id.includes('count')) el.classList.remove('selected');
      });
      document.getElementById('rcat-' + cat)?.classList.add('selected');
      updateCounts();
    };

    Pages._doSpin = spin;

    function updateCounts() {
      Object.keys(DB.CATEGORIES).forEach(cat => {
        const countEl = document.getElementById('rcat-count-' + cat);
        if (!countEl) return;
        const pool = (() => {
          if (space.type === '1on1') {
            const otherId = otherMembers[0]?.id;
            return otherId ? DB.Wishes.getForSpaceByCategory(space.id, cat).filter(w => w.userId === otherId) : [];
          }
          return DB.Wishes.getForSpaceByCategory(space.id, cat);
        })();
        countEl.textContent = pool.length > 0 ? `(${pool.length} รายการ)` : '(ว่าง)';
      });
    }

    updateCounts();
  },

  // ── Profile page ──────────────────────────────────────────────
  profile({ }) {
    const session = App.requireUserAuth();
    if (!session) return;

    const user   = DB.Users.findById(session.userId);
    const spaces = DB.Spaces.getForUser(session.userId);
    const wishes = DB.Wishes.getAll().filter(w => w.userId === session.userId);

    App.render(`
      <div class="bg-gradient"></div>
      <div class="orb orb-2"></div>

      <div class="page pb-24">
        <nav class="navbar">
          <button class="btn btn-ghost btn-icon" onclick="Router.back()">←</button>
          <h2>โปรไฟล์</h2>
          <div style="width:40px;"></div>
        </nav>

        <div class="container" style="padding-top: 24px; max-width: 480px;">
          <!-- Profile card -->
          <div class="glass-card text-center mb-5" style="padding: 32px 24px;">
            <div style="font-size: 3.5rem; margin-bottom: 12px;">${user?.emoji || '🌸'}</div>
            <h2>${user?.displayName || session.displayName}</h2>
            <p class="text-muted text-sm mt-1">@${user?.username || session.username}</p>
            <p class="text-muted text-xs mt-1">${user?.email || ''}</p>

            <div class="flex justify-center gap-6 mt-5">
              <div class="text-center">
                <div style="font-size: 1.5rem; font-weight: 800;">${spaces.length}</div>
                <div class="text-xs text-muted">Spaces</div>
              </div>
              <div class="text-center">
                <div style="font-size: 1.5rem; font-weight: 800;">${wishes.length}</div>
                <div class="text-xs text-muted">ความปรารถนา</div>
              </div>
              <div class="text-center">
                <div style="font-size: 1.5rem; font-weight: 800;">
                  ${Object.keys(DB.CATEGORIES).reduce((m, cat) => {
                    const c = wishes.filter(w => w.category === cat).length;
                    return c > m.count ? { cat, count: c } : m;
                  }, { cat: '-', count: 0 }).count}
                </div>
                <div class="text-xs text-muted">มากที่สุด</div>
              </div>
            </div>
          </div>

          <!-- Category breakdown -->
          <div class="glass-card mb-5" style="padding: 20px;">
            <h3 class="mb-4" style="font-size: 0.95rem;">ความปรารถนาของฉัน</h3>
            ${Object.values(DB.CATEGORIES).map(cat => {
              const count = wishes.filter(w => w.category === cat.id).length;
              const pct   = wishes.length > 0 ? Math.round(count / wishes.length * 100) : 0;
              return `
                <div class="mb-3">
                  <div class="flex justify-between text-sm mb-1">
                    <span>${cat.emoji} ${cat.label}</span>
                    <span class="text-muted">${count} รายการ</span>
                  </div>
                  <div style="height: 6px; background: var(--glass-bg-md); border-radius: 3px; overflow: hidden;">
                    <div style="height: 100%; width: ${pct}%; background: linear-gradient(90deg, var(--clr-primary), var(--clr-accent)); border-radius: 3px; transition: width 1s ease;"></div>
                  </div>
                </div>`;
            }).join('')}
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-3">
            ${user?.role === 'admin' ? `
              <button class="btn btn-primary btn-full" onclick="Router.navigate('/admin')">
                👑 แผงควบคุมแอดมิน (Admin Panel)
              </button>
            ` : ''}
            <button class="btn btn-ghost btn-full" onclick="Pages.showAbout()">
              ℹ️ เกี่ยวกับ Wishy
            </button>
            <button class="btn btn-danger btn-full" onclick="Pages.confirmLogout()">
              🚪 ออกจากระบบ
            </button>
          </div>
        </div>
      </div>

      <nav class="bottom-nav">
        <button class="bottom-nav-item" onclick="Router.navigate('/dashboard')">
          <span class="icon">🏠</span><span>หน้าหลัก</span>
        </button>
        <button class="bottom-nav-item" onclick="Router.navigate('/create-space')">
          <span class="icon">✨</span><span>สร้าง</span>
        </button>
        <button class="bottom-nav-item" onclick="Pages.showJoinModal()">
          <span class="icon">🔑</span><span>เข้าร่วม</span>
        </button>
        <button class="bottom-nav-item active">
          <span class="icon">👤</span><span>โปรไฟล์</span>
        </button>
      </nav>
    `);
  },

  confirmLogout() {
    Modal.open(`
      <div class="text-center">
        <div style="font-size: 2.5rem; margin-bottom: 12px;">🚪</div>
        <h3 class="mb-2">ออกจากระบบ?</h3>
        <p class="text-muted text-sm mb-5">ข้อมูลของคุณยังคงอยู่ในอุปกรณ์นี้</p>
        <div class="flex gap-3">
          <button class="btn btn-ghost flex-1" onclick="Modal.close()">ยกเลิก</button>
          <button class="btn btn-danger flex-1" onclick="Pages._doLogout()">ออกจากระบบ</button>
        </div>
      </div>
    `);
  },

  _doLogout() {
    DB.Session.clear();
    Modal.close();
    Toast.info('ออกจากระบบแล้ว 👋');
    Router.navigate('/login', true);
  },

  showAbout() {
    Modal.open(`
      <div class="text-center">
        <div style="font-size: 2.5rem; margin-bottom: 8px;">🌸</div>
        <h3 class="text-gradient" style="font-size: 1.5rem; margin-bottom: 4px;">Wishy</h3>
        <p class="text-muted text-sm mb-4">พื้นที่ความปรารถนาของคุณ</p>
        <div class="glass-card text-left" style="padding: 16px; margin-bottom: 16px;">
          <div class="flex flex-col gap-2 text-sm">
            <div class="flex justify-between"><span class="text-muted">เวอร์ชัน</span><span>1.0.0</span></div>
            <div class="flex justify-between"><span class="text-muted">ข้อมูล</span><span>เก็บในอุปกรณ์</span></div>
            <div class="flex justify-between"><span class="text-muted">PWA</span><span>✅ รองรับ</span></div>
          </div>
        </div>
        <p class="text-xs text-muted">สร้างด้วย ❤️ สำหรับทุกความสัมพันธ์</p>
        <button class="btn btn-ghost btn-full mt-4" onclick="Modal.close()">ปิด</button>
      </div>
    `);
  },

  admin({ }) {
    const session = App.requireAuth();
    if (!session) return;
    if (session.role !== 'admin') {
      Toast.error('ไม่มีสิทธิ์เข้าถึงหน้านี้');
      Router.navigate('/dashboard', true);
      return;
    }

    const initialNormalUsers = DB.Users.getAll().filter(u => u.role !== 'admin' && u.username.toLowerCase() !== 'admin');

    function renderUserList() {
      const listEl = document.getElementById('admin-user-list');
      if (!listEl) return;

      const normalUsers = DB.Users.getAll().filter(u => u.role !== 'admin' && u.username.toLowerCase() !== 'admin');
      
      // Update count dynamically
      const countEl = document.getElementById('admin-user-count');
      if (countEl) {
        countEl.textContent = `${normalUsers.length} คน`;
      }

      if (normalUsers.length === 0) {
        listEl.innerHTML = `
          <div class="empty-state" style="padding: 40px 20px;">
            <div class="empty-icon">👥</div>
            <h3>ยังไม่มีผู้ใช้งานทั่วไป</h3>
            <p>เมื่อมีผู้สมัครสมาชิก รายชื่อจะแสดงที่นี่</p>
          </div>`;
        return;
      }

      listEl.innerHTML = normalUsers.map(u => {
        const userSpaces = DB.Spaces.getForUser(u.id);
        const userWishes = DB.Wishes.getAll().filter(w => w.userId === u.id);

        return `
          <div class="wish-item" style="cursor: default; align-items: flex-start; flex-direction: column; gap: var(--space-2); padding: var(--space-4);">
            <div class="flex items-center justify-between w-full">
              <div class="flex items-center gap-3">
                <div class="avatar avatar-md" style="background: linear-gradient(135deg, ${colorFromId(u.id)});">${u.emoji || '👤'}</div>
                <div>
                  <div style="font-weight: 700;">${u.displayName}</div>
                  <div class="text-xs text-muted">@${u.username}</div>
                </div>
              </div>
              <button class="btn btn-danger btn-sm shrink-0" onclick="Pages.deleteUserByAdmin('${u.id}')">
                ลบ 🗑️
              </button>
            </div>
            <div class="w-full mt-2" style="font-size: 0.82rem; border-top: 1px solid var(--clr-border); padding-top: 8px;">
              <div>📧 อีเมล: <span class="text-muted">${u.email}</span></div>
              <div>📅 สมัครเมื่อ: <span class="text-muted">${new Date(u.createdAt).toLocaleDateString('th-TH')}</span></div>
              <div class="flex gap-3 mt-1 text-xs text-muted">
                <span>📂 Spaces: <strong>${userSpaces.length}</strong></span>
                <span>💫 Wishes: <strong>${userWishes.length}</strong></span>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    App.render(`
      <div class="bg-gradient"></div>
      <div class="orb orb-1"></div>

      <div class="page pb-24">
        <!-- Header -->
        <nav class="navbar">
          <div class="navbar-logo">
            <span>👑</span>
            <span>แผงควบคุมแอดมิน</span>
          </div>
          <button class="btn btn-ghost btn-sm shrink-0" onclick="Pages.confirmLogout()">
            🚪 ออกจากระบบ
          </button>
        </nav>

        <div class="container" style="padding-top: 20px; max-width: 480px;">
          <!-- Summary card -->
          <div class="glass-card mb-5" style="padding: 20px;">
            <div class="flex justify-between items-center">
              <div>
                <h3 style="font-size: 0.95rem;" class="text-muted">จำนวนผู้สมัครทั้งหมด</h3>
                <div style="font-size: 2.2rem; font-weight: 800; color: var(--clr-primary);" class="mt-1" id="admin-user-count">${initialNormalUsers.length} คน</div>
              </div>
              <div style="font-size: 3rem;">👥</div>
            </div>
          </div>

          <h3 class="mb-3">รายชื่อสมาชิกทั้งหมด</h3>
          <div class="flex flex-col gap-3" id="admin-user-list">
            <!-- Rendered by renderUserList() -->
          </div>
        </div>
      </div>
    `);

    // Attach deletion logic to Pages
    Pages.deleteUserByAdmin = (userId) => {
      const user = DB.Users.findById(userId);
      if (!user) return;
      if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งาน "${user.displayName}" (@${user.username})?\nการดำเนินการนี้จะลบข้อมูล Spaces และ Wishes ทั้งหมดของผู้ใช้นี้ด้วย!`)) {
        try {
          DB.Users.delete(userId);
          Toast.success(`ลบผู้ใช้งาน "${user.displayName}" สำเร็จ 🗑️`);
          renderUserList();
        } catch (err) {
          Toast.error(err.message);
        }
      }
    };

    renderUserList();
  },

  joinSpace({ }) {
    Router.navigate('/dashboard');
  },
};

// ── Helpers ──────────────────────────────────────────────────────

function colorFromId(id) {
  const colors = [
    '#7c3aed, #5b21b6',
    '#ec4899, #be185d',
    '#2dd4bf, #0d9488',
    '#f59e0b, #d97706',
    '#6366f1, #4338ca',
    '#10b981, #059669',
  ];
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff;
  return colors[Math.abs(hash) % colors.length];
}

// ── Bootstrap ────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  Toast.init();
  App.init();
});
