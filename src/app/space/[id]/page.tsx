"use client";
// src/app/space/[id]/page.tsx
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import AppLayout from "@/components/layout";

const CATEGORIES = [
  { id: "item", label: "สิ่งของ", emoji: "🎁" },
  { id: "food", label: "อาหาร", emoji: "🍜" },
  { id: "place", label: "สถานที่", emoji: "📍" },
];

const ITEM_EMOJIS  = ["🎁","👜","💻","📱","🎮","👟","💄","📚","🎵","💍","⌚","🎸","🌸","💎","🧸","🎨"];
const FOOD_EMOJIS  = ["🍜","🍕","🍣","🍔","🍰","🧋","🍱","🍝","🍛","🥗","🍗","🦞","🌮","🧇","🍦","🍩"];
const PLACE_EMOJIS = ["🗼","🏖️","🏔️","🎡","🏯","🌋","🗽","🎪","🏝️","🏕️","🌃","🗺️","🎭","🛍️","🏟️","🌅"];

type Wish = {
  id: string;
  title: string;
  description?: string;
  emoji: string;
  category: string;
  userId: string;
  user: { id: string; displayName: string; emoji: string };
  createdAt: string;
};

type Space = {
  id: string;
  name: string;
  type: string;
  emoji: string;
  inviteCode: string;
  ownerId: string;
  members: { user: { id: string; displayName: string; emoji: string; username: string } }[];
  wishes: Wish[];
};

