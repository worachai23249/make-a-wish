"use client";
// src/app/admin/page.tsx
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  emoji: string;
  createdAt: string;
  _count: { memberships: number; wishes: number };
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [addForm, setAddForm] = useState({ username: "", displayName: "", email: "", password: "" });
  const [editForm, setEditForm] = useState({ displayName: "", email: "", password: "" });
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    if (status === "authenticated") {
      if ((session.user as any).role !== "admin") { router.replace("/dashboard"); return; }
      fetchUsers();
    }
  }, [status]);

  function showToast(msg: string, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  }

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setActionLoading(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    const data = await res.json();
    setActionLoading(false);
    if (!res.ok) { setFormError(data.error); return; }
    setShowAdd(false);
    setAddForm({ username: "", displayName: "", email: "", password: "" });
    showToast(`สร้างผู้ใช้งาน "${addForm.displayName}" สำเร็จ 🎉`);
    fetchUsers();
  }

  async function handleEditUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editUser) return;
    setFormError("");
    setActionLoading(true);
    const res = await fetch(`/api/admin/users/${editUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    const data = await res.json();
    setActionLoading(false);
    if (!res.ok) { setFormError(data.error); return; }
    setEditUser(null);
    showToast("แก้ไขข้อมูลสำเร็จ ✨");
    fetchUsers();
  }

  async function handleDeleteUser(user: User) {
    if (!confirm(`ลบ "${user.displayName}" (@${user.username})?\nข้อมูล Spaces และ Wishes จะหายทั้งหมด`)) return;
    const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) { showToast(data.error, "error"); return; }
    showToast(`ลบ "${user.displayName}" สำเร็จ 🗑️`);
    fetchUsers();
  }

  if (loading) return (
    <div className="page-wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh" }}>
      <div><div className="spinner" /><p style={{ textAlign: "center", color: "#9e7088", marginTop: 16 }}>กำลังโหลด...</p></div>
    </div>
  );

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    background: "rgba(255,240,246,0.8)",
    border: "1.5px solid #ffd6e8",
    borderRadius: 12,
    fontSize: "0.93rem",
    color: "#3d1a29",
    fontFamily: "inherit",
    outline: "none",
  } as React.CSSProperties;

  return (
    <div className="page-wrapper">
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
        </div>
      )}

      <nav className="navbar">
        <div className="navbar-logo">
          <span>👑</span>
          <span>แผงควบคุมแอดมิน</span>
        </div>
        <button className="btn-ghost" style={{ fontSize: "0.82rem", padding: "8px 14px" }} onClick={() => signOut({ callbackUrl: "/login" })}>
          🚪 ออก
        </button>
      </nav>

      <div className="page-content" style={{ paddingTop: 20 }}>
        {/* Stats card */}
        <div className="glass" style={{ padding: 20, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ color: "#9e7088", fontSize: "0.85rem", margin: 0 }}>จำนวนผู้สมัครทั้งหมด</p>
            <div style={{ fontSize: "2.4rem", fontWeight: 800, color: "#f4306d", lineHeight: 1.1 }}>
              {users.length} คน
            </div>
          </div>
          <div style={{ fontSize: "3rem" }}>👥</div>
        </div>

        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontWeight: 700 }}>รายชื่อสมาชิก</h3>
          <button className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.85rem" }} onClick={() => { setShowAdd(true); setFormError(""); }}>
            ➕ เพิ่มผู้ใช้
          </button>
        </div>

        {/* User list */}
        {users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>ยังไม่มีผู้ใช้งานทั่วไป</h3>
            <p>กดปุ่มด้านบนเพื่อเพิ่มผู้ใช้งาน</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {users.map((user) => (
              <div key={user.id} className="glass-sm" style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div className="avatar avatar-md">{user.emoji}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{user.displayName}</div>
                      <div style={{ color: "#9e7088", fontSize: "0.78rem" }}>@{user.username}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn-ghost" style={{ padding: "6px 12px", fontSize: "0.8rem" }} onClick={() => { setEditUser(user); setEditForm({ displayName: user.displayName, email: user.email, password: "" }); setFormError(""); }}>
                      ✏️
                    </button>
                    <button className="btn-danger" onClick={() => handleDeleteUser(user)}>🗑️</button>
                  </div>
                </div>
                <div style={{ marginTop: 10, borderTop: "1px solid #ffd6e8", paddingTop: 10, fontSize: "0.8rem", color: "#9e7088" }}>
                  <div>📧 {user.email}</div>
                  <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
                    <span>📅 {new Date(user.createdAt).toLocaleDateString("th-TH")}</span>
                    <span>📂 Spaces: <strong>{user._count.memberships}</strong></span>
                    <span>💫 Wishes: <strong>{user._count.wishes}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontWeight: 700, marginBottom: 20, textAlign: "center" }}>➕ เพิ่มผู้ใช้งานใหม่</h3>
            <form onSubmit={handleAddUser} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "ชื่อเล่น (Display Name)", key: "displayName", placeholder: "เช่น กิ๊ฟจัง" },
                { label: "Username", key: "username", placeholder: "เช่น gift_chan" },
                { label: "อีเมล", key: "email", placeholder: "gift@email.com", type: "email" },
                { label: "รหัสผ่าน", key: "password", placeholder: "อย่างน้อย 6 ตัว", type: "password" },
              ].map(({ label, key, placeholder, type = "text" }) => (
                <div key={key}>
                  <label className="form-label">{label}</label>
                  <input
                    type={type}
                    style={inputStyle}
                    placeholder={placeholder}
                    value={(addForm as any)[key]}
                    onChange={(e) => setAddForm({ ...addForm, [key]: e.target.value })}
                    required
                  />
                </div>
              ))}
              {formError && <p style={{ color: "#dc2626", fontSize: "0.85rem", background: "#fef2f2", padding: "8px 12px", borderRadius: 8, margin: 0 }}>⚠️ {formError}</p>}
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>ยกเลิก</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={actionLoading}>{actionLoading ? "กำลังสร้าง..." : "สร้างผู้ใช้"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="modal-overlay" onClick={() => setEditUser(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontWeight: 700, marginBottom: 20, textAlign: "center" }}>✏️ แก้ไขข้อมูล</h3>
            <form onSubmit={handleEditUser} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label className="form-label">Username (แก้ไขไม่ได้)</label>
                <input style={{ ...inputStyle, opacity: 0.6 }} value={`@${editUser.username}`} disabled />
              </div>
              {[
                { label: "ชื่อเล่น (Display Name)", key: "displayName", placeholder: "ชื่อแสดงผล" },
                { label: "อีเมล", key: "email", placeholder: "อีเมล", type: "email" },
                { label: "รหัสผ่านใหม่ (ปล่อยว่างถ้าไม่เปลี่ยน)", key: "password", placeholder: "รหัสผ่านใหม่", type: "password" },
              ].map(({ label, key, placeholder, type = "text" }) => (
                <div key={key}>
                  <label className="form-label">{label}</label>
                  <input
                    type={type}
                    style={inputStyle}
                    placeholder={placeholder}
                    value={(editForm as any)[key]}
                    onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                    required={key !== "password"}
                  />
                </div>
              ))}
              {formError && <p style={{ color: "#dc2626", fontSize: "0.85rem", background: "#fef2f2", padding: "8px 12px", borderRadius: 8, margin: 0 }}>⚠️ {formError}</p>}
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setEditUser(null)}>ยกเลิก</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={actionLoading}>{actionLoading ? "กำลังบันทึก..." : "บันทึก"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
