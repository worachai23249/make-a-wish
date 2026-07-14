"use client";
// src/app/profile/page.tsx
import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout";
import Avatar from "@/components/Avatar";
import Toast from "@/components/Toast";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success"|"error"|"heart" } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status]);

  const user = session?.user as any;

  const showToast = (msg: string, type: "success"|"error"|"heart" = "success") =>
    setToast({ msg, type });

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("ไฟล์ต้องไม่เกิน 5MB", "error"); return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      const res = await fetch("/api/profile/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: base64 }),
      });
      setUploading(false);
      if (res.ok) {
        router.refresh();
        showToast("อัปโหลดรูปโปรไฟล์สำเร็จ 🌸", "heart");
      } else {
        showToast("อัปโหลดไม่สำเร็จ", "error");
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleUpdateName() {
    if (!newName.trim()) return;
    const res = await fetch("/api/profile/name", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: newName.trim() }),
    });
    if (res.ok) {
      router.refresh();
      setEditName(false);
      showToast("เปลี่ยนชื่อสำเร็จ ✨");
    } else {
      showToast("เปลี่ยนชื่อไม่สำเร็จ", "error");
    }
  }

  if (status === "loading") return (
    <AppLayout>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
        <div className="spinner" />
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      <div className="page-wrap" style={{ maxWidth: 520, margin: "0 auto" }}>
        {/* Avatar Section */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          paddingTop: 32, paddingBottom: 24, gap: 12,
        }}>
          <div className="avatar-upload-wrapper">
            <Avatar
              src={user?.avatarUrl}
              emoji={user?.emoji}
              displayName={user?.name}
              size="2xl"
              ring
            />
            <button
              className="avatar-upload-btn"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              title="เปลี่ยนรูปโปรไฟล์"
            >
              {uploading ? "⏳" : "📷"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarUpload}
            />
          </div>

          {editName ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center", width: "100%", maxWidth: 260 }}>
              <input
                className="form-input"
                defaultValue={user?.name}
                autoFocus
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUpdateName()}
                style={{ textAlign: "center", fontWeight: 700 }}
              />
              <button className="btn btn-primary btn-sm" onClick={handleUpdateName}>✓</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditName(false)}>✕</button>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 900, letterSpacing: "-0.04em" }}>{user?.name}</h1>
                <button
                  className="btn btn-icon"
                  style={{ width: 32, height: 32, fontSize: "0.85rem" }}
                  onClick={() => { setNewName(user?.name || ""); setEditName(true); }}
                  title="แก้ไขชื่อ"
                >✏️</button>
              </div>
              <p style={{ color: "var(--muted)", fontSize: "0.88rem", fontWeight: 600 }}>@{user?.username}</p>
            </div>
          )}

          <span className={`badge ${user?.role === "admin" ? "badge-gold" : "badge-pink"}`}>
            {user?.role === "admin" ? "👑 ผู้ดูแลระบบ" : "🌸 สมาชิก"}
          </span>
        </div>

        {/* Info Card */}
        <div className="card card-body" style={{ marginBottom: 14, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 600 }}>อีเมล</span>
            <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>{user?.email}</span>
          </div>
          <div style={{ height: 1, background: "var(--border)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 600 }}>Username</span>
            <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>@{user?.username}</span>
          </div>
          <div style={{ height: 1, background: "var(--border)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 600 }}>Emoji</span>
            <span style={{ fontSize: "1.4rem" }}>{user?.emoji}</span>
          </div>
        </div>

        {/* Logout */}
        <button
          className="btn btn-full"
          style={{
            background: "rgba(220, 38, 38, 0.07)",
            color: "#DC2626",
            border: "1.5px solid rgba(220, 38, 38, 0.2)",
            borderRadius: "var(--radius-full)",
            padding: "13px",
            fontWeight: 700,
            fontSize: "0.9rem",
            marginBottom: 32,
          }}
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          🚪 ออกจากระบบ
        </button>
      </div>
    </AppLayout>
  );
}
