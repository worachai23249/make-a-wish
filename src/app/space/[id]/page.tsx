"use client";
// src/app/space/[id]/page.tsx
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import AppLayout from "@/components/layout";
import Avatar from "@/components/Avatar";
import Toast from "@/components/Toast";

const CATS = [
  { id: "item",  label: "สิ่งของ",  emoji: "🎁" },
  { id: "food",  label: "อาหาร",   emoji: "🍜" },
  { id: "place", label: "สถานที่", emoji: "📍" },
];

const EMOJIS: Record<string, string[]> = {
  item:  ["🎁","👜","💻","📱","🎮","👟","💄","📚","🎵","💍","⌚","🎸","🌸","💎","🧸","🎨"],
  food:  ["🍜","🍕","🍣","🍔","🍰","🧋","🍱","🍝","🍛","🥗","🍗","🦞","🌮","🧇","🍦","🍩"],
  place: ["🗼","🏖️","🏔️","🎡","🏯","🌋","🗽","🎪","🏝️","🏕️","🌃","🗺️","🎭","🛍️","🏟️","🌅"],
};

type Wish = {
  id: string; title: string; description?: string;
  emoji: string; category: string; userId: string;
  user: { id: string; displayName: string; emoji: string; avatarUrl?: string };
};

type Space = {
  id: string; name: string; type: string; emoji: string; inviteCode: string; ownerId: string;
  members: { user: { id: string; displayName: string; emoji: string; avatarUrl?: string } }[];
  wishes: Wish[];
};

