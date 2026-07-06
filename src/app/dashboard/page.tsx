"use client";
// src/app/dashboard/page.tsx
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Space = {
  id: string;
  name: string;
  type: string;
  emoji: string;
  inviteCode: string;
  ownerId: string;
  members: { user: { id: string; displayName: string; emoji: string } }[];
  _count: { wishes: number };
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoin, setShowJoin] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [createForm, setCreateForm] = useState({ name: "", type: "1on1" });
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (status === "authenticated") {
      if ((session.user as any).role === "admin") {
        router.replace("/admin");
      } else {
        fetchSpaces();
        const interval = setInterval(fetchSpaces, 5000); // Poll every 5 seconds for dashboard updates
        return () => clearInterval(interval);
      }
    }
  }, [status]);

  function showToast(msg: string, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchSpaces() {
    const res = await fetch("/api/spaces");
    const data = await res.json();
    setSpaces(data.spaces || []);
    setLoading(false);
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading(true);
    const res = await fetch("/api/spaces/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode: joinCode }),
    });
    const data = await res.json();
    setActionLoading(false);
    if (!res.ok) {
      showToast(data.error, "error");
    } else {
      setShowJoin(false);
      setJoinCode("");
      showToast("เข้าร่วม Space สำเร็จ 🎉");
      fetchSpaces();
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading(true);
    const res = await fetch("/api/spaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm),
    });
    const data = await res.json();
    setActionLoading(false);
    if (!res.ok) {
      showToast(data.error, "error");
    } else {
      setShowCreate(false);
      setCreateForm({ name: "", type: "1on1" });
      showToast("สร้าง Space สำเร็จ ✨");
      fetchSpaces();
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="page-wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh" }}>
        <div><div className="spinner" /><p style={{ textAlign: "center", color: "#9e7088", marginTop: 16 }}>กำลังโหลด...</p></div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
        </div>
      )}

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-logo">
          <span>🌸</span>
          <span>Wishy</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "1.4rem" }}>{(session?.user as any)?.emoji || "🌸"}</span>
          <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#3d1a29" }}>
            {session?.user?.name}
          </span>
        </div>
      </nav>

      <div className="page-content">
        <div style={{ paddingTop: 20 }}>
          {spaces.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🌙</div>
              <h3>ยังไม่มีพื้นที่ความสัมพันธ์</h3>
              <p>สร้างหรือเข้าร่วม Space แรกของคุณเลย!</p>
              <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setShowCreate(true)}>
                + สร้าง Space ใหม่
              </button>
            </div>
          ) : (
            <div className="spaces-list">
              {spaces.map((space) => (
                <div key={space.id} className="space-card" onClick={() => router.push(`/space/${space.id}`)}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: "1.8rem" }}>{space.emoji}</span>
                      <div>
                        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: 0 }}>{space.name}</h3>
                        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                          <span className={`badge ${space.type === "1on1" ? "badge-primary" : "badge-gold"}`}>
                            {space.type === "1on1" ? "💑 1-on-1" : "👥 กลุ่ม"}
                          </span>
                          {space.ownerId === session?.user?.id && (
                            <span className="badge badge-gold">👑 เจ้าของ</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span style={{ color: "#9e7088", fontSize: "1.2rem" }}>›</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                    <div style={{ display: "flex", gap: -4 }}>
                      {space.members.slice(0, 4).map((m, i) => (
                        <div
                          key={i}
                          className="avatar avatar-sm"
                          title={m.user.displayName}
                          style={{ marginLeft: i > 0 ? -8 : 0, border: "2px solid white" }}
                        >
                          {m.user.emoji}
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#9e7088" }}>
                      💫 {space._count.wishes} ความปรารถนา
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        <Link href="/dashboard" className="bottom-nav-item active">
          <span className="nav-icon">🏠</span>
          <span>หน้าหลัก</span>
        </Link>
        <button className="bottom-nav-item" onClick={() => setShowCreate(true)}>
          <span className="nav-icon">✨</span>
          <span>สร้าง</span>
        </button>
        <button className="bottom-nav-item" onClick={() => setShowJoin(true)}>
          <span className="nav-icon">🔑</span>
          <span>เข้าร่วม</span>
        </button>
        <Link href="/profile" className="bottom-nav-item">
          <span className="nav-icon">👤</span>
          <span>โปรไฟล์</span>
        </Link>
      </nav>

      {/* Create Space Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontWeight: 700, marginBottom: 20, textAlign: "center" }}>✨ สร้างพื้นที่ใหม่</h3>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="form-label">ชื่อ Space</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="เช่น ของขวัญวันเกิด"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">ประเภท</label>
                <div style={{ display: "flex", gap: 10 }}>
                  {[{ value: "1on1", label: "💑 คู่รัก/เพื่อน 1-on-1 (2 คน)" }, { value: "group", label: "👥 กลุ่ม (ไม่เกิน 10 คน)" }].map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setCreateForm({ ...createForm, type: t.value })}
                      style={{
                        flex: 1,
                        padding: "10px 8px",
                        borderRadius: 12,
                        border: `2px solid ${createForm.type === t.value ? "#f4306d" : "#ffd6e8"}`,
                        background: createForm.type === t.value ? "rgba(244,48,109,0.08)" : "white",
                        color: createForm.type === t.value ? "#f4306d" : "#9e7088",
                        fontWeight: 600,
                        fontSize: "0.78rem",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        fontFamily: "inherit",
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowCreate(false)}>ยกเลิก</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={actionLoading}>
                  {actionLoading ? "กำลังสร้าง..." : "สร้าง Space"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Space Modal */}
      {showJoin && (
        <div className="modal-overlay" onClick={() => setShowJoin(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontWeight: 700, marginBottom: 20, textAlign: "center" }}>🔑 เข้าร่วม Space</h3>
            <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="form-label">รหัสเชิญ</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="เช่น ABC123"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  required
                  style={{ textTransform: "uppercase", letterSpacing: 4, fontWeight: 700, fontSize: "1.1rem" }}
                />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowJoin(false)}>ยกเลิก</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={actionLoading}>
                  {actionLoading ? "กำลังเข้าร่วม..." : "เข้าร่วม"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
