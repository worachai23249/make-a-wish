'use client';

import { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

interface ConfirmContextType {
    showConfirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
    const ctx = useContext(ConfirmContext);
    if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
    return ctx;
}

interface ConfirmState extends ConfirmOptions {
    isOpen: boolean;
    resolve?: (value: boolean) => void;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<ConfirmState>({
        isOpen: false,
        title: '',
        message: '',
        type: 'warning',
    });

    const showConfirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setState({
                ...options,
                isOpen: true,
                confirmText: options.confirmText || 'ยืนยัน',
                cancelText: options.cancelText || 'ยกเลิก',
                type: options.type || 'warning',
                resolve,
            });
        });
    }, []);

    const handleConfirm = () => {
        state.resolve?.(true);
        setState({ ...state, isOpen: false });
    };

    const handleCancel = () => {
        state.resolve?.(false);
        setState({ ...state, isOpen: false });
    };

    const typeConfig = {
        danger: {
            gradient: 'linear-gradient(135deg, #C84B5A, #E8617A)',
            glow: 'rgba(232, 97, 122, 0.45)',
            Icon: AlertTriangle,
            emoji: '💔',
        },
        warning: {
            gradient: 'linear-gradient(135deg, #C7831F, #F4A540)',
            glow: 'rgba(244, 165, 64, 0.45)',
            Icon: AlertTriangle,
            emoji: '⚠️',
        },
        info: {
            gradient: 'linear-gradient(135deg, #E8617A, #C74B8A)',
            glow: 'rgba(199, 75, 138, 0.45)',
            Icon: CheckCircle,
            emoji: '🌸',
        },
    };

    const cfg = typeConfig[state.type || 'warning'];

    return (
        <ConfirmContext.Provider value={{ showConfirm }}>
            {children}

            {state.isOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 10000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    animation: 'fadeIn 0.2s ease-out',
                }}>
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(45, 27, 37, 0.65)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                        }}
                        onClick={handleCancel}
                    />

                    <div
                        style={{
                            position: 'relative',
                            background: 'linear-gradient(145deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))',
                            backdropFilter: 'blur(40px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                            border: '1.5px solid rgba(255,255,255,0.22)',
                            borderRadius: '28px',
                            width: '90%',
                            maxWidth: '460px',
                            boxShadow: `0 0 80px ${cfg.glow}, 0 20px 60px -10px rgba(0,0,0,0.5)`,
                            animation: 'modalIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            overflow: 'hidden',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0,
                            height: '100px',
                            background: cfg.gradient,
                            opacity: 0.18,
                            pointerEvents: 'none',
                        }} />

                        <div style={{ padding: '40px 32px' }}>
                            <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '3rem' }}>
                                {cfg.emoji}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                                <div style={{
                                    width: '64px', height: '64px',
                                    borderRadius: '50%',
                                    background: cfg.gradient,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: `0 8px 24px ${cfg.glow}`,
                                }}>
                                    <cfg.Icon size={32} color="white" strokeWidth={2.5} />
                                </div>
                            </div>

                            <h2 style={{
                                fontSize: '1.55rem',
                                fontWeight: 900,
                                background: cfg.gradient,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                textAlign: 'center',
                                marginBottom: '12px',
                                letterSpacing: '-0.02em',
                                fontFamily: "'Outfit', sans-serif",
                            }}>
                                {state.title}
                            </h2>

                            <p style={{
                                fontSize: '0.95rem',
                                color: '#e5e7eb',
                                textAlign: 'center',
                                lineHeight: 1.6,
                                marginBottom: '28px',
                                fontWeight: 500,
                            }}>
                                {state.message}
                            </p>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={handleCancel}
                                    style={{
                                        flex: 1, padding: '13px 20px',
                                        borderRadius: '14px',
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1.5px solid rgba(255,255,255,0.18)',
                                        color: '#d1d5db',
                                        fontSize: '0.95rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        fontFamily: "'Outfit', 'Noto Sans Thai', sans-serif",
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseOver={e => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                                        e.currentTarget.style.color = '#f3f4f6';
                                    }}
                                    onMouseOut={e => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                        e.currentTarget.style.color = '#d1d5db';
                                    }}
                                >
                                    {state.cancelText}
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    style={{
                                        flex: 1, padding: '13px 20px',
                                        borderRadius: '14px',
                                        background: cfg.gradient,
                                        border: 'none',
                                        color: 'white',
                                        fontSize: '0.95rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        fontFamily: "'Outfit', 'Noto Sans Thai', sans-serif",
                                        boxShadow: `0 4px 16px ${cfg.glow}`,
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                    {state.confirmText}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleCancel}
                            style={{
                                position: 'absolute',
                                top: '14px', right: '14px',
                                width: '36px', height: '36px',
                                borderRadius: '50%',
                                background: 'rgba(45, 27, 37, 0.6)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                cursor: 'pointer',
                                color: '#9ca3af',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                            }}
                        >
                            <X size={16} strokeWidth={2.5} />
                        </button>
                    </div>

                    <style>{`
                        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                        @keyframes modalIn {
                            from { opacity: 0; transform: scale(0.9) translateY(20px); }
                            to   { opacity: 1; transform: scale(1) translateY(0); }
                        }
                    `}</style>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}