export default function SpaceDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("item");
  const [activeFilter, setActiveFilter] = useState<"all" | "mine" | "others">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [wishForm, setWishForm] = useState({ title: "", description: "", emoji: "🎁", category: "item" });
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success"|"error"|"heart" } | null>(null);

  const fetchSpace = useCallback(async () => {
    const res = await fetch(`/api/spaces/${id}`);
    if (!res.ok) { router.replace("/dashboard"); return; }
    const d = await res.json();
    setSpace(d.space);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    if (status === "authenticated") {
      fetchSpace();
      const t = setInterval(fetchSpace, 3000);
      return () => clearInterval(t);
    }
  }, [status, id]);

  const showToast = (msg: string, type: "success"|"error"|"heart" = "success") =>
    setToast({ msg, type });

  async function handleAddWish(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading(true);
    const res = await fetch("/api/wishes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...wishForm, spaceId: id }),
    });
    const d = await res.json();
    setActionLoading(false);
    if (!res.ok) { showToast(d.error, "error"); return; }
    setShowAdd(false);
    setWishForm({ title: "", description: "", emoji: "🎁", category: "item" });
    showToast("เพิ่มความปรารถนาแล้ว 💫", "heart");
    fetchSpace();
  }

  async function handleDeleteWish(wishId: string) {
    if (!confirm("ต้องการลบรายการนี้?")) return;
    const res = await fetch(`/api/wishes/${wishId}`, { method: "DELETE" });
    if (res.ok) { showToast("ลบแล้ว 🗑️"); fetchSpace(); }
  }

  function copyCode() {
    if (!space) return;
    navigator.clipboard.writeText(space.inviteCode).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  }

  const userId = (session?.user as any)?.id;
  const filteredWishes = (space?.wishes || []).filter((w) => {
    if (w.category !== activeCategory) return false;
    if (activeFilter === "mine") return w.userId === userId;
    if (activeFilter === "others") return w.userId !== userId;
    return true;
  });

  const emojiList = EMOJIS[wishForm.category] || EMOJIS.item;

  if (loading || !space) return (
    <AppLayout>
      <div className="page-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
        <div className="spinner" />
      </div>
    </AppLayout>
  );

  const partner = space.members.find((m) => m.user.id !== userId);

  return (
    <AppLayout>
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      {/* Hero Header */}
      <div style={{
        background: "linear-gradient(135deg, var(--bg-alt), var(--surface))",
        borderBottom: "1px solid var(--border)",
        padding: "16px 20px 20px",
      }}>
        {/* Back + Actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => router.push("/dashboard")}>
            ← กลับ
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ เพิ่ม</button>
        </div>

        {/* Space Info */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: "linear-gradient(135deg, var(--primary-light), var(--primary))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "2rem", flexShrink: 0,
            boxShadow: "var(--shadow-pink)",
          }}>
            {space.emoji}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontWeight: 900, fontSize: "1.25rem", letterSpacing: "-0.03em", marginBottom: 4 }}>
              {space.name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span className={`badge ${space.type === "1on1" ? "badge-pink" : "badge-gold"}`}>
                {space.type === "1on1" ? "💑 1-on-1" : "👥 กลุ่ม"}
              </span>
              <button className="invite-code" onClick={copyCode}>
                {copied ? "✓ คัดลอกแล้ว!" : `🔗 ${space.inviteCode}`}
              </button>
            </div>
          </div>
        </div>

        {/* Members Row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.78rem", color: "var(--muted)", fontWeight: 600 }}>สมาชิก:</span>
          {space.members.map((m) => (
            <div key={m.user.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Avatar src={m.user.avatarUrl} emoji={m.user.emoji} displayName={m.user.displayName} size="sm" ring />
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-2)" }}>{m.user.displayName}</span>
            </div>
          ))}
        </div>

        {/* Roulette Button */}
        <button
          className="btn btn-primary btn-full"
          style={{ marginTop: 14 }}
          onClick={() => router.push(`/roulette/${id}`)}
        >
          🎰 สุ่มของขวัญ
        </button>
      </div>

      <div className="page-wrap" style={{ paddingTop: 16 }}>
        {/* Category Tabs */}
        <div className="tabs" style={{ marginBottom: 14 }}>
          {CATS.map((c) => {
            const count = (space.wishes || []).filter(w => w.category === c.id).length;
            return (
              <button key={c.id}
                className={`tab ${activeCategory === c.id ? "active" : ""}`}
                onClick={() => { setActiveCategory(c.id); setWishForm(f => ({ ...f, category: c.id, emoji: EMOJIS[c.id][0] })); }}
              >
                {c.emoji} {c.label}
                {count > 0 && <span style={{
                  background: activeCategory === c.id ? "var(--primary)" : "var(--border)",
                  color: activeCategory === c.id ? "white" : "var(--muted)",
                  borderRadius: 99, fontSize: "0.65rem", padding: "1px 6px", fontWeight: 800,
                }}>{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Filter (1on1: show "of partner") */}
        {space.type === "1on1" && partner && (
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {[
              { v: "all", l: "✨ ทั้งหมด" },
              { v: "others", l: `💑 ของ ${partner.user.displayName}` },
              { v: "mine", l: "👤 ของฉัน" },
            ].map(({ v, l }) => (
              <button key={v}
                onClick={() => setActiveFilter(v as any)}
                style={{
                  padding: "6px 14px", borderRadius: 99, border: "1.5px solid",
                  borderColor: activeFilter === v ? "var(--primary)" : "var(--border)",
                  background: activeFilter === v ? "rgba(232,84,122,0.07)" : "transparent",
                  color: activeFilter === v ? "var(--primary)" : "var(--muted)",
                  fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
              >{l}</button>
            ))}
          </div>
        )}

        {/* Wishes List */}
        <div className="wishes-list">
          {filteredWishes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💫</div>
              <h3>ยังไม่มีความปรารถนา</h3>
              <p>เพิ่มสิ่งที่อยากได้เลย!</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setShowAdd(true)}>+ เพิ่มเลย</button>
            </div>
          ) : (
            filteredWishes.map((wish) => (
              <div key={wish.id} className="wish-item" style={{ animationDelay: "0.05s" }}>
                <div className="wish-emoji">{wish.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", letterSpacing: "-0.01em" }}>{wish.title}</div>
                  {wish.description && (
                    <p style={{ fontSize: "0.82rem", color: "var(--muted)", margin: "2px 0 0", lineHeight: 1.5 }}>{wish.description}</p>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                    <Avatar src={wish.user.avatarUrl} emoji={wish.user.emoji} displayName={wish.user.displayName} size="xs" />
                    <span style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 600 }}>{wish.user.displayName}</span>
                  </div>
                </div>
                {wish.userId === userId && (
                  <button className="btn btn-danger" onClick={() => handleDeleteWish(wish.id)}>🗑️</button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Wish Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <h2 className="modal-title">💫 เพิ่มความปรารถนา</h2>
            <form onSubmit={handleAddWish} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Category */}
              <div className="tabs">
                {CATS.map((c) => (
                  <button key={c.id} type="button"
                    className={`tab ${wishForm.category === c.id ? "active" : ""}`}
                    onClick={() => setWishForm(f => ({ ...f, category: c.id, emoji: EMOJIS[c.id][0] }))}
                  >
                    {c.emoji} {c.label}
                  </button>
                ))}
              </div>

              {/* Emoji Picker */}
              <div className="form-group">
                <label className="form-label">เลือก Emoji</label>
                <div className="emoji-grid">
                  {emojiList.map((em) => (
                    <button key={em} type="button"
                      className={`emoji-btn ${wishForm.emoji === em ? "selected" : ""}`}
                      onClick={() => setWishForm(f => ({ ...f, emoji: em }))}
                    >{em}</button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">ชื่อรายการ</label>
                <input type="text" className="form-input" placeholder="เช่น iPhone 17 Pro"
                  value={wishForm.title} onChange={(e) => setWishForm(f => ({ ...f, title: e.target.value }))} required />
              </div>

              <div className="form-group">
                <label className="form-label">รายละเอียด <span style={{ color: "var(--muted)", fontWeight: 500 }}>(ไม่บังคับ)</span></label>
                <input type="text" className="form-input" placeholder="เช่น สีดำ 256GB"
                  value={wishForm.description} onChange={(e) => setWishForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="button" className="btn btn-ghost btn-full" onClick={() => setShowAdd(false)}>ยกเลิก</button>
                <button type="submit" className="btn btn-primary btn-full" disabled={actionLoading}>
                  {actionLoading ? "กำลังเพิ่ม..." : "เพิ่มเลย 💫"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