export default function SpaceDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("item");
  const [activeFilter, setActiveFilter] = useState<"all" | "mine" | "others">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [wishForm, setWishForm] = useState({ title: "", description: "", emoji: "🎁", category: "item" });
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (status === "authenticated") {
      fetchSpace();
      const interval = setInterval(fetchSpace, 3000); // Poll every 3 seconds for real-time sync
      return () => clearInterval(interval);
    }
  }, [status, id]);

  function showToast(msg: string, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchSpace() {
    const res = await fetch(`/api/spaces/${id}`);
    if (!res.ok) { router.replace("/dashboard"); return; }
    const data = await res.json();
    setSpace(data.space);
    setLoading(false);
  }

  async function handleAddWish(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading(true);
    const res = await fetch("/api/wishes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...wishForm, spaceId: id }),
    });
    const data = await res.json();
    setActionLoading(false);
    if (!res.ok) {
      showToast(data.error, "error");
    } else {
      setShowAdd(false);
      setWishForm({ title: "", description: "", emoji: "🎁", category: "item" });
      showToast("เพิ่มความปรารถนาแล้ว 💫");
      fetchSpace();
    }
  }

  async function handleDeleteWish(wishId: string) {
    if (!confirm("ต้องการลบรายการนี้?")) return;
    const res = await fetch(`/api/wishes/${wishId}`, { method: "DELETE" });
    if (res.ok) { showToast("ลบแล้ว 🗑️"); fetchSpace(); }
  }

  async function handleDeleteSpace() {
    if (!confirm(`ต้องการลบ Space "${space?.name}"? ข้อมูลทั้งหมดจะหายไป`)) return;
    const res = await fetch(`/api/spaces/${id}`, { method: "DELETE" });
    if (res.ok) { showToast("ลบ Space แล้ว"); router.replace("/dashboard"); }
  }

  function copyCode() {
    if (!space) return;
    navigator.clipboard.writeText(space.inviteCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const emojiList = activeCategory === "item" ? ITEM_EMOJIS : activeCategory === "food" ? FOOD_EMOJIS : PLACE_EMOJIS;
  const userId = session?.user?.id;

  const filteredWishes = (space?.wishes || []).filter((w) => {
    if (w.category !== activeCategory) return false;
    if (activeFilter === "mine") return w.userId === userId;
    if (activeFilter === "others") return w.userId !== userId;
    return true;
  });

  if (loading || !space) {
    return (
      <div className="page-wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh" }}>
        <div><div className="spinner" /><p style={{ textAlign: "center", color: "#9e7088", marginTop: 16 }}>กำลังโหลด...</p></div>
      </div>
    );
  }

  return (
    <AppLayout activeTab="home">
      <div className="page-wrapper">
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
        </div>
      )}

      <nav className="navbar">
        <button className="btn-ghost" style={{ padding: "8px 14px" }} onClick={() => router.push("/dashboard")}>← กลับ</button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 700 }}>{space.emoji} {space.name}</div>
          <div style={{ fontSize: "0.75rem", color: "#9e7088" }}>{space.members.length} สมาชิก</div>
        </div>
        <button className="btn-ghost" style={{ padding: "8px 12px" }} onClick={copyCode}>
          {copied ? "✓ คัดลอก" : `🔑 ${space.inviteCode}`}
        </button>
      </nav>

      <div className="page-content">
        {/* Members */}
        <div style={{ display: "flex", gap: 10, padding: "16px 0 8px", overflowX: "auto" }}>
          {space.members.map((m) => (
            <div key={m.user.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 52 }}>
              <div
                className="avatar avatar-md"
                style={{
                  border: `3px solid ${m.user.id === userId ? "#f4306d" : "transparent"}`,
                  boxShadow: m.user.id === userId ? "0 0 0 2px rgba(244,48,109,0.2)" : "none",
                }}
              >
                {m.user.emoji}
              </div>
              <span style={{ fontSize: "0.7rem", color: "#9e7088", textAlign: "center", lineHeight: 1.2 }}>
                {m.user.displayName.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>

        {/* Category Tabs */}
        <div className="category-tabs" style={{ margin: "12px 0" }}>
          {CATEGORIES.map((cat) => {
            const count = space.wishes.filter((w) => w.category === cat.id).length;
            return (
              <button
                key={cat.id}
                className={`category-tab ${activeCategory === cat.id ? "active" : ""}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.emoji} {cat.label}
                {count > 0 && (
                  <span style={{
                    background: activeCategory === cat.id ? "#f4306d" : "#9e7088",
                    color: "white",
                    borderRadius: 50,
                    padding: "1px 6px",
                    fontSize: "0.68rem",
                  }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filter */}
        {space.type !== "1on1" && (
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {[["all", "ทั้งหมด"], ["mine", "ของฉัน"], ["others", "ของเขา"]].map(([v, label]) => (
              <button
                key={v}
                onClick={() => setActiveFilter(v as any)}
                style={{
                  padding: "5px 12px",
                  borderRadius: 50,
                  border: `1px solid ${activeFilter === v ? "#f4306d" : "#ffd6e8"}`,
                  background: activeFilter === v ? "rgba(244,48,109,0.08)" : "transparent",
                  color: activeFilter === v ? "#f4306d" : "#9e7088",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Wishes */}
        <div className="wishes-list">
          {filteredWishes.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 0" }}>
              <div className="empty-icon">💫</div>
              <h3>ยังไม่มีความปรารถนา</h3>
              <p>เพิ่มรายการแรกของคุณเลย!</p>
            </div>
          ) : (
            filteredWishes.map((wish) => (
              <div key={wish.id} className="wish-item">
                <span style={{ fontSize: "2rem" }}>{wish.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{wish.title}</div>
                  {wish.description && <p style={{ fontSize: "0.82rem", color: "#9e7088", margin: "2px 0 0", lineHeight: 1.4 }}>{wish.description}</p>}
                  <div style={{ fontSize: "0.72rem", color: "#9e7088", marginTop: 4 }}>
                    {wish.user.emoji} {wish.user.displayName}
                  </div>
                </div>
                {wish.userId === userId && (
                  <button className="btn-danger" onClick={() => handleDeleteWish(wish.id)}>🗑️</button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Roulette & Delete */}
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            className="btn-primary"
            style={{ width: "100%" }}
            onClick={() => router.push(`/roulette/${id}`)}
          >
            🎰 สุ่มของขวัญ
          </button>
          {space.ownerId === userId && (
            <button className="btn-danger" style={{ width: "100%", padding: "10px" }} onClick={handleDeleteSpace}>
              🗑️ ลบ Space นี้
            </button>
          )}
        </div>
      </div>

      {/* Add Wish FAB */}
      <button
        onClick={() => setShowAdd(true)}
        style={{
          position: "fixed",
          bottom: 80,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #f4306d, #ff7eb3)",
          color: "white",
          border: "none",
          fontSize: "1.5rem",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(244,48,109,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s",
          zIndex: 90,
        }}
      >
        +
      </button>

      {/* Add Wish Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontWeight: 700, marginBottom: 20, textAlign: "center" }}>💫 เพิ่มความปรารถนา</h3>
            <form onSubmit={handleAddWish} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Category select */}
              <div>
                <label className="form-label">หมวดหมู่</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        const e = cat.id === "item" ? "🎁" : cat.id === "food" ? "🍜" : "📍";
                        setWishForm({ ...wishForm, category: cat.id, emoji: e });
                      }}
                      style={{
                        flex: 1,
                        padding: "8px 4px",
                        borderRadius: 10,
                        border: `2px solid ${wishForm.category === cat.id ? "#f4306d" : "#ffd6e8"}`,
                        background: wishForm.category === cat.id ? "rgba(244,48,109,0.08)" : "white",
                        color: wishForm.category === cat.id ? "#f4306d" : "#9e7088",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Emoji picker */}
              <div>
                <label className="form-label">ไอคอน</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {emojiList.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setWishForm({ ...wishForm, emoji: em })}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        border: `2px solid ${wishForm.emoji === em ? "#f4306d" : "#ffd6e8"}`,
                        background: wishForm.emoji === em ? "rgba(244,48,109,0.08)" : "white",
                        fontSize: "1.2rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label">ชื่อรายการ</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="เช่น iPhone 16 Pro"
                  value={wishForm.title}
                  onChange={(e) => setWishForm({ ...wishForm, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">รายละเอียด (ไม่บังคับ)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="เช่น สีไหน ราคาเท่าไหร่"
                  value={wishForm.description}
                  onChange={(e) => setWishForm({ ...wishForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>ยกเลิก</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={actionLoading}>
                  {actionLoading ? "กำลังเพิ่ม..." : "เพิ่มเลย 💫"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </AppLayout>
  );
}
