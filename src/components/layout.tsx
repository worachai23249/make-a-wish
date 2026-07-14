"use client";
// src/components/layout.tsx
import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Avatar from "./Avatar";

interface NavItem {
  href: string;
  icon: string;
  label: string;
  key: string;
}

const NAV: NavItem[] = [
  { href: "/dashboard", icon: "🏠", label: "หน้าหลัก", key: "home" },
  { href: "/friends",   icon: "👥", label: "เพื่อน",    key: "friends" },
  { href: "/profile",   icon: "👤", label: "โปรไฟล์",   key: "profile" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const user = session?.user as any;

  const getActive = () => {
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/space")) return "home";
    if (pathname.startsWith("/friends")) return "friends";
    if (pathname.startsWith("/profile")) return "profile";
    return "home";
  };

  const active = getActive();

  return (
    <div className="app-shell">
      {/* ── Desktop Sidebar ── */}
      <aside className="sidebar">
        {/* Logo */}
        <div>
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">🌸</div>
            <span className="sidebar-logo-text">Make a Wish</span>
          </div>

          {/* Navigation */}
          <nav className="sidebar-nav">
            {NAV.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`sidebar-item ${active === item.key ? "active" : ""}`}
              >
                <span className="sidebar-item-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* User section */}
        <div>
          <div className="sidebar-user" onClick={() => router.push("/profile")}>
            <Avatar
              src={user?.avatarUrl}
              emoji={user?.emoji}
              displayName={user?.name}
              size="sm"
            />
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || "ผู้ใช้"}</div>
              <div className="sidebar-user-role">
                {user?.role === "admin" ? "👑 ผู้ดูแลระบบ" : `@${user?.username || ""}`}
              </div>
            </div>
          </div>
          <button
            className="sidebar-logout-btn"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            🚪 ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="main-content">
        {/* Mobile Topbar */}
        <header className="topbar">
          <div className="topbar-logo">
            <div className="topbar-logo-icon">🌸</div>
            <span className="topbar-logo-text">Make a Wish</span>
          </div>
          <button
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
            onClick={() => router.push("/profile")}
          >
            <Avatar
              src={user?.avatarUrl}
              emoji={user?.emoji}
              displayName={user?.name}
              size="sm"
              ring
            />
          </button>
        </header>

        {/* Page Content */}
        {children}

        {/* Mobile Bottom Navigation */}
        <nav className="bottom-nav">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`bottom-nav-item ${active === item.key ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
