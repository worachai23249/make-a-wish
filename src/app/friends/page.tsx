'use client';

import { useState, useEffect } from 'react';
import { Search, UserPlus, Check, X, UserX, Users, Clock, Sparkles } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { useConfirm } from '@/components/ConfirmDialog';

interface FriendUser {
    id: string;
    username: string;
    displayName: string;
    emoji: string;
    avatarUrl: string | null;
}

interface FriendItem {
    friendshipId: string;
    user: FriendUser;
    since?: string;
}

interface PendingItem {
    friendshipId: string;
    user: FriendUser;
    requestedAt?: string;
}

interface SearchResult extends FriendUser {
    friendship: {
        id: string;
        status: string;
        isSender: boolean;
    } | null;
}

export default function FriendsPage() {
    const { showToast } = useToast();
    const { showConfirm } = useConfirm();

    const [friends, setFriends] = useState<FriendItem[]>([]);
    const [pendingIncoming, setPendingIncoming] = useState<PendingItem[]>([]);
    const [pendingOutgoing, setPendingOutgoing] = useState<PendingItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);

    const fetchFriends = async () => {
        try {
            const res = await fetch('/api/friends');
            if (res.ok) {
                const data = await res.json();
                setFriends(data.friends || []);
                setPendingIncoming(data.pendingIncoming || []);
                setPendingOutgoing(data.pendingOutgoing || []);
            }
        } catch {
            showToast('error', 'ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลเพื่อนได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFriends();
    }, []);

    // Search users by @username
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        const query = searchQuery.trim().replace(/^@/, '');
        if (!query) return;

        setSearching(true);
        try {
            const res = await fetch(`/api/friends?search=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data.users || []);
            }
        } catch {
            showToast('error', 'เกิดข้อผิดพลาดในการค้นหา');
        } finally {
            setSearching(false);
        }
    };

    // Send friend request
    const handleSendRequest = async (targetUser: FriendUser) => {
        try {
            const res = await fetch('/api/friends', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiverId: targetUser.id }),
            });

            if (res.ok) {
                showToast('success', 'ส่งคำขอเป็นเพื่อนแล้ว!', `ส่งคำขอถึง @${targetUser.username}`);
                fetchFriends();
                // update search result state
                setSearchResults((prev) =>
                    prev.map((u) =>
                        u.id === targetUser.id
                            ? { ...u, friendship: { id: 'temp', status: 'pending', isSender: true } }
                            : u
                    )
                );
            } else {
                const err = await res.json();
                showToast('error', 'ไม่สามารถส่งคำขอได้', err.error);
            }
        } catch {
            showToast('error', 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
        }
    };

    // Accept / Decline request
    const handleRespondRequest = async (friendshipId: string, status: 'accepted' | 'declined', username: string) => {
        try {
            const res = await fetch(`/api/friends/${friendshipId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });

            if (res.ok) {
                if (status === 'accepted') {
                    showToast('success', 'เป็นเพื่อนกันแล้ว! 🎉', `คุณได้ตอบรับคำขอจาก @${username}`);
                } else {
                    showToast('info', 'ปฏิเสธคำขอเรียบร้อย');
                }
                fetchFriends();
            } else {
                showToast('error', 'เกิดข้อผิดพลาด');
            }
        } catch {
            showToast('error', 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
        }
    };

    // Remove friend or cancel request
    const handleRemoveFriend = async (friendshipId: string, username: string) => {
        const confirmed = await showConfirm({
            title: 'ยกเลิกการเป็นเพื่อน?',
            message: `คุณต้องการลบ @${username} ออกจากรายชื่อเพื่อนหรือไม่?`,
            confirmText: 'ลบเพื่อน',
            cancelText: 'ยกเลิก',
            type: 'danger',
        });

        if (!confirmed) return;

        try {
            const res = await fetch(`/api/friends/${friendshipId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                showToast('info', 'ยกเลิกการเป็นเพื่อนแล้ว');
                fetchFriends();
            } else {
                showToast('error', 'เกิดข้อผิดพลาด');
            }
        } catch {
            showToast('error', 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">เพื่อนของฉัน 💕</h1>
                    <p className="page-subtitle">ค้นหาและเชื่อมต่อกับเพื่อนเพื่อแชร์ความปรารถนาร่วมกัน</p>
                </div>
            </div>

            {/* Search Box Card */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '28px' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div className="login-input-wrapper" style={{ flex: 1 }}>
                        <div className="login-input-icon">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            className="login-input"
                            placeholder="ค้นหาเพื่อนด้วย @username เช่น @somchai"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button type="submit" disabled={searching} className="btn-primary" style={{ padding: '12px 24px' }}>
                        {searching ? <div className="login-spinner" /> : <Search size={16} />}
                        <span>ค้นหา</span>
                    </button>
                </form>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                            ผลการค้นหา ({searchResults.length} คน)
                        </div>
                        {searchResults.map((u) => {
                            const isFriend = u.friendship?.status === 'accepted';
                            const isPendingSender = u.friendship?.status === 'pending' && u.friendship?.isSender;
                            const isPendingReceiver = u.friendship?.status === 'pending' && !u.friendship?.isSender;

                            return (
                                <div key={u.id} className="friend-card" style={{ justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {/* Avatar or Emoji */}
                                        <div
                                            style={{
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: '50%',
                                                background: 'var(--accent-gradient)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.4rem',
                                            }}
                                        >
                                            {u.emoji || '🌸'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                                                {u.displayName}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                                                @{u.username}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action button */}
                                    <div>
                                        {isFriend ? (
                                            <span className="badge success">
                                                <Check size={12} /> เป็นเพื่อนแล้ว
                                            </span>
                                        ) : isPendingSender ? (
                                            <span className="badge warning">
                                                <Clock size={12} /> รอตอบรับ
                                            </span>
                                        ) : isPendingReceiver ? (
                                            <button
                                                onClick={() => handleRespondRequest(u.friendship!.id, 'accepted', u.username)}
                                                className="btn-primary"
                                                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                                            >
                                                ยอมรับ
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleSendRequest(u)}
                                                className="btn-primary"
                                                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                                            >
                                                <UserPlus size={15} />
                                                <span>ขอเป็นเพื่อน</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Pending Requests Section */}
            {pendingIncoming.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                    <div className="card-title" style={{ color: 'var(--accent-primary)' }}>
                        <Sparkles size={18} />
                        คำขอเป็นเพื่อน ({pendingIncoming.length})
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
                        {pendingIncoming.map((item) => (
                            <div key={item.friendshipId} className="friend-card" style={{ justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div
                                        style={{
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '50%',
                                            background: 'var(--accent-gradient)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.4rem',
                                        }}
                                    >
                                        {item.user.emoji || '🌸'}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800 }}>{item.user.displayName}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                                            @{item.user.username}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => handleRespondRequest(item.friendshipId, 'accepted', item.user.username)}
                                        className="btn-primary"
                                        style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                                    >
                                        <Check size={14} />
                                        <span>ยอมรับ</span>
                                    </button>
                                    <button
                                        onClick={() => handleRespondRequest(item.friendshipId, 'declined', item.user.username)}
                                        className="btn-icon danger"
                                        title="ปฏิเสธ"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Sent Pending Requests */}
            {pendingOutgoing.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                    <div className="card-title" style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                        <Clock size={16} />
                        คำขอที่คุณส่งไป ({pendingOutgoing.length})
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
                        {pendingOutgoing.map((item) => (
                            <div key={item.friendshipId} className="friend-card" style={{ justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: 'var(--bg-elevated)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.2rem',
                                        }}
                                    >
                                        {item.user.emoji || '🌸'}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700 }}>{item.user.displayName}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                                            @{item.user.username}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleRemoveFriend(item.friendshipId, item.user.username)}
                                    className="btn-icon"
                                    title="ยกเลิกคำขอ"
                                    style={{ fontSize: '0.8rem' }}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Accepted Friends List */}
            <div>
                <div className="card-title">
                    <Users size={18} />
                    เพื่อนทั้งหมด ({friends.length})
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                        <div className="login-spinner" style={{ width: '32px', height: '32px', borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }} />
                    </div>
                ) : friends.length === 0 ? (
                    <div className="glass-card empty-state">
                        <div className="empty-state-icon">💌</div>
                        <p>ยังไม่มีเพื่อนในระบบ</p>
                        <span className="empty-state-hint">พิมพ์ชื่อ @username ในช่องค้นหาด้านบนเพื่อส่งคำขอเป็นเพื่อน</span>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
                        {friends.map((item) => (
                            <div key={item.friendshipId} className="friend-card" style={{ justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div
                                        style={{
                                            width: '46px',
                                            height: '46px',
                                            borderRadius: '50%',
                                            background: 'var(--accent-gradient)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.5rem',
                                            boxShadow: '0 4px 12px rgba(232, 97, 122, 0.2)',
                                        }}
                                    >
                                        {item.user.emoji || '🌸'}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                                            {item.user.displayName}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                                            @{item.user.username}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleRemoveFriend(item.friendshipId, item.user.username)}
                                    className="btn-icon danger"
                                    title="ยกเลิกการเป็นเพื่อน"
                                >
                                    <UserX size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
