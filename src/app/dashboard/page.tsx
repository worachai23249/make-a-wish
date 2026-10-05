'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Users, User, ArrowRight, KeyRound, Sparkles, Box, Copy, Check } from 'lucide-react';
import { useToast } from '@/components/Toast';

interface Space {
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
            emoji: string;
        };
    }>;
    _count: {
        wishes: number;
    };
}

const SPACE_EMOJIS = ['💕', '🎁', '🎂', '🌟', '🧁', '🌸', '🥂', '🏡', '✈️', '🎮'];

export default function DashboardPage() {
    const { showToast } = useToast();
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    // Form states
    const [spaceName, setSpaceName] = useState('');
    const [spaceType, setSpaceType] = useState<'1on1' | 'group'>('1on1');
    const [selectedEmoji, setSelectedEmoji] = useState('💕');
    const [creating, setCreating] = useState(false);

    const [joinCode, setJoinCode] = useState('');
    const [joining, setJoining] = useState(false);

    const fetchSpaces = async (silent = false) => {
        try {
            const res = await fetch('/api/spaces');
            if (res.ok) {
                const data = await res.json();
                setSpaces(data);
                try {
                    localStorage.setItem('makewish_spaces_cache', JSON.stringify(data));
                } catch (_) {}
            }
        } catch {
            if (!silent) showToast('error', 'ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลห้องได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // 1. โหลดข้อมูลแคชทันที 0 วินาที ไม่ต้องรอหมุนติ้วๆ
        try {
            const cached = localStorage.getItem('makewish_spaces_cache');
            if (cached) {
                setSpaces(JSON.parse(cached));
                setLoading(false);
            }
        } catch (_) {}

        // 2. ซิงค์ข้อมูลล่าสุดเบื้องหลังแบบเงียบๆ
        fetchSpaces(true);
    }, []);

    const handleCreateSpace = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!spaceName.trim()) return;

        setCreating(true);
        try {
            const res = await fetch('/api/spaces', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: spaceName.trim(),
                    type: spaceType,
                    emoji: selectedEmoji,
                }),
            });

            if (res.ok) {
                const newSpace = await res.json();
                setSpaces([newSpace, ...spaces]);
                setShowCreateModal(false);
                setSpaceName('');
                showToast('success', 'สร้างห้องสำเร็จ! 🎉', `รหัสเชิญของคุณคือ ${newSpace.inviteCode}`);
            } else {
                const err = await res.json();
                showToast('error', 'สร้างห้องไม่สำเร็จ', err.error);
            }
        } catch {
            showToast('error', 'ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
        } finally {
            setCreating(false);
        }
    };

    const handleJoinSpace = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinCode.trim()) return;

        setJoining(true);
        try {
            const res = await fetch('/api/spaces/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inviteCode: joinCode.trim() }),
            });

            const data = await res.json();
            if (res.ok) {
                showToast('success', 'เข้าร่วมห้องสำเร็จ! 🥳', `ยินดีต้อนรับสู่ห้อง ${data.spaceName}`);
                setShowJoinModal(false);
                setJoinCode('');
                fetchSpaces();
            } else {
                showToast('error', 'ไม่สามารถเข้าร่วมได้', data.error);
            }
        } catch {
            showToast('error', 'ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
        } finally {
            setJoining(false);
        }
    };

    const copyInviteCode = (code: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        showToast('info', 'คัดลอกรหัสเชิญแล้ว', code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">ห้องแชร์ความปรารถนา 🌸</h1>
                    <p className="page-subtitle">จัดการห้องของขวัญและแชร์ความปรารถนาร่วมกับคนพิเศษ</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setShowJoinModal(true)}
                        className="btn-primary"
                        style={{
                            background: 'var(--bg-card)',
                            color: 'var(--text-primary)',
                            border: '1.5px solid var(--border-default)',
                            boxShadow: 'none',
                        }}
                    >
                        <KeyRound size={17} />
                        <span>ใส่รหัสเข้าห้อง</span>
                    </button>
                    <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                        <Plus size={18} />
                        <span>สร้างห้องใหม่</span>
                    </button>
                </div>
            </div>

            {/* Spaces Grid */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                    <div className="login-spinner" style={{ width: '36px', height: '36px', borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }} />
                </div>
            ) : spaces.length === 0 ? (
                <div className="glass-card empty-state">
                    <div className="empty-state-icon">🎁</div>
                    <p>คุณยังไม่มีห้องแชร์ความปรารถนา</p>
                    <span className="empty-state-hint">สร้างห้องใหม่ หรือใส่รหัส 6 หลักเพื่อเข้าร่วมห้องของเพื่อน</span>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                            <Plus size={18} />
                            <span>สร้างห้องแรกของคุณ</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: '20px',
                    }}
                >
                    {spaces.map((space) => (
                        <Link
                            key={space.id}
                            href={`/spaces/${space.id}`}
                            className="space-card"
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div
                                        style={{
                                            width: '52px',
                                            height: '52px',
                                            borderRadius: '16px',
                                            background: 'var(--bg-elevated)',
                                            border: '1.5px solid var(--border-subtle)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.8rem',
                                            boxShadow: '0 4px 12px rgba(232, 97, 122, 0.15)',
                                        }}
                                    >
                                        {space.emoji || '💕'}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                            {space.name}
                                        </h3>
                                        <span className={`badge ${space.type === '1on1' ? 'pink' : 'purple'}`}>
                                            {space.type === '1on1' ? <User size={12} /> : <Users size={12} />}
                                            {space.type === '1on1' ? '1-on-1 ห้องคู่' : 'กลุ่ม'}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => copyInviteCode(space.inviteCode, e)}
                                    title="คัดลอกรหัสเชิญ"
                                    className="btn-icon"
                                    style={{ flexShrink: 0 }}
                                >
                                    {copiedCode === space.inviteCode ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
                                </button>
                            </div>

                            {/* Details */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    <Sparkles size={15} color="var(--accent-primary)" />
                                    <span>{space._count?.wishes || 0} ความปรารถนา</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                    <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--accent-primary)' }}>
                                        #{space.inviteCode}
                                    </span>
                                    <ArrowRight size={14} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Modal: Create Space */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="login-form-title" style={{ fontSize: '1.4rem', marginBottom: '8px' }}>
                            สร้างห้องความปรารถนาใหม่ ✨
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
                            ห้องจะได้รับรหัสเชิญ 6 หลักอัตโนมัติเพื่อให้เพื่อนกดเข้าร่วม
                        </p>

                        <form onSubmit={handleCreateSpace} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label className="form-label">ประเภทห้อง</label>
                                <div className="tab-group">
                                    <button
                                        type="button"
                                        className={`tab-btn ${spaceType === '1on1' ? 'active' : ''}`}
                                        onClick={() => setSpaceType('1on1')}
                                    >
                                        💕 1-on-1 (คู่รัก/เพื่อนสนิท)
                                    </button>
                                    <button
                                        type="button"
                                        className={`tab-btn ${spaceType === 'group' ? 'active' : ''}`}
                                        onClick={() => setSpaceType('group')}
                                    >
                                        👥 กลุ่ม (เพื่อน/ครอบครัว)
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="form-label">เลือกอีโมจิประจำห้อง</label>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {SPACE_EMOJIS.map((e) => (
                                        <button
                                            key={e}
                                            type="button"
                                            onClick={() => setSelectedEmoji(e)}
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '10px',
                                                border: selectedEmoji === e ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                                                background: selectedEmoji === e ? 'rgba(232, 97, 122, 0.12)' : 'var(--bg-elevated)',
                                                fontSize: '1.3rem',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {e}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="form-label">ชื่อห้อง</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="เช่น ของขวัญวันครบรอบ, แก๊งเที่ยวปีใหม่"
                                    value={spaceName}
                                    onChange={(e) => setSpaceName(e.target.value)}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
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
                                    disabled={creating}
                                    className="btn-primary"
                                    style={{ flex: 1, justifyContent: 'center' }}
                                >
                                    {creating ? 'กำลังสร้าง...' : 'สร้างห้อง'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Join Space */}
            {showJoinModal && (
                <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="login-form-title" style={{ fontSize: '1.4rem', marginBottom: '8px' }}>
                            เข้าร่วมห้องความปรารถนา 🔑
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
                            กรอกรหัสเชิญ 6 หลักที่คุณได้รับจากเจ้าของห้อง
                        </p>

                        <form onSubmit={handleJoinSpace} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label className="form-label">รหัสเชิญ 6 หลัก</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="เช่น AB12CD"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    maxLength={8}
                                    style={{
                                        fontFamily: 'JetBrains Mono',
                                        fontSize: '1.3rem',
                                        letterSpacing: '0.2em',
                                        textAlign: 'center',
                                    }}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowJoinModal(false)}
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
                                    disabled={joining}
                                    className="btn-primary"
                                    style={{ flex: 1, justifyContent: 'center' }}
                                >
                                    {joining ? 'กำลังตรวจสอบ...' : 'เข้าร่วมห้อง'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
