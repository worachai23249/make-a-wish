"use client";
// src/app/login/page.tsx
import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });
    setLoading(false);
    if (res?.error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    } else {
      router.replace("/dashboard");
    }
  }

  return (
    <div className="auth-page">
      {/* Decorative blobs */}
      <div className="auth-blob" style={{ width: 280, height: 280, background: "#F9A8C9", top: -80, left: -60 }} />
      <div className="auth-blob" style={{ width: 220, height: 220, background: "#DDB8FA", bottom: -60, right: -40, animationDelay: "3s" }} />
      <div className="auth-blob" style={{ width: 180, height: 180, background: "#FDBA74", bottom: 100, left: -30, animationDelay: "1.5s" }} />

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">🌸</div>
          <span className="auth-logo-text">Make a Wish</span>
          <p className="auth-subtitle">แบ่งปันความปรารถนาของคุณ</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-group">
            <label className="form-label">อีเมล</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">รหัสผ่าน</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div style={{
              padding: "10px 14px",
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: 12,
              color: "#DC2626",
              fontSize: "0.85rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              ✕ {error}
            </div>
          )}

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="spinner spinner-sm" style={{ borderTopColor: "white", borderColor: "rgba(255,255,255,0.3)" }} />
                กำลังเข้าสู่ระบบ...
              </span>
            ) : "เข้าสู่ระบบ ✨"}
          </button>

          <div className="divider">หรือ</div>

          <Link
            href="/register"
            className="btn btn-secondary btn-full"
            style={{ textAlign: "center" }}
          >
            สมัครสมาชิกใหม่ 🌸
          </Link>
        </form>
      </div>
    </div>
  );
}
