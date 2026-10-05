'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Lock, Mail, User, AtSign, AlertCircle, Eye, EyeOff, Gift } from 'lucide-react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

const EMOJIS = ['🌸', '💕', '🌹', '⭐', '🦋', '🌈', '💫', '🎀', '🍀', '🌙'];

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedEmoji, setSelectedEmoji] = useState('🌸');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            username: formData.get('username') as string,
            displayName: formData.get('displayName') as string,
            email: formData.get('email') as string,
            password: formData.get('password') as string,
            emoji: selectedEmoji,
        };

        if (data.password.length < 6) {
            setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const json = await res.json();
            if (!res.ok) {
                setError(json.error || 'เกิดข้อผิดพลาด');
                setLoading(false);
            } else {
                // Auto login immediately like Facebook
                const loginRes = await signIn('credentials', {
                    email: data.email,
                    password: data.password,
                    redirect: false,
                });
                if (loginRes?.error) {
                    router.push('/login?registered=1');
                } else {
                    router.push('/dashboard');
                    router.refresh();
                }
            }
        } catch {
            setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-bg-orb login-bg-orb-1" />
            <div className="login-bg-orb login-bg-orb-2" />
            <div className="login-bg-orb login-bg-orb-3" />

            <div className="login-container" style={{ maxWidth: '900px' }}>
                {/* Left panel */}
                <div className="login-brand-panel">
                    <div className="login-brand-content">
                        <div className="login-brand-emoji">🎁</div>
                        <div>
                            <h1 className="login-brand-title">เข้าร่วมกับเรา</h1>
                            <p className="login-brand-subtitle">สร้างบัญชีแล้วเริ่มแชร์<br />ความปรารถนากับคนพิเศษ</p>
                        </div>
                        <div className="login-features">
                            <div className="login-feature-item">
                                <div className="login-feature-dot" />
                                <span>ฟรี 100% ไม่มีค่าใช้จ่าย</span>
                            </div>
                            <div className="login-feature-item">
                                <div className="login-feature-dot" />
                                <span>ติดตั้งเป็น App บนมือถือได้</span>
                            </div>
                            <div className="login-feature-item">
                                <div className="login-feature-dot" />
                                <span>ปลอดภัย ข้อมูลเป็นส่วนตัว</span>
                            </div>
                        </div>
                    </div>
                    <div className="login-brand-footer">
                        <p>© {new Date().getFullYear()} Make a Wish App 💕</p>
                    </div>
                </div>

                {/* Right panel */}
                <div className="login-form-panel">
                    <div className="login-form-wrapper">
                        <div className="login-form-header">
                            <h2 className="login-form-title">สมัครสมาชิก 💫</h2>
                            <p className="login-form-subtitle">กรอกข้อมูลเพื่อสร้างบัญชีใหม่</p>
                        </div>

                        <form onSubmit={handleSubmit} className="login-form">
                            {/* Emoji picker */}
                            <div className="login-field">
                                <label className="login-label">เลือกอีโมจิประจำตัว</label>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {EMOJIS.map(e => (
                                        <button
                                            key={e}
                                            type="button"
                                            onClick={() => setSelectedEmoji(e)}
                                            style={{
                                                width: '40px', height: '40px',
                                                borderRadius: '10px',
                                                border: selectedEmoji === e
                                                    ? '2px solid var(--accent-primary)'
                                                    : '2px solid var(--border-subtle)',
                                                background: selectedEmoji === e
                                                    ? 'rgba(232, 97, 122, 0.1)'
                                                    : 'var(--bg-elevated)',
                                                fontSize: '1.2rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            {e}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="login-field">
                                <label className="login-label" htmlFor="reg-displayName">ชื่อที่แสดง</label>
                                <div className="login-input-wrapper">
                                    <div className="login-input-icon"><User size={16} /></div>
                                    <input id="reg-displayName" className="login-input" type="text" name="displayName" placeholder="ชื่อของคุณ" required />
                                </div>
                            </div>

                            <div className="login-field">
                                <label className="login-label" htmlFor="reg-username">ชื่อผู้ใช้ (@username)</label>
                                <div className="login-input-wrapper">
                                    <div className="login-input-icon"><AtSign size={16} /></div>
                                    <input id="reg-username" className="login-input" type="text" name="username" placeholder="username" required pattern="[a-z0-9_]+" title="ใช้ได้เฉพาะตัวพิมพ์เล็ก ตัวเลข และ _" />
                                </div>
                            </div>

                            <div className="login-field">
                                <label className="login-label" htmlFor="reg-email">อีเมล</label>
                                <div className="login-input-wrapper">
                                    <div className="login-input-icon"><Mail size={16} /></div>
                                    <input id="reg-email" className="login-input" type="email" name="email" placeholder="name@example.com" required />
                                </div>
                            </div>

                            <div className="login-field">
                                <label className="login-label" htmlFor="reg-password">รหัสผ่าน</label>
                                <div className="login-input-wrapper">
                                    <div className="login-input-icon"><Lock size={16} /></div>
                                    <input
                                        id="reg-password"
                                        className="login-input"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="อย่างน้อย 6 ตัวอักษร"
                                        required
                                        minLength={6}
                                        style={{ paddingRight: '48px' }}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="login-error">
                                    <AlertCircle size={15} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="login-submit-btn"
                                aria-disabled={loading}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="login-spinner" />
                                        <span>กำลังสมัคร...</span>
                                    </>
                                ) : (
                                    <>
                                        <Gift size={18} />
                                        <span>สมัครสมาชิก</span>
                                        <ArrowRight size={18} className="login-btn-arrow" />
                                    </>
                                )}
                            </button>

                            <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                                    มีบัญชีอยู่แล้ว?{' '}
                                    <Link href="/login" style={{ color: 'var(--accent-primary)', fontWeight: 700, textDecoration: 'none' }}>
                                        เข้าสู่ระบบ
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
