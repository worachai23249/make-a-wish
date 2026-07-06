"use client";
// src/app/register/page.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", displayName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
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
      router.replace("/login?registered=1");
    }
  }

  return (
    <div className="page-wrapper">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100dvh",
          padding: "24px",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: "3rem", marginBottom: 8 }}>🌸</div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#f4306d", margin: 0 }}>Wishy</h1>
          <p style={{ color: "#9e7088", fontSize: "0.88rem", marginTop: 4 }}>สมัครสมาชิกเพื่อเริ่มแชร์ความปรารถนา</p>
        </div>

        <div className="glass" style={{ width: "100%", padding: "28px 24px" }}>
          <h2 style={{ fontWeight: 700, marginBottom: 20, fontSize: "1.1rem" }}>สมัครสมาชิกใหม่ ✨</h2>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className="form-label">ชื่อเล่น / Display Name</label>
              <input
                type="text"
                name="displayName"
                className="form-input"
                placeholder="เช่น กิ๊ฟจัง"
                value={form.displayName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="form-label">Username</label>
              <input
                type="text"
                name="username"
                className="form-input"
                placeholder="เช่น gift_chan (ไม่มีช่องว่าง)"
                value={form.username}
                onChange={handleChange}
                required
                pattern="[a-zA-Z0-9_]+"
                title="ใช้ได้เฉพาะตัวอักษร ตัวเลข และ _"
              />
            </div>

            <div>
              <label className="form-label">อีเมล</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="your@email.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="form-label">รหัสผ่าน (อย่างน้อย 6 ตัว)</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  name="password"
                  className="form-input"
                  placeholder="••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  style={{ paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1.1rem",
                  }}
                >
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && (
              <p
                style={{
                  color: "#dc2626",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: "0.88rem",
                  margin: 0,
                }}
              >
                ⚠️ {error}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%", marginTop: 4 }}
              disabled={loading}
            >
              {loading ? "กำลังสร้างบัญชี..." : "สมัครสมาชิก 🌸"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 18, fontSize: "0.9rem", color: "#9e7088" }}>
            มีบัญชีแล้ว?{" "}
            <Link href="/login" style={{ color: "#f4306d", fontWeight: 700, textDecoration: "none" }}>
              เข้าสู่ระบบ →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
