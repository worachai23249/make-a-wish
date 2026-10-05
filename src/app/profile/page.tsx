'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, AtSign, Mail, Save, Calendar, Shield } from 'lucide-react';
import { useToast } from '@/components/Toast';
import AvatarUpload from '@/components/AvatarUpload';

const PROFILE_EMOJIS = ['🌸', '💕', '🌹', '⭐', '🦋', '🌈', '💫', '🎀', '🍀', '🌙', '👑', '🍒'];

interface UserProfile {
    id: string;
    username: string;
    displayName: string;
    email: string;
    emoji: string;
    avatarUrl: string | null;
    role: string;
    createdAt: string;
}

export default function ProfilePage() {
    const { update: updateSession } = useSession();
    const { showToast } = useToast();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form inputs
    const [displayName, setDisplayName] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState('🌸');
    const [compressedAvatar, setCompressedAvatar] = useState<string | null>(null);

    const fetchProfile = async (silent = false) => {
        try {
            const res = await fetch('/api/profile');
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
                setDisplayName(data.displayName);
                setSelectedEmoji(data.emoji || '🌸');
                try {
                    localStorage.setItem('makewish_profile_cache', JSON.stringify(data));
                } catch (_) {}
            }
        } catch {
            if (!silent) showToast('error', 'ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลโปรไฟล์ได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // 1. โหลดโปรไฟล์จากแคชทันที 0 วินาที
        try {
            const cached = localStorage.getItem('makewish_profile_cache');
            if (cached) {
                const data = JSON.parse(cached);
                setProfile(data);
                setDisplayName(data.displayName);
                setSelectedEmoji(data.emoji || '🌸');
                setLoading(false);
            }
        } catch (_) {}

        // 2. ซิงค์ข้อมูลล่าสุดเบื้องหลัง
        fetchProfile(true);
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!displayName.trim()) return;

        setSaving(true);
        try {
            const payload: { displayName: string; emoji: string; avatarUrl?: string } = {
                displayName: displayName.trim(),
                emoji: selectedEmoji,
            };
            if (compressedAvatar) {
                payload.avatarUrl = compressedAvatar;
            }

            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const updated = await res.json();
                setProfile((prev) => (prev ? { ...prev, ...updated } : prev));
                await updateSession();
                showToast('success', 'บันทึกโปรไฟล์สำเร็จ! 🌸', 'ข้อมูลของคุณได้รับการอัปเดตแล้ว');
            } else {
                const err = await res.json();
                showToast('error', 'บันทึกไม่สำเร็จ', err.error);
            }
        } catch {
            showToast('error', 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                <div className="login-spinner" style={{ width: '40px', height: '40px', borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }} />
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div className="page-header" style={{ marginBottom: '24px' }}>
                <div>
                    <h1 className="page-title">โปรไฟล์ของฉัน ✨</h1>
                    <p className="page-subtitle">จัดการข้อมูลส่วนตัว รูปโปรไฟล์ และอีโมจิประจำตัว</p>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '36px', overflow: 'visible' }}>
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Avatar Upload with HTML5 Canvas compression */}
                    <AvatarUpload
                        userId={profile.id}
                        currentAvatarUrl={profile.avatarUrl}
                        emoji={selectedEmoji}
                        onImageCompressed={(base64) => setCompressedAvatar(base64)}
                    />

                    {/* Emoji Selector */}
                    <div>
                        <label className="form-label">อีโมจิประจำตัว</label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {PROFILE_EMOJIS.map((e) => (
                                <button
                                    key={e}
                                    type="button"
                                    onClick={() => setSelectedEmoji(e)}
                                    style={{
                                        width: '42px',
                                        height: '42px',
                                        borderRadius: '12px',
                                        border: selectedEmoji === e ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                                        background: selectedEmoji === e ? 'rgba(232, 97, 122, 0.15)' : 'var(--bg-elevated)',
                                        fontSize: '1.4rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Display Name */}
                    <div>
                        <label className="form-label" htmlFor="profile-displayName">
                            ชื่อที่แสดง (Display Name)
                        </label>
                        <div className="login-input-wrapper">
                            <div className="login-input-icon">
                                <User size={16} />
                            </div>
                            <input
                                id="profile-displayName"
                                type="text"
                                className="login-input"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Username (Read only) */}
                    <div>
                        <label className="form-label">ชื่อผู้ใช้ (@username)</label>
                        <div className="login-input-wrapper">
                            <div className="login-input-icon">
                                <AtSign size={16} />
                            </div>
                            <input
                                type="text"
                                className="login-input"
                                value={profile.username}
                                disabled
                                style={{ opacity: 0.7, cursor: 'not-allowed' }}
                            />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                            ชื่อผู้ใช้ใช้สำหรับให้เพื่อนค้นหา ไม่สามารถเปลี่ยนแปลงได้
                        </span>
                    </div>

                    {/* Email (Read only) */}
                    <div>
                        <label className="form-label">อีเมล</label>
                        <div className="login-input-wrapper">
                            <div className="login-input-icon">
                                <Mail size={16} />
                            </div>
                            <input
                                type="email"
                                className="login-input"
                                value={profile.email}
                                disabled
                                style={{ opacity: 0.7, cursor: 'not-allowed' }}
                            />
                        </div>
                    </div>

                    {/* Account Info Badges */}
                    <div
                        style={{
                            display: 'flex',
                            gap: '16px',
                            padding: '16px',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-elevated)',
                            fontSize: '0.85rem',
                            color: 'var(--text-secondary)',
                            flexWrap: 'wrap',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Shield size={16} color="var(--accent-primary)" />
                            <span>สิทธิ์การใช้งาน: <strong>{profile.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'ผู้ใช้ทั่วไป'}</strong></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={16} color="var(--accent-primary)" />
                            <span>สมาชิกตั้งแต่: {new Date(profile.createdAt).toLocaleDateString('th-TH')}</span>
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary"
                        style={{ justifyContent: 'center', padding: '14px', fontSize: '1rem', marginTop: '10px' }}
                    >
                        {saving ? (
                            <>
                                <div className="login-spinner" />
                                <span>กำลังบันทึก...</span>
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                <span>บันทึกการเปลี่ยนแปลง</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
