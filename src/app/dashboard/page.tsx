"use client";
// src/app/dashboard/page.tsx
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout";
import Avatar from "@/components/Avatar";
import Toast from "@/components/Toast";

type SpaceMember = { user: { id: string; displayName: string; emoji: string; avatarUrl?: string } };
type Space = {
  id: string; name: string; type: string; emoji: string;
  inviteCode: string; ownerId: string;
  members: SpaceMember[];
  _count: { wishes: number };
};

const SPACE_EMOJIS = ["💕","🌸","🎁","🎂","🦋","🌟","🎊","🏡","🌈","💫","🎀","🍓","🌻","🎸","🍕","🌴"];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [createForm, setCreateForm] = useState({ name: "", type: "1on1", emoji: "💕" });
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success"|"error"|"info"|"heart" } | null>(null);

  const fetchSpaces = useCallback(async () => {
    const res = await fetch("/api/spaces");
    if (res.ok) {
      const d = await res.json();
      setSpaces(d.spaces || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    if (status === "authenticated") {
      const u = session?.user as any;
      if (u?.role === "admin") { router.replace("/admin"); return; }
      fetchSpaces();
      const interval = setInterval(fetchSpaces, 5000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const showToast = (msg: string, type: "success"|"error"|"info"|"heart" = "success") =>
    setToast({ msg, type });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading(true);
    const res = await fetch("/api/spaces", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm),
    });
    const d = await res.json();
    setActionLoading(false);
    if (!res.ok) { showToast(d.error, "error"); return; }
    setShowCreate(false);
    setCreateForm({ name: "", type: "1on1", emoji: "💕" });
    showToast("สร้าง Space สำเร็จ 🌸", "heart");
    router.push(`/space/${d.space.id}`);
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading(true);
    const res = await fetch("/api/spaces/join", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode: joinCode }),
    });
    const d = await res.json();
    setActionLoading(false);
    if (!res.ok) { showToast(d.error, "error"); return; }
    setShowJoin(false);
    setJoinCode("");
    showToast("เข้าร่วม Space สำเร็จ 🎉", "heart");
    router.push(`/space/${d.spaceId}`);
  }

  const user = session?.user as any;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "อรุณสวัสดิ์" : hour < 17 ? "สวัสดีตอนบ่าย" : "สวัสดีตอนเย็น";

  if (loading) return (
    <AppLayout>
      <div className="page-wrap">
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 20 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton skeleton-card" />)}
        </div>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      {/* Desktop Header */}
      <div className="desktop-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <Avatar src={user?.avatarUrl} emoji={user?.emoji} displayName={user?.name} size="md" />
            <div>
              <div style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 600 }}>{greeting} 👋</div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 900, letterSpacing: "-0.04em", color: "var(--text)" }}>
                {user?.name || "ผู้ใช้"}
              </h1>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowJoin(true)}>🔑 เข้าร่วม</button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>+ สร้าง Space</button>
        </div>
      </div>

      <div className="page-wrap" style={{ paddingTop: 16 }}>
        {/* Section */}
        <div className="section-header" style={{ marginBottom: 16, marginTop: 8 }}>
          <h2 className="section-title">💕 Spaces ของฉัน</h2>
          <span style={{ fontSize: "0.82rem", color: "var(--muted)", fontWeight: 600 }}>{spaces.length} spaces</span>
        </div>

        {spaces.length === 0 ? (
          <div className="empty-state" style={{ padding: "60px 24px" }}>
            <div className="empty-icon">🌙</div>
            <h3>ยังไม่มี Space</h3>
            <p>สร้างหรือเข้าร่วม Space เพื่อแบ่งปันความปรารถนากับคนพิเศษ</p>
            <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "center" }}>
              <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>+ สร้างใหม่</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowJoin(true)}>🔑 เข้าร่วม</button>
            </div>
          </div>
        ) : (
          <div className="spaces-grid">
            {spaces.map((space) => (
              <div key={space.id} className="space-card card-clickable" onClick={() => router.push(`/space/${space.id}`)}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 16,
                      background: "linear-gradient(135deg, var(--bg-alt), var(--border))",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.8rem", flexShrink: 0,
                    }}>
                      {space.emoji}
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 800, fontSize: "0.98rem", letterSpacing: "-0.02em" }}>{space.name}</h3>
                      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                        <span className={`badge ${space.type === "1on1" ? "badge-pink" : "badge-gold"}`}>
                          {space.type === "1on1" ? "💑 1-on-1" : "👥 กลุ่ม"}
                        </span>
                        {space.ownerId === session?.user?.id && (
                          <span className="badge badge-purple">👑 เจ้าของ</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span style={{ color: "var(--muted-light)", fontSize: "1.2rem" }}>›</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", gap: -4 }}>
                    {space.members.slice(0, 5).map((m, i) => (
                      <div key={i} style={{ marginLeft: i > 0 ? -8 : 0 }}>
                        <Avatar
                          src={m.user.avatarUrl}
                          emoji={m.user.emoji}
                          displayName={m.user.displayName}
                          size="xs"
                          ring
                        />
                      </div>
                    ))}
                    {space.members.length > 5 && (
                      <div className="avatar avatar-xs" style={{ marginLeft: -8, background: "var(--border)", color: "var(--muted)", fontSize: "0.6rem", fontWeight: 800 }}>
                        +{space.members.length - 5}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: "0.78rem", color: "var(--muted)", fontWeight: 600 }}>
                    💫 {space._count.wishes} ความปรารถนา
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB — Mobile */}
      <button className="fab" onClick={() => setShowCreate(true)} style={{ fontSize: "1.6rem" }}>+</button>

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2 className="modal-title">✨ สร้าง Space ใหม่</h2>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Emoji */}
              <div className="form-group">
                <label className="form-label">Emoji ของ Space</label>
                <div className="emoji-grid">
                  {SPACE_EMOJIS.map((em) => (
                    <button key={em} type="button"
                      className={`emoji-btn ${createForm.emoji === em ? "selected" : ""}`}
                      onClick={() => setCreateForm({ ...createForm, emoji: em })}
                    >{em}</button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">ชื่อ Space</label>
                <input type="text" className="form-input" placeholder="เช่น ของขวัญวันเกิด 🎂"
                  value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">ประเภท</label>
                <div style={{ display: "flex", gap: 10 }}>
                  {[{ v: "1on1", l: "💑 คู่ (1-on-1)" }, { v: "group", l: "👥 กลุ่ม" }].map(({ v, l }) => (
                    <button key={v} type="button"
                      onClick={() => setCreateForm({ ...createForm, type: v })}
                      style={{
                        flex: 1, padding: "12px 8px", borderRadius: 14,
                        border: `2px solid ${createForm.type === v ? "var(--primary)" : "var(--border)"}`,
                        background: createForm.type === v ? "rgba(232,84,122,0.07)" : "var(--surface)",
                        color: createForm.type === v ? "var(--primary)" : "var(--muted)",
                        fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
                        transition: "all 0.2s", fontFamily: "inherit",
                      }}
                    >{l}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="button" className="btn btn-ghost btn-full" onClick={() => setShowCreate(false)}>ยกเลิก</button>
                <button type="submit" className="btn btn-primary btn-full" disabled={actionLoading}>
                  {actionLoading ? "กำลังสร้าง..." : "สร้าง Space 🌸"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Modal */}
      {showJoin && (
        <div className="modal-overlay" onClick={() => setShowJoin(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2 className="modal-title">🔑 เข้าร่วม Space</h2>
            <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="form-group">
                <label className="form-label">รหัสเชิญ</label>
                <input type="text" className="form-input"
                  placeholder="ABC123"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  required
                  style={{ textTransform: "uppercase", letterSpacing: 6, fontWeight: 800, fontSize: "1.2rem", textAlign: "center" }}
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="btn btn-ghost btn-full" onClick={() => setShowJoin(false)}>ยกเลิก</button>
                <button type="submit" className="btn btn-primary btn-full" disabled={actionLoading}>
                  {actionLoading ? "กำลังเข้าร่วม..." : "เข้าร่วม 🎉"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
