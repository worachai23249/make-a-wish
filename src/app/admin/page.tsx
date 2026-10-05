'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Users, Box, Gift, Trash2, ShieldCheck, ShieldAlert, Calendar } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { useConfirm } from '@/components/ConfirmDialog';

interface AdminStats {
    users: number;
    spaces: number;
    wishes: number;
}

interface AdminUser {
    id: string;
    username: string;
    displayName: string;
    email: string;
    emoji: string;
    avatarUrl: string | null;
    role: string;
    createdAt: string;
    _count: {
        ownedSpaces: number;
        wishes: number;
    };
}

export default function AdminPage() {
    const { data: session } = useSession();
    const { showToast } = useToast();
    const { showConfirm } = useConfirm();

    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);

    const currentUserId = session?.user?.id;

    const fetchData = async () => {
        try {
            const [statsRes, usersRes] = await Promise.all([
                fetch('/api/admin/stats'),
                fetch('/api/admin/users'),
            ]);

            if (statsRes.ok && usersRes.ok) {
                const statsData = await statsRes.json();
                const usersData = await usersRes.json();
                setStats(statsData);
                setUsers(usersData);
            } else {
                showToast('error', 'ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลผู้ดูแลระบบได้');
            }
        } catch {
            showToast('error', 'ข้อผิดพลาดในการเชื่อมต่อ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteUser = async (user: AdminUser) => {
        if (user.id === currentUserId) {
            showToast('warning', 'ไม่สามารถลบได้', 'คุณไม่สามารถลบบัญชีที่กำลังล็อกอินอยู่ได้');
            return;
        }

        const confirmed = await showConfirm({
            title: `ลบบัญชี @${user.username}?`,
            message: `การกระทำนี้จะลบห้อง (${user._count.ownedSpaces} ห้อง) และของขวัญ (${user._count.wishes} รายการ) ที่เกี่ยวข้องทั้งหมดอย่างถาวร (Cascade Delete)`,
            confirmText: 'ลบบัญชีถาวร',
            cancelText: 'ยกเลิก',
            type: 'danger',
        });

        if (!confirmed) return;

        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                showToast('success', 'ลบบัญชีผู้ใช้เรียบร้อย', `ลบ @${user.username} สำเร็จ`);
                fetchData();
            } else {
                const err = await res.json();
                showToast('error', 'ลบไม่สำเร็จ', err.error);
            }
        } catch {
            showToast('error', 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                <div className="login-spinner" style={{ width: '40px', height: '40px', borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }} />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">แผงควบคุมผู้ดูแลระบบ 👑</h1>
                    <p className="page-subtitle">จัดการผู้ใช้งาน ห้องแชร์ความปรารถนา และตรวจสอบสถิติรวมของระบบ</p>
                </div>
            </div>

            {/* Stats Overview Cards */}
            {stats && (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '20px',
                        marginBottom: '32px',
                    }}
                >
                    <div className="summary-card">
                        <div className="summary-card-header">
                            <div>
                                <div className="summary-card-label">ผู้ใช้งานทั้งหมด</div>
                                <div className="summary-card-value">{stats.users}</div>
                            </div>
                            <div className="summary-card-icon" style={{ background: 'rgba(232, 97, 122, 0.1)', color: 'var(--accent-primary)' }}>
                                <Users size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="summary-card">
                        <div className="summary-card-header">
                            <div>
                                <div className="summary-card-label">ห้องความปรารถนา</div>
                                <div className="summary-card-value">{stats.spaces}</div>
                            </div>
                            <div className="summary-card-icon" style={{ background: 'rgba(199, 75, 138, 0.1)', color: 'var(--accent-secondary)' }}>
                                <Box size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="summary-card">
                        <div className="summary-card-header">
                            <div>
                                <div className="summary-card-label">ของขวัญ/ความปรารถนา</div>
                                <div className="summary-card-value">{stats.wishes}</div>
                            </div>
                            <div className="summary-card-icon" style={{ background: 'rgba(244, 165, 64, 0.1)', color: '#F4A540' }}>
                                <Gift size={24} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Table */}
            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div className="card-title" style={{ margin: 0 }}>
                        <Users size={18} />
                        รายชื่อผู้ใช้งานทั้งหมด ({users.length} คน)
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ผู้ใช้งาน</th>
                                <th>อีเมล</th>
                                <th>บทบาท</th>
                                <th>ห้องที่สร้าง</th>
                                <th>ของขวัญ</th>
                                <th>วันที่สมัคร</th>
                                <th style={{ textAlign: 'center' }}>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => {
                                const isCurrent = u.id === currentUserId;
                                const isAdmin = u.role === 'admin';

                                return (
                                    <tr key={u.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div
                                                    style={{
                                                        width: '38px',
                                                        height: '38px',
                                                        borderRadius: '50%',
                                                        background: 'var(--accent-gradient)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '1.2rem',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {u.emoji || '🌸'}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                                        {u.displayName}
                                                        {isCurrent && (
                                                            <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', marginLeft: '6px' }}>
                                                                (คุณ)
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                                                        @{u.username}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{u.email}</td>
                                        <td>
                                            <span className={`badge ${isAdmin ? 'purple' : 'pink'}`}>
                                                {isAdmin ? <ShieldCheck size={12} /> : <Users size={12} />}
                                                {isAdmin ? 'Admin' : 'User'}
                                            </span>
                                        </td>
                                        <td>{u._count.ownedSpaces} ห้อง</td>
                                        <td>{u._count.wishes} รายการ</td>
                                        <td>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem' }}>
                                                <Calendar size={12} />
                                                {new Date(u.createdAt).toLocaleDateString('th-TH')}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {isCurrent ? (
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>-</span>
                                            ) : (
                                                <button
                                                    onClick={() => handleDeleteUser(u)}
                                                    className="btn-icon danger"
                                                    title="ลบบัญชีผู้ใช้นี้"
                                                    style={{ margin: '0 auto' }}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
