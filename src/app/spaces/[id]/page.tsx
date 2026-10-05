'use client';

import { useState, useEffect, use, useOptimistic } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    Plus,
    Trash2,
    Copy,
    Check,
    Sparkles,
    Gift,
    Utensils,
    MapPin,
    ArrowLeft,
    Users,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import { useConfirm } from '@/components/ConfirmDialog';
import WishRoulette, { WishItem } from '@/components/WishRoulette';

interface SpaceDetail {
    id: string;
    name: string;
    type: '1on1' | 'group';
    emoji: string;
    inviteCode: string;
    owner: {
        id: string;
        displayName: string;
        username: string;
        emoji: string;
    };
    members: Array<{
        user: {
            id: string;
            displayName: string;
            username: string;
            emoji: string;
            avatarUrl: string | null;
        };
    }>;
    wishes: Array<WishItem & { userId: string; createdAt: string }>;
}

const CATEGORY_INFO = {
    item: { label: 'สิ่งของ', icon: Gift, color: 'var(--accent-primary)', badge: 'pink' },
    food: { label: 'อาหาร', icon: Utensils, color: '#C77B22', badge: 'warning' },
    place: { label: 'สถานที่', icon: MapPin, color: '#3A82B0', badge: 'info' },
};

const WISH_EMOJIS = ['⭐', '🎁', '👗', '💄', '📱', '🎮', '🍫', '🍜', '☕', '🍰', '📍', '🏖️', '✈️', '🎪'];

