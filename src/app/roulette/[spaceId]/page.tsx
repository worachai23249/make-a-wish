"use client";
// src/app/roulette/[spaceId]/page.tsx
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import AppLayout from "@/components/layout";
import Avatar from "@/components/Avatar";
import ConfettiHearts from "@/components/ConfettiHearts";

type Wish = {
  id: string; title: string; description?: string;
  emoji: string; category: string; userId: string;
  user: { id: string; displayName: string; emoji: string; avatarUrl?: string };
};
type Space = {
  id: string; name: string; type: string; emoji: string;
  wishes: Wish[];
  members: { user: { id: string; displayName: string; emoji: string; avatarUrl?: string } }[];
};

const CATS = [
  { id: "item", label: "สิ่งของ", emoji: "🎁" },
  { id: "food", label: "อาหาร",  emoji: "🍜" },
  { id: "place", label: "สถานที่", emoji: "📍" },
];

export default function RoulettePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { spaceId } = useParams<{ spaceId: string }>();

  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("item");
  const [spinFilter, setSpinFilter] = useState<"all" | "others">("others");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Wish | null>(null);
  const [displayEmoji, setDisplayEmoji] = useState("🎰");
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    if (status === "authenticated") fetchSpace();
  }, [status]);

  async function fetchSpace() {
    const res = await fetch(`/api/spaces/${spaceId}`);
    if (!res.ok) { router.replace("/dashboard"); return; }
    const d = await res.json();
    setSpace(d.space);
    setLoading(false);
  }

  const userId = (session?.user as any)?.id;
  const partner = space?.members.find((m) => m.user.id !== userId);

  const pool = (space?.wishes || []).filter((w) => {
    if (w.category !== category) return false;
    if (spinFilter === "others") return w.userId !== userId;
    return true;
  });

  function spin() {
    if (pool.length === 0 || spinning) return;
    setSpinning(true);
    setResult(null);
    setShowConfetti(false);

    let count = 0;
    const interval = setInterval(() => {
      const r = pool[Math.floor(Math.random() * pool.length)];
      setDisplayEmoji(r.emoji);
      count++;
      if (count > 20) {
        clearInterval(interval);
        const chosen = pool[Math.floor(Math.random() * pool.length)];
        setDisplayEmoji(chosen.emoji);
        setResult(chosen);
        setSpinning(false);
        setShowConfetti(true);
      }
    }, 80);
  }

  if (loading || !space) return (
    <AppLayout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
        <div className="spinner" />
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <ConfettiHearts show={showConfetti} />

      <div className="page-wrap" style={{ maxWidth: 500, margin: "0 auto" }}>
        {/* Back */}
        <button className="btn btn-ghost btn-sm" onClick={() => router.push(`/space/${spaceId}`)} style={{ marginBottom: 16 }}>
          ← กลับ
        </button>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: "2rem", marginBottom: 6 }}>{space.emoji}</div>
          <h1 style={{ fontWeight: 900, fontSize: "1.35rem", letterSpacing: "-0.04em" }}>
            🎰 สุ่มความปรารถนา
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: 4, fontWeight: 500 }}>
            {space.name}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="tabs" style={{ marginBottom: 16 }}>
          {CATS.map((c) => (
            <button key={c.id}
              className={`tab ${category === c.id ? "active" : ""}`}
              onClick={() => { setCategory(c.id); setResult(null); setDisplayEmoji("🎰"); }}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        {/* Spin Filter — 1on1 special */}
        {space.type === "1on1" && partner && (
          <div style={{ display: "flex", gap: 8, marginBottom: 20, justifyContent: "center" }}>
            {[
              { v: "others", l: `💑 ของ ${partner.user.displayName}` },
              { v: "all",    l: "✨ รวมทั้งหมด" },
            ].map(({ v, l }) => (
              <button key={v}
                onClick={() => { setSpinFilter(v as any); setResult(null); setDisplayEmoji("🎰"); }}
                style={{
                  padding: "8px 18px", borderRadius: 99, border: "1.5px solid",
                  borderColor: spinFilter === v ? "var(--primary)" : "var(--border)",
                  background: spinFilter === v ? "linear-gradient(135deg, rgba(232,84,122,0.1), rgba(249,168,201,0.15))" : "transparent",
                  color: spinFilter === v ? "var(--primary)" : "var(--muted)",
                  fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
              >{l}</button>
            ))}
          </div>
        )}

        {/* Roulette Card */}
        <div className={`roulette-card ${spinning ? "spinning" : ""}`} style={{
          background: result ? "linear-gradient(135deg, var(--bg-alt), var(--surface))" : "var(--surface)",
          borderColor: result ? "var(--primary-light)" : "var(--border)",
          marginBottom: 24,
          minHeight: 240,
        }}>
          <div className={`roulette-emoji ${spinning ? "" : result ? "spin-anim" : ""}`}>
            {displayEmoji}
          </div>

          {result ? (
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontWeight: 900, fontSize: "1.3rem", letterSpacing: "-0.03em", color: "var(--text)" }}>
                {result.title}
              </h2>
              {result.description && (
                <p style={{ color: "var(--text-2)", fontSize: "0.88rem", marginTop: 4 }}>{result.description}</p>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginTop: 12 }}>
                <Avatar src={result.user.avatarUrl} emoji={result.user.emoji} displayName={result.user.displayName} size="xs" />
                <span style={{ fontSize: "0.78rem", color: "var(--muted)", fontWeight: 600 }}>ความปรารถนาของ {result.user.displayName}</span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "var(--muted)", fontSize: "0.88rem", fontWeight: 600 }}>
                {pool.length === 0
                  ? "ไม่มีรายการในหมวดนี้"
                  : spinning ? "กำลังสุ่ม..." : `มี ${pool.length} รายการ • กด Spin เลย!`}
              </p>
            </div>
          )}
        </div>

        {/* Spin Button */}
        <button
          className="btn btn-primary btn-full btn-lg"
          onClick={spin}
          disabled={spinning || pool.length === 0}
          style={{
            fontSize: "1.05rem", letterSpacing: "0.01em",
            boxShadow: pool.length > 0 ? "0 8px 32px rgba(232, 84, 122, 0.35)" : "none",
          }}
        >
          {spinning ? (
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="spinner spinner-sm" style={{ borderTopColor: "white", borderColor: "rgba(255,255,255,0.3)" }} />
              กำลังสุ่ม...
            </span>
          ) : result ? "🔄 สุ่มใหม่" : "🎰 Spin!"}
        </button>

        {/* Pool Info */}
        {pool.length > 0 && (
          <div style={{
            marginTop: 20, padding: "12px 16px",
            background: "var(--bg-alt)", borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border)",
          }}>
            <div style={{ fontSize: "0.78rem", color: "var(--muted)", fontWeight: 700, marginBottom: 10, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              รายการในกลุ่มสุ่ม ({pool.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {pool.map((w) => (
                <div key={w.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 12px", background: "var(--surface)",
                  borderRadius: "var(--radius-md)",
                  border: result?.id === w.id ? "1.5px solid var(--primary)" : "1px solid var(--border)",
                  transition: "all 0.3s",
                }}>
                  <span style={{ fontSize: "1.2rem" }}>{w.emoji}</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.title}</span>
                  <Avatar src={w.user.avatarUrl} emoji={w.user.emoji} displayName={w.user.displayName} size="xs" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
