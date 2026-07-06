"use client";
// src/components/layout.tsx
import React from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AppLayout({ children, activeTab }: { children: React.ReactNode; activeTab: string }) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="desktop-layout">
      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar">
        <div>
          {/* Logo */}
          <div className="navbar-logo" style={{ padding: "0 12px", marginBottom: 8 }}>
            <span>🌸</span>
            <span style={{ fontSize: "1.4rem", letterSpacing: "-0.03em" }}>Wishy</span>
          </div>

          {/* Nav Links */}
          <nav className="desktop-sidebar-nav">
            <Link href="/dashboard" className={`desktop-sidebar-item ${activeTab === "home" ? "active" : ""}`}>
              <span>🏠</span> หน้าหลัก
            </Link>
            <Link href="/profile" className={`desktop-sidebar-item ${activeTab === "profile" ? "active" : ""}`}>
              <span>👤</span> โปรไฟล์
            </Link>
          </nav>
        </div>

        {/* User profile & Logout */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", background: "rgba(255, 240, 246, 0.4)", borderRadius: 16 }}>
            <span style={{ fontSize: "1.8rem" }}>{(session?.user as any)?.emoji || "🌸"}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "#3d1a29", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {session?.user?.name}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#9e7088", fontWeight: 600 }}>
                {(session?.user as any)?.role === "admin" ? "👑 ผู้ดูแลระบบ" : "👤 สมาชิก"}
              </div>
            </div>
          </div>
          <button className="desktop-sidebar-item" onClick={handleLogout} style={{ color: "#dc2626", fontWeight: 700 }}>
            <span>🚪</span> ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="desktop-main">
        {children}

        {/* Mobile Bottom Navigation */}
        <nav className="bottom-nav">
          <Link href="/dashboard" className={`bottom-nav-item ${activeTab === "home" ? "active" : ""}`}>
            <span className="nav-icon">🏠</span>
            <span>หน้าหลัก</span>
          </Link>
          <Link href="/profile" className={`bottom-nav-item ${activeTab === "profile" ? "active" : ""}`}>
            <span className="nav-icon">👤</span>
            <span>โปรไฟล์</span>
          </Link>
        </nav>
      </main>
    </div>
  );
}
