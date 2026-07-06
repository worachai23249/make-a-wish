"use client";
// src/app/roulette/[spaceId]/page.tsx
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";

type Wish = { id: string; title: string; emoji: string; category: string; userId: string; user: { id: string; displayName: string; emoji: string } };
type Space = { id: string; name: string; emoji: string; wishes: Wish[] };

const CATEGORY_LABELS: Record<string, string> = { item: "🎁 สิ่งของ", food: "🍜 อาหาร", place: "📍 สถานที่" };

export default function RoulettePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const spaceId = params.spaceId as string;

  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("item");
  const [spinFilter, setSpinFilter] = useState<"all" | "others">("others");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Wish | null>(null);
  const [displayEmoji, setDisplayEmoji] = useState("🎰");
  const [spinKey, setSpinKey] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (status === "authenticated") fetchSpace();
  }, [status]);

  async function fetchSpace() {
    const res = await fetch(`/api/spaces/${spaceId}`);
    if (!res.ok) { router.replace("/dashboard"); return; }
    const data = await res.json();
    setSpace(data.space);
    setLoading(false);
  }

  const userId = session?.user?.id;
  const pool = (space?.wishes || []).filter((w) => {
    if (w.category !== category) return false;
    if (spinFilter === "others") return w.userId !== userId;
    return true;
  });

  function spin() {
    if (pool.length === 0 || spinning) return;
    setSpinning(true);
    setResult(null);
    setSpinKey((k) => k + 1);

    // Rapid shuffle animation
    let count = 0;
    const interval = setInterval(() => {
      const random = pool[Math.floor(Math.random() * pool.length)];
      setDisplayEmoji(random.emoji);
      count++;
      if (count > 20) {
        clearInterval(interval);
        const winner = pool[Math.floor(Math.random() * pool.length)];
        setDisplayEmoji(winner.emoji);
        setResult(winner);
        setSpinning(false);
      }
    }, 80);
  }

  if (loading || !space) {
    return (
      <div className="page-wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh" }}>
        <div><div className="spinner" /></div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <nav className="navbar">
        <button className="btn-ghost" style={{ padding: "8px 14px" }} onClick={() => router.push(`/space/${spaceId}`)}>← กลับ</button>
        <div style={{ fontWeight: 700 }}>🎰 สุ่มของขวัญ</div>
        <div style={{ width: 60 }} />
      </nav>

      <div className="page-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 24 }}>
        {/* Space name */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: "1.8rem" }}>{space.emoji}</div>
          <h2 style={{ fontWeight: 700, margin: "4px 0" }}>{space.name}</h2>
          <p style={{ color: "#9e7088", fontSize: "0.85rem" }}>มี {pool.length} รายการที่ตรงเงื่อนไข</p>
        </div>

        {/* Category select */}
        <div className="category-tabs" style={{ width: "100%", marginBottom: 12 }}>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <button
              key={k}
              className={`category-tab ${category === k ? "active" : ""}`}
              onClick={() => { setCategory(k); setResult(null); setDisplayEmoji("🎰"); }}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Spin Filter (All / Others) */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24, width: "100%", justifyContent: "center" }}>
          {[
            { value: "others", label: space.type === "1on1" ? "💑 สุ่มของอีกฝ่าย" : "👥 สุ่มของคนอื่น" },
            { value: "all", label: "✨ สุ่มรวมทั้งหมด" }
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => {
                if (spinning) return;
                setSpinFilter(item.value as any);
                setResult(null);
                setDisplayEmoji("🎰");
              }}
              style={{
                flex: 1,
                padding: "6px 12px",
                borderRadius: 50,
                border: `1.5px solid ${spinFilter === item.value ? "#f4306d" : "#ffd6e8"}`,
                background: spinFilter === item.value ? "rgba(244,48,109,0.08)" : "white",
                color: spinFilter === item.value ? "#f4306d" : "#9e7088",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: spinning ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                transition: "all 0.2s",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Wheel display */}
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.9)",
            border: "4px solid #ffc0dc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "5rem",
            boxShadow: "0 8px 40px rgba(244,48,109,0.2)",
            marginBottom: 28,
            transition: spinning ? "none" : "all 0.5s ease",
            animation: result && !spinning ? "bounce 0.5s ease" : "none",
          }}
          key={spinKey}
        >
          <span style={{ display: "inline-block", animation: spinning ? "spin-fast 0.08s linear infinite" : "float 2s ease-in-out infinite" }}>
            {displayEmoji}
          </span>
        </div>

        {/* Result */}
        {result && (
          <div className="glass" style={{ width: "100%", padding: 20, textAlign: "center", marginBottom: 20 }}>
            <p style={{ color: "#9e7088", fontSize: "0.82rem", marginBottom: 6 }}>ได้รับมาจาก</p>
            <div style={{ fontSize: "2rem", marginBottom: 6 }}>{result.emoji}</div>
            <h3 style={{ fontWeight: 800, fontSize: "1.2rem", color: "#3d1a29", margin: "0 0 6px" }}>{result.title}</h3>
            <div style={{ fontSize: "0.85rem", color: "#9e7088" }}>
              {result.user.emoji} {result.user.displayName} ตั้งไว้
            </div>
          </div>
        )}

        {/* Spin button */}
        <button
          className="btn-primary"
          style={{ width: "100%", fontSize: "1.1rem", padding: "14px" }}
          onClick={spin}
          disabled={spinning || pool.length === 0}
        >
          {spinning ? "🌀 กำลังสุ่ม..." : pool.length === 0 ? "ไม่มีรายการในหมวดนี้" : result ? "🎰 สุ่มใหม่อีกครั้ง" : "🎰 สุ่มเลย!"}
        </button>
      </div>

      <style>{`
        @keyframes spin-fast { to { transform: rotate(360deg); } }
        @keyframes bounce { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }
      `}</style>
    </div>
  );
}
