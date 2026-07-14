"use client";
// src/app/register/page.tsx
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const EMOJIS = ["🌸","🌻","🦋","🐱","🐶","🦊","🐰","🦄","🐼","🐨","🦁","🐸","🌈","⭐","💫","🍀","🎀","💎","🎸","🎮","🍓","🍰","🧸","🌙","☀️","🌺","🌷","🌻","🍁","🍄"];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    displayName: "",
    email: "",
    password: "",
    emoji: "🌸",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "เกิดข้อผิดพลาด");
    } else {
      router.replace("/login");
    }
  }

  return (
    <div className="auth-page">
      {/* Blobs */}
      <div className="auth-blob" style={{ width: 300, height: 300, background: "#DDB8FA", top: -100, right: -60 }} />
      <div className="auth-blob" style={{ width: 200, height: 200, background: "#F9A8C9", bottom: -50, left: -40, animationDelay: "2s" }} />

      <div className="auth-card" style={{ maxWidth: 440 }}>
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">🌸</div>
          <span className="auth-logo-text">Wishy</span>
          <p className="auth-subtitle">สร้างบัญชีและเริ่มแบ่งปันความปรารถนา</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Emoji Picker */}
          <div className="form-group">
            <label className="form-label">เลือก Emoji ประจำตัว</label>
            <div style={{
              padding: "12px",
              background: "var(--bg-alt)",
              borderRadius: "var(--radius-md)",
              border: "1.5px solid var(--border)",
              maxHeight: 120,
              overflowY: "auto",
            }}>
              <div className="emoji-grid">
                {EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    className={`emoji-btn ${form.emoji === em ? "selected" : ""}`}
                    onClick={() => setForm({ ...form, emoji: em })}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ textAlign: "center", marginTop: 8, fontSize: "1.6rem" }}>
              {form.emoji} <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 600 }}>Emoji ของคุณ</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">ชื่อเล่น</label>
            <input
              id="reg-displayName"
              type="text"
              className="form-input"
              placeholder="เช่น กิ๊ฟจัง"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              id="reg-username"
              type="text"
              className="form-input"
              placeholder="gift_chan (ตัวอักษร ตัวเลข _)"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              pattern="[a-zA-Z0-9_]+"
            />
          </div>

          <div className="form-group">
            <label className="form-label">อีเมล</label>
            <input
              id="reg-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">รหัสผ่าน (อย่างน้อย 6 ตัว)</label>
            <div style={{ position: "relative" }}>
              <input
                id="reg-password"
                type={showPw ? "text" : "password"}
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                style={{ paddingRight: 48 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: "absolute", right: 14, top: "50%",
                  transform: "translateY(-50%)", background: "none",
                  border: "none", cursor: "pointer", fontSize: "1.1rem",
                }}
              >
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              padding: "10px 14px", background: "#FEF2F2",
              border: "1px solid #FECACA", borderRadius: 12,
              color: "#DC2626", fontSize: "0.85rem", fontWeight: 600,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              ✕ {error}
            </div>
          )}

          <button
            id="reg-submit"
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading ? "กำลังสร้างบัญชี..." : "สมัครสมาชิก 🌸"}
          </button>

          <div className="divider">มีบัญชีแล้ว?</div>

          <Link href="/login" className="btn btn-secondary btn-full" style={{ textAlign: "center" }}>
            เข้าสู่ระบบ →
          </Link>
        </form>
      </div>
    </div>
  );
}
