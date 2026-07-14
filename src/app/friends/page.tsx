"use client";
// src/app/friends/page.tsx
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout";
import Avatar from "@/components/Avatar";
import Toast from "@/components/Toast";

type UserResult = { id: string; displayName: string; username: string; emoji: string; avatarUrl?: string };
type FriendRecord = {
  id: string; status: string;
  sender: UserResult; receiver: UserResult;
};

export default function FriendsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [friends, setFriends] = useState<FriendRecord[]>([]);
  const [pending, setPending] = useState<FriendRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState("");
  const [searchResult, setSearchResult] = useState<UserResult | null | "not_found" | "self">(null);
  const [searching, setSearching] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success"|"error"|"heart" } | null>(null);

  const showToast = (msg: string, type: "success"|"error"|"heart" = "success") =>
    setToast({ msg, type });

  const fetchFriends = useCallback(async () => {
    const res = await fetch("/api/friends");
    if (res.ok) {
      const d = await res.json();
      setFriends(d.friends || []);
      setPending(d.pending || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    if (status === "authenticated") fetchFriends();
  }, [status]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQ.trim()) return;
    setSearching(true);
    setSearchResult(null);
    const res = await fetch(`/api/friends/search?q=${encodeURIComponent(searchQ.trim())}`);
    setSearching(false);
    if (res.status === 404) { setSearchResult("not_found"); return; }
    const d = await res.json();
    const me = (session?.user as any)?.id;
    setSearchResult(d.user.id === me ? "self" : d.user);
  }

  async function sendRequest(receiverId: string) {
    setActionLoading(receiverId);
    const res = await fetch("/api/friends/request", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId }),
    });
    const d = await res.json();
    setActionLoading(null);
    if (res.ok) {
      showToast("ส่งคำขอเป็นเพื่อนแล้ว 💌", "heart");
      setSearchQ(""); setSearchResult(null);
    } else { showToast(d.error || "ไม่สำเร็จ", "error"); }
  }

  async function respond(id: string, accept: boolean) {
    setActionLoading(id);
    await fetch("/api/friends/respond", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendshipId: id, accept }),
    });
    setActionLoading(null);
    showToast(accept ? "ยอมรับเป็นเพื่อนแล้ว 🌸" : "ปฏิเสธแล้ว", accept ? "heart" : "success");
    fetchFriends();
  }

  const me = (session?.user as any)?.id;

  const getOther = (f: FriendRecord) =>
    f.sender.id === me ? f.receiver : f.sender;

  if (loading) return (
    <AppLayout>
      <div className="page-wrap">
        {[1,2,3].map(i => (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
            <div className="skeleton skeleton-circle" style={{ width: 44, height: 44 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton skeleton-line" style={{ width: "60%", marginBottom: 8 }} />
              <div className="skeleton skeleton-line" style={{ width: "40%" }} />
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      <div className="page-wrap" style={{ maxWidth: 560, margin: "0 auto" }}>
        <h1 style={{ fontWeight: 900, fontSize: "1.6rem", letterSpacing: "-0.04em", marginBottom: 20 }}>
          👥 เพื่อนของฉัน
        </h1>

        {/* Search */}
        <div className="card card-body" style={{ marginBottom: 20 }}>
          <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-2)", marginBottom: 10 }}>
            🔍 เพิ่มเพื่อนด้วย Username
          </div>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              className="form-input"
              placeholder="ค้นหา username..."
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={searching}>
              {searching ? "..." : "ค้นหา"}
            </button>
          </form>

          {/* Search Result */}
          {searchResult && searchResult !== "not_found" && searchResult !== "self" && (
            <div className="friend-item" style={{ marginTop: 12 }}>
              <Avatar src={searchResult.avatarUrl} emoji={searchResult.emoji} displayName={searchResult.displayName} size="md" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{searchResult.displayName}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>@{searchResult.username}</div>
              </div>
              <button
                className="btn btn-primary btn-sm"
                disabled={actionLoading === searchResult.id}
                onClick={() => sendRequest(searchResult.id)}
              >
                {actionLoading === searchResult.id ? "..." : "เพิ่มเพื่อน 💌"}
              </button>
            </div>
          )}
          {searchResult === "not_found" && (
            <p style={{ marginTop: 10, color: "var(--muted)", fontSize: "0.85rem", textAlign: "center" }}>ไม่พบผู้ใช้นี้</p>
          )}
          {searchResult === "self" && (
            <p style={{ marginTop: 10, color: "var(--muted)", fontSize: "0.85rem", textAlign: "center" }}>นั่นคือตัวคุณเอง 😅</p>
          )}
        </div>

        {/* Pending Requests */}
        {pending.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div className="section-header">
              <span className="section-title">📬 คำขอเป็นเพื่อน</span>
              <span className="badge badge-pink">{pending.length}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {pending.map((f) => {
                const other = getOther(f);
                const isReceiver = f.receiver.id === me;
                return (
                  <div key={f.id} className="friend-item">
                    <Avatar src={other.avatarUrl} emoji={other.emoji} displayName={other.displayName} size="md" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{other.displayName}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>@{other.username}</div>
                      {!isReceiver && <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 2 }}>รอการตอบรับ...</div>}
                    </div>
                    {isReceiver && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={actionLoading === f.id}
                          onClick={() => respond(f.id, true)}
                        >✓ ยอมรับ</button>
                        <button
                          className="btn btn-danger"
                          disabled={actionLoading === f.id}
                          onClick={() => respond(f.id, false)}
                        >✕</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Friends List */}
        <div>
          <div className="section-header">
            <span className="section-title">🌸 รายชื่อเพื่อน</span>
            <span style={{ fontSize: "0.82rem", color: "var(--muted)", fontWeight: 600 }}>{friends.length} คน</span>
          </div>

          {friends.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>ยังไม่มีเพื่อน</h3>
              <p>ค้นหา username ของเพื่อนด้านบนเพื่อเพิ่มเพื่อน</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {friends.map((f) => {
                const other = getOther(f);
                return (
                  <div key={f.id} className="friend-item">
                    <Avatar src={other.avatarUrl} emoji={other.emoji} displayName={other.displayName} size="md" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{other.displayName}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>@{other.username}</div>
                    </div>
                    <span className="badge badge-green">เพื่อน ✓</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
