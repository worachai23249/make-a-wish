'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: number;
    type: ToastType;
    title: string;
    message?: string;
}

interface ToastContextType {
    showToast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}

let nextId = 0;
const TOAST_DURATION = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((type: ToastType, title: string, message?: string) => {
        const id = nextId++;
        setToasts(prev => [...prev, { id, type, title, message }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, TOAST_DURATION);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
            ))}
        </ToastContext.Provider>
    );
}

const config = {
    success: {
        Icon: CheckCircle,
        gradient: 'linear-gradient(135deg, #52B788, #6FD1A0)',
        glow: 'rgba(82, 183, 136, 0.55)',
        label: 'สำเร็จ!',
    },
    error: {
        Icon: XCircle,
        gradient: 'linear-gradient(135deg, #C84B5A, #E8617A)',
        glow: 'rgba(232, 97, 122, 0.55)',
        label: 'เกิดข้อผิดพลาด!',
    },
    warning: {
        Icon: AlertTriangle,
        gradient: 'linear-gradient(135deg, #C7831F, #F4A540)',
        glow: 'rgba(244, 165, 64, 0.55)',
        label: 'แจ้งเตือน!',
    },
    info: {
        Icon: Info,
        gradient: 'linear-gradient(135deg, #3A82B0, #7BBCF0)',
        glow: 'rgba(123, 188, 240, 0.55)',
        label: 'ข้อมูล',
    },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
    const [isExiting, setIsExiting] = useState(false);
    const { Icon, gradient, glow } = config[toast.type];

    useEffect(() => {
        const timer = setTimeout(() => setIsExiting(true), TOAST_DURATION - 400);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={() => onRemove(toast.id)}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(45, 27, 37, 0.55)',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                    zIndex: 9998,
                    animation: isExiting ? 'twFadeOut 0.4s ease forwards' : 'twFadeIn 0.3s ease forwards',
                }}
            />

            {/* Toast card */}
            <div
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 9999,
                    width: '340px',
                    background: 'white',
                    borderRadius: '28px',
                    overflow: 'hidden',
                    boxShadow: `0 20px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.5), 0 0 80px ${glow}`,
                    animation: isExiting
                        ? 'twSlideOut 0.4s cubic-bezier(0.4,0,1,1) forwards'
                        : 'twSlideIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
                    filter: `drop-shadow(0 0 40px ${glow})`,
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Top gradient bar */}
                <div style={{ height: '6px', background: gradient }} />

                <div style={{ padding: '28px 28px 24px', textAlign: 'center' }}>
                    {/* Emoji mascot */}
                    <div style={{ fontSize: '3.5rem', marginBottom: '12px', animation: 'twBounce 0.6s ease' }}>
                        {toast.type === 'success' ? '🎁' : toast.type === 'error' ? '💔' : toast.type === 'warning' ? '⚠️' : '💌'}
                    </div>

                    {/* Icon badge */}
                    <div style={{
                        width: '48px', height: '48px',
                        borderRadius: '50%',
                        background: gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        boxShadow: `0 4px 20px ${glow}`,
                    }}>
                        <Icon size={24} color="white" strokeWidth={2.5} />
                    </div>

                    {/* Title */}
                    <div style={{
                        fontSize: '1.4rem',
                        fontWeight: 900,
                        background: gradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        marginBottom: toast.message ? '8px' : '4px',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2,
                        fontFamily: "'Outfit', sans-serif",
                    }}>
                        {toast.title}
                    </div>

                    {/* Message */}
                    {toast.message && (
                        <div style={{ fontSize: '0.9rem', color: '#6B3D4E', lineHeight: 1.5, fontWeight: 500 }}>
                            {toast.message}
                        </div>
                    )}

                    {/* Hearts decoration */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '16px' }}>
                        {['🌸', '💕', '🌸'].map((h, i) => (
                            <span key={i} style={{ fontSize: '0.9rem', opacity: 0.5 }}>{h}</span>
                        ))}
                    </div>

                    {/* Progress bar */}
                    <div style={{
                        marginTop: '16px',
                        height: '4px',
                        background: 'rgba(232, 97, 122, 0.12)',
                        borderRadius: '100px',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            height: '100%',
                            background: gradient,
                            borderRadius: '100px',
                            animation: `twProgress ${TOAST_DURATION}ms linear forwards`,
                        }} />
                    </div>
                </div>

                {/* Close button */}
                <button
                    onClick={() => onRemove(toast.id)}
                    style={{
                        position: 'absolute',
                        top: '12px', right: '12px',
                        width: '32px', height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(232, 97, 122, 0.1)',
                        border: 'none',
                        color: '#E8617A',
                        fontSize: '16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                    }}
                >
                    ✕
                </button>
            </div>

            <style>{`
                @keyframes twFadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes twFadeOut { from { opacity: 1; } to { opacity: 0; } }
                @keyframes twSlideIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.85); }
                    to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }
                @keyframes twSlideOut {
                    from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    to   { opacity: 0; transform: translate(-50%, -50%) scale(0.85); }
                }
                @keyframes twBounce {
                    0% { transform: scale(0); }
                    60% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }
                @keyframes twProgress {
                    from { width: 100%; }
                    to   { width: 0%; }
                }
            `}</style>
        </>
    );
}
