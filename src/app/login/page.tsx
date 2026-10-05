'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { authenticate } from '@/app/lib/actions';
import { ArrowRight, Lock, Mail, AlertCircle, Eye, EyeOff, Gift } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="login-page">
            <div className="login-bg-orb login-bg-orb-1" />
            <div className="login-bg-orb login-bg-orb-2" />
            <div className="login-bg-orb login-bg-orb-3" />

            <div className="login-container">
                {/* Left panel */}
                <div className="login-brand-panel">
                    <div className="login-brand-content">
                        <div className="login-brand-emoji">🎁</div>
                        <div>
                            <h1 className="login-brand-title">Make a Wish</h1>
                            <p className="login-brand-subtitle">แชร์ความปรารถนากับ<br />คนพิเศษในชีวิตของคุณ</p>
                        </div>
                        <div className="login-features">
                            <div className="login-feature-item">
                                <div className="login-feature-dot" />
                                <span>สร้างรายการความปรารถนา 3 หมวดหมู่</span>
                            </div>
                            <div className="login-feature-item">
                                <div className="login-feature-dot" />
                                <span>สร้างห้องส่วนตัวกับคนพิเศษ</span>
                            </div>
                            <div className="login-feature-item">
                                <div className="login-feature-dot" />
                                <span>สุ่มของขวัญด้วยวงล้อ 🎰</span>
                            </div>
                            <div className="login-feature-item">
                                <div className="login-feature-dot" />
                                <span>ระบบเพื่อนและรหัสเชิญ</span>
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
                            <h2 className="login-form-title">ยินดีต้อนรับกลับ 🌸</h2>
                            <p className="login-form-subtitle">เข้าสู่ระบบเพื่อดูความปรารถนาของคุณ</p>
                        </div>

                        <form action={dispatch} className="login-form">
                            <div className="login-field">
                                <label className="login-label" htmlFor="login-email">อีเมล</label>
                                <div className="login-input-wrapper">
                                    <div className="login-input-icon">
                                        <Mail size={16} />
                                    </div>
                                    <input
                                        id="login-email"
                                        className="login-input"
                                        type="email"
                                        name="email"
                                        placeholder="name@example.com"
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="login-field">
                                <label className="login-label" htmlFor="login-password">รหัสผ่าน</label>
                                <div className="login-input-wrapper">
                                    <div className="login-input-icon">
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        id="login-password"
                                        className="login-input"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="••••••••"
                                        autoComplete="current-password"
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

                            {errorMessage && (
                                <div className="login-error">
                                    <AlertCircle size={15} />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            <LoginButton isPending={isPending} />

                            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                                    ยังไม่มีบัญชี?{' '}
                                    <Link
                                        href="/register"
                                        style={{
                                            color: 'var(--accent-primary)',
                                            fontWeight: 700,
                                            textDecoration: 'none',
                                        }}
                                    >
                                        สมัครสมาชิก
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

function LoginButton({ isPending }: { isPending: boolean }) {
    const { pending } = useFormStatus();
    const isLoading = isPending || pending;

    return (
        <button
            className="login-submit-btn"
            aria-disabled={isLoading}
            type="submit"
        >
            {isLoading ? (
                <>
                    <div className="login-spinner" />
                    <span>กำลังเข้าสู่ระบบ...</span>
                </>
            ) : (
                <>
                    <Gift size={18} />
                    <span>เข้าสู่ระบบ</span>
                    <ArrowRight size={18} className="login-btn-arrow" />
                </>
            )}
        </button>
    );
}