export default function SpaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { data: session } = useSession();
    const { showToast } = useToast();
    const { showConfirm } = useConfirm();

    const [space, setSpace] = useState<SpaceDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState(false);

    // Filters
    const [categoryFilter, setCategoryFilter] = useState<'all' | 'item' | 'food' | 'place'>('all');
    const [ownerFilter, setOwnerFilter] = useState<'all' | 'mine' | 'others'>('all');

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showRoulette, setShowRoulette] = useState(false);

    // Add form
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<'item' | 'food' | 'place'>('item');
    const [wishEmoji, setWishEmoji] = useState('⭐');

    // Optimistic UI for wishes
    type OptimisticAction =
        | { type: 'add'; wish: WishItem & { userId: string; createdAt: string } }
        | { type: 'delete'; wishId: string };

    const [optimisticWishes, setOptimisticWishes] = useOptimistic(
        space?.wishes || [],
        (state, action: OptimisticAction) => {
            if (action.type === 'add') {
                return [action.wish, ...state];
            }
            if (action.type === 'delete') {
                return state.filter((w) => w.id !== action.wishId);
            }
            return state;
        }
    );

    const currentUserId = session?.user?.id;

    const fetchSpace = async (silent = false) => {
        try {
            const res = await fetch(`/api/spaces/${id}`);
            if (res.ok) {
                const data = await res.json();
                setSpace(data);
                try {
                    localStorage.setItem(`makewish_space_${id}`, JSON.stringify(data));
                } catch (_) {}
            } else if (res.status === 403 || res.status === 404) {
                showToast('error', 'ไม่สามารถเข้าถึงห้องได้', 'คุณไม่ได้เป็นสมาชิกหรือไม่มีห้องนี้');
                router.push('/dashboard');
            }
        } catch {
            if (!silent) showToast('error', 'ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลห้องได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // 1. โหลดข้อมูลแคชทันที 0 วินาที หน้าจอจะโชว์ทันทีไม่ต้องรอหมุน
        try {
            const cached = localStorage.getItem(`makewish_space_${id}`);
            if (cached) {
                setSpace(JSON.parse(cached));
                setLoading(false);
            }
        } catch (_) {}

        // 2. ซิงค์ข้อมูลล่าสุดจากเซิร์ฟเวอร์แบบเงียบๆ
        fetchSpace(true);
    }, [id]);

    const handleCopyCode = () => {
        if (!space) return;
        navigator.clipboard.writeText(space.inviteCode);
        setCopiedCode(true);
        showToast('info', 'คัดลอกรหัสเชิญแล้ว', space.inviteCode);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    // Instant Add (Optimistic UI 0 seconds)
    const handleAddWish = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !space) return;

        const tempId = 'temp-' + Date.now();
        const newWish = {
            id: tempId,
            title: title.trim(),
            description: description.trim() || null,
            emoji: wishEmoji,
            category,
            userId: currentUserId || '',
            createdAt: new Date().toISOString(),
            user: {
                displayName: session?.user?.name || 'ฉัน',
                emoji: (session?.user as { emoji?: string })?.emoji || '🌸',
            },
        };

        // 1. Instant 0s UI update
        setOptimisticWishes({ type: 'add', wish: newWish });
        setShowAddModal(false);
        setTitle('');
        setDescription('');
        showToast('success', 'เพิ่มความปรารถนาสำเร็จ! 🎁', newWish.title);

        // 2. Sync to DB in background
        try {
            const res = await fetch(`/api/spaces/${id}/wishes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newWish.title,
                    description: newWish.description,
                    emoji: newWish.emoji,
                    category: newWish.category,
                }),
            });

            if (res.ok) {
                const savedWish = await res.json();
                setSpace((prev) =>
                    prev ? { ...prev, wishes: [savedWish, ...prev.wishes] } : prev
                );
            } else {
                showToast('error', 'บันทึกไม่สำเร็จ', 'ระบบจะทำการรีเฟรชข้อมูล');
                fetchSpace();
            }
        } catch {
            showToast('error', 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
            fetchSpace();
        }
    };

    // Instant Delete (Optimistic UI 0 seconds)
    const handleDeleteWish = async (wishId: string, wishTitle: string) => {
        const confirmed = await showConfirm({
            title: 'ลบความปรารถนานี้?',
            message: `คุณแน่ใจหรือไม่ว่าต้องการลบ "${wishTitle}"?`,
            confirmText: 'ลบเลย',
            cancelText: 'ยกเลิก',
            type: 'danger',
        });

        if (!confirmed) return;

        // 1. Instant 0s UI update
        setOptimisticWishes({ type: 'delete', wishId });
        showToast('info', 'ลบความปรารถนาแล้ว', wishTitle);

        // 2. Sync to DB in background
        try {
            const res = await fetch(`/api/spaces/${id}/wishes/${wishId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setSpace((prev) =>
                    prev ? { ...prev, wishes: prev.wishes.filter((w) => w.id !== wishId) } : prev
                );
            } else {
                showToast('error', 'ลบไม่สำเร็จ', 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์');
                fetchSpace();
            }
        } catch {
            showToast('error', 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
            fetchSpace();
        }
    };

    // Filter wishes
    const filteredWishes = optimisticWishes.filter((w) => {
        // Category filter
        if (categoryFilter !== 'all' && w.category !== categoryFilter) return false;

        // Owner filter
        if (ownerFilter === 'mine' && w.userId !== currentUserId) return false;
        if (ownerFilter === 'others' && w.userId === currentUserId) return false;

        return true;
    });

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                <div className="login-spinner" style={{ width: '40px', height: '40px', borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }} />
            </div>
        );
    }

    if (!space) return null;

    return (
        <div>
            {/* Top Navigation */}
            <div style={{ marginBottom: '20px' }}>
                <Link
                    href="/dashboard"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: 'var(--text-muted)',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                    }}
                >
                    <ArrowLeft size={16} />
                    <span>กลับไปห้องทั้งหมด</span>
                </Link>
            </div>

            {/* Space Header Card */}
            <div
                className="glass-card"
                style={{
                    padding: '28px',
                    marginBottom: '28px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '20px',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                    <div
                        style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '20px',
                            background: 'var(--accent-gradient)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2.4rem',
                            boxShadow: '0 8px 24px rgba(232, 97, 122, 0.3)',
                            flexShrink: 0,
                        }}
                    >
                        {space.emoji || '💕'}
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h1 className="page-title" style={{ fontSize: '1.8rem', margin: 0 }}>
                                {space.name}
                            </h1>
                            <span className={`badge ${space.type === '1on1' ? 'pink' : 'purple'}`}>
                                {space.type === '1on1' ? '1-on-1' : 'กลุ่ม'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Users size={14} />
                                {space.members.length} สมาชิก
                            </span>
                            <span>•</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Sparkles size={14} />
                                {space.wishes.length} ความปรารถนา
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions: Copy Code & Roulette */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Invite Code button */}
                    <button
                        onClick={handleCopyCode}
                        className="btn-primary"
                        style={{
                            background: 'var(--bg-elevated)',
                            color: 'var(--accent-primary)',
                            border: '1.5px dashed var(--border-strong)',
                            boxShadow: 'none',
                            fontFamily: 'JetBrains Mono, monospace',
                        }}
                    >
                        {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                        <span>รหัส: {space.inviteCode}</span>
                    </button>

                    {/* Roulette button */}
                    <button
                        onClick={() => setShowRoulette(true)}
                        className="btn-primary"
                        style={{
                            background: 'linear-gradient(135deg, #F4A540 0%, #E8617A 100%)',
                            boxShadow: '0 4px 16px rgba(244, 165, 64, 0.4)',
                        }}
                    >
                        <span>🎰 สุ่มของขวัญ</span>
                    </button>

                    {/* Add wish button */}
                    <button onClick={() => setShowAddModal(true)} className="btn-primary">
                        <Plus size={18} />
                        <span>ขอของขวัญ</span>
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                    marginBottom: '20px',
                }}
            >
                {/* Category tabs */}
                <div className="tab-group" style={{ maxWidth: '480px' }}>
                    <button
                        className={`tab-btn ${categoryFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setCategoryFilter('all')}
                    >
                        ทั้งหมด
                    </button>
                    <button
                        className={`tab-btn ${categoryFilter === 'item' ? 'active' : ''}`}
                        onClick={() => setCategoryFilter('item')}
                    >
                        🎁 สิ่งของ
                    </button>
                    <button
                        className={`tab-btn ${categoryFilter === 'food' ? 'active' : ''}`}
                        onClick={() => setCategoryFilter('food')}
                    >
                        🍜 อาหาร
                    </button>
                    <button
                        className={`tab-btn ${categoryFilter === 'place' ? 'active' : ''}`}
                        onClick={() => setCategoryFilter('place')}
                    >
                        📍 สถานที่
                    </button>
                </div>

                {/* Owner filter */}
                <div className="tab-group" style={{ maxWidth: '320px' }}>
                    <button
                        className={`tab-btn ${ownerFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setOwnerFilter('all')}
                    >
                        ทั้งหมด
                    </button>
                    <button
                        className={`tab-btn ${ownerFilter === 'mine' ? 'active' : ''}`}
                        onClick={() => setOwnerFilter('mine')}
                    >
                        ของฉัน
                    </button>
                    <button
                        className={`tab-btn ${ownerFilter === 'others' ? 'active' : ''}`}
                        onClick={() => setOwnerFilter('others')}
                    >
                        ของคนอื่น
                    </button>
                </div>
            </div>

            {/* Wishes Grid */}
            {filteredWishes.length === 0 ? (
                <div className="glass-card empty-state">
                    <div className="empty-state-icon">⭐</div>
                    <p>ยังไม่มีรายการความปรารถนาในหมวดหมู่นี้</p>
                    <span className="empty-state-hint">กดปุ่ม "ขอของขวัญ" เพื่อเพิ่มรายการแรกของคุณได้เลย</span>
                    <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ marginTop: '8px' }}>
                        <Plus size={18} />
                        <span>เพิ่มของขวัญทันที</span>
                    </button>
                </div>
            ) : (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '16px',
                    }}
                >
                    {filteredWishes.map((w) => {
                        const isMine = w.userId === currentUserId;
                        const cat = CATEGORY_INFO[w.category as keyof typeof CATEGORY_INFO] || CATEGORY_INFO.item;
                        const CatIcon = cat.icon;

                        return (
                            <div key={w.id} className="wish-card">
                                <div className="wish-emoji">{w.emoji || '⭐'}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <h3
                                            style={{
                                                fontSize: '1.05rem',
                                                fontWeight: 800,
                                                color: 'var(--text-primary)',
                                                wordBreak: 'break-word',
                                            }}
                                        >
                                            {w.title}
                                        </h3>
                                    </div>

                                    {w.description && (
                                        <p
                                            style={{
                                                fontSize: '0.85rem',
                                                color: 'var(--text-secondary)',
                                                marginBottom: '8px',
                                                lineHeight: 1.4,
                                            }}
                                        >
                                            {w.description}
                                        </p>
                                    )}

                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            marginTop: '6px',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span className={`wish-badge ${w.category}`}>
                                                <CatIcon size={11} />
                                                {cat.label}
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: '0.78rem',
                                                    color: 'var(--text-muted)',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {isMine ? 'ของฉัน' : `@${w.user?.displayName || 'เพื่อน'}`}
                                            </span>
                                        </div>

                                        {(isMine || space.owner.id === currentUserId) && (
                                            <button
                                                onClick={() => handleDeleteWish(w.id, w.title)}
                                                className="btn-icon danger"
                                                title="ลบรายการนี้"
                                                style={{ width: '28px', height: '28px' }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Wish Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="login-form-title" style={{ fontSize: '1.4rem', marginBottom: '8px' }}>
                            ขอของขวัญ / ความปรารถนาใหม่ 🎁
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
                            รายการจะถูกแสดงให้ทุกคนในห้องเห็นทันทีแบบ Real-time
                        </p>

                        <form onSubmit={handleAddWish} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Category selector */}
                            <div>
                                <label className="form-label">หมวดหมู่</label>
                                <div className="tab-group">
                                    <button
                                        type="button"
                                        className={`tab-btn ${category === 'item' ? 'active' : ''}`}
                                        onClick={() => setCategory('item')}
                                    >
                                        🎁 สิ่งของ
                                    </button>
                                    <button
                                        type="button"
                                        className={`tab-btn ${category === 'food' ? 'active' : ''}`}
                                        onClick={() => setCategory('food')}
                                    >
                                        🍜 อาหาร
                                    </button>
                                    <button
                                        type="button"
                                        className={`tab-btn ${category === 'place' ? 'active' : ''}`}
                                        onClick={() => setCategory('place')}
                                    >
                                        📍 สถานที่
                                    </button>
                                </div>
                            </div>

                            {/* Emoji selector */}
                            <div>
                                <label className="form-label">เลือกอีโมจิ</label>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {WISH_EMOJIS.map((e) => (
                                        <button
                                            key={e}
                                            type="button"
                                            onClick={() => setWishEmoji(e)}
                                            style={{
                                                width: '38px',
                                                height: '38px',
                                                borderRadius: '10px',
                                                border: wishEmoji === e ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                                                background: wishEmoji === e ? 'rgba(232, 97, 122, 0.12)' : 'var(--bg-elevated)',
                                                fontSize: '1.2rem',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {e}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="form-label">ชื่อของขวัญ / สิ่งที่อยากได้</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="เช่น หูฟังไร้สาย, ร้านสุกี้, คาเฟ่เขาใหญ่"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="form-label">รายละเอียดเพิ่มเติม (ถ้ามี)</label>
                                <textarea
                                    className="form-input"
                                    placeholder="สี ไซส์ ลิงก์ หรือเหตุผลที่อยากได้"
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            {/* Submit */}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="btn-primary"
                                    style={{
                                        flex: 1,
                                        background: 'var(--bg-elevated)',
                                        color: 'var(--text-secondary)',
                                        boxShadow: 'none',
                                    }}
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    style={{ flex: 1, justifyContent: 'center' }}
                                >
                                    เพิ่มความปรารถนา
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Gift Roulette Modal */}
            <WishRoulette
                wishes={space.wishes}
                isOpen={showRoulette}
                onClose={() => setShowRoulette(false)}
            />
        </div>
    );
}
