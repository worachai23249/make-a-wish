"use client";
// src/app/profile/page.tsx
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status]);

  if (status === "loading") return (
    <div className="page-wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh" }}>
      <div className="spinner" />
    </div>
  );

  const user = session?.user as any;

  return (
    <div className="page-wrapper">
      <nav className="navbar">
        <button className="btn-ghost" style={{ padding: "8px 14px" }} onClick={() => router.push("/dashboard")}>← กลับ</button>
        <div style={{ fontWeight: 700 }}>โปรไฟล์</div>
        <div style={{ width: 60 }} />
      </nav>

      <div className="page-content" style={{ paddingTop: 24 }}>
        {/* Avatar */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
          <div
            className="avatar avatar-xl"
            style={{
              background: "linear-gradient(135deg, #ffc0dc, #f4306d)",
              marginBottom: 12,
              fontSize: "2.5rem",
            }}
          >
            {user?.emoji}
          </div>
          <h2 style={{ fontWeight: 800, margin: 0, fontSize: "1.4rem" }}>{user?.name}</h2>
          <p style={{ color: "#9e7088", margin: "4px 0" }}>@{user?.username}</p>
          <p style={{ color: "#9e7088", fontSize: "0.85rem" }}>{user?.email}</p>
        </div>

        {/* Cards */}
        <div className="glass" style={{ padding: 20, marginBottom: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span style={{ color: "#9e7088" }}>อีเมล</span>
              <span style={{ fontWeight: 600 }}>{user?.email}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span style={{ color: "#9e7088" }}>Username</span>
              <span style={{ fontWeight: 600 }}>@{user?.username}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span style={{ color: "#9e7088" }}>บทบาท</span>
              <span className="badge badge-primary">{user?.role === "admin" ? "👑 Admin" : "👤 User"}</span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          className="btn-primary"
          style={{
            width: "100%",
            background: "linear-gradient(135deg, #dc2626, #ef4444)",
            marginTop: 20,
          }}
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          🚪 ออกจากระบบ
        </button>

        {/* Bottom spacer */}
        <div style={{ height: 20 }} />
      </div>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        <Link href="/dashboard" className="bottom-nav-item">
          <span className="nav-icon">🏠</span>
          <span>หน้าหลัก</span>
        </Link>
        <Link href="/dashboard" className="bottom-nav-item">
          <span className="nav-icon">✨</span>
          <span>สร้าง</span>
        </Link>
        <Link href="/dashboard" className="bottom-nav-item">
          <span className="nav-icon">🔑</span>
          <span>เข้าร่วม</span>
        </Link>
        <Link href="/profile" className="bottom-nav-item active">
          <span className="nav-icon">👤</span>
          <span>โปรไฟล์</span>
        </Link>
      </nav>
    </div>
  );
}
