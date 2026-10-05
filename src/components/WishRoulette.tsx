'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Trophy, RotateCcw } from 'lucide-react';
import ConfettiHearts from './ConfettiHearts';

export interface WishItem {
    id: string;
    title: string;
    description?: string | null;
    emoji: string;
    category: string;
    user?: {
        displayName: string;
        emoji: string;
    };
}

interface WishRouletteProps {
    wishes: WishItem[];
    isOpen: boolean;
    onClose: () => void;
}

export default function WishRoulette({ wishes, isOpen, onClose }: WishRouletteProps) {
    const [spinning, setSpinning] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [winner, setWinner] = useState<WishItem | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setSpinning(false);
            setWinner(null);
            setShowConfetti(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const startSpin = () => {
        if (wishes.length === 0 || spinning) return;

        setSpinning(true);
        setWinner(null);
        setShowConfetti(false);

        let speed = 60; // initial interval in ms
        let currentIdx = Math.floor(Math.random() * wishes.length);
        setSelectedIndex(currentIdx);

        const totalSteps = 30 + Math.floor(Math.random() * 20); // 30-50 steps
        let currentStep = 0;

        const spin = () => {
            currentIdx = (currentIdx + 1) % wishes.length;
            setSelectedIndex(currentIdx);
            currentStep++;

            if (currentStep < totalSteps) {
                // gradually slow down
                if (currentStep > totalSteps - 15) {
                    speed += 25;
                } else if (currentStep > totalSteps - 25) {
                    speed += 10;
                }
                setTimeout(spin, speed);
            } else {
                // Done!
                setSpinning(false);
                setWinner(wishes[currentIdx]);
                setShowConfetti(true);
            }
        };

        setTimeout(spin, speed);
    };

    return (
        <>
            <ConfettiHearts active={showConfetti} />

            <div className="modal-overlay" onClick={spinning ? undefined : onClose}>
                <div
                    className="modal-content"
                    style={{ maxWidth: '520px', textAlign: 'center' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={spinning ? undefined : onClose}
                        style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            background: 'none',
                            border: 'none',
                            cursor: spinning ? 'not-allowed' : 'pointer',
                            color: 'var(--text-muted)',
                        }}
                    >
                        <X size={20} />
                    </button>

                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🎰</div>
                        <h2 className="login-form-title" style={{ fontSize: '1.6rem', marginBottom: '4px' }}>
                            วงล้อสุ่มของขวัญ
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            สุ่มความปรารถนาสุดพิเศษจากทั้งหมด {wishes.length} รายการ
                        </p>
                    </div>

                    {wishes.length === 0 ? (
                        <div className="empty-state" style={{ padding: '30px 10px' }}>
                            <div className="empty-state-icon">🎁</div>
                            <p>ยังไม่มีรายการของขวัญในห้องนี้</p>
                            <span className="empty-state-hint">เพิ่มของขวัญลงในห้องก่อนเริ่มสุ่ม</span>
                        </div>
                    ) : (
                        <>
                            {/* Display area for roulette */}
                            <div
                                style={{
                                    height: '140px',
                                    borderRadius: 'var(--radius-lg)',
                                    background: 'var(--bg-elevated)',
                                    border: '2px solid var(--border-default)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '16px',
                                    marginBottom: '24px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: winner ? '0 0 30px rgba(232, 97, 122, 0.35)' : 'none',
                                    borderColor: winner ? 'var(--accent-primary)' : 'var(--border-default)',
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                {selectedIndex !== null && wishes[selectedIndex] ? (
                                    <div
                                        key={wishes[selectedIndex].id + selectedIndex}
                                        style={{
                                            animation: spinning ? 'none' : 'twBounce 0.5s ease',
                                        }}
                                    >
                                        <div style={{ fontSize: '3.2rem', marginBottom: '4px' }}>
                                            {wishes[selectedIndex].emoji || '⭐'}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '1.25rem',
                                                fontWeight: 800,
                                                color: 'var(--text-primary)',
                                            }}
                                        >
                                            {wishes[selectedIndex].title}
                                        </div>
                                        {wishes[selectedIndex].user && (
                                            <div
                                                style={{
                                                    fontSize: '0.8rem',
                                                    color: 'var(--accent-secondary)',
                                                    fontWeight: 600,
                                                    marginTop: '2px',
                                                }}
                                            >
                                                ความปรารถนาของ {wishes[selectedIndex].user?.displayName}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <Sparkles size={36} color="var(--accent-primary)" style={{ margin: '0 auto 8px' }} />
                                        <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                                            กดปุ่มด้านล่างเพื่อเริ่มสุ่ม!
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Winner announcement */}
                            {winner && (
                                <div
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(232, 97, 122, 0.15), rgba(199, 75, 138, 0.1))',
                                        border: '1.5px solid var(--accent-primary)',
                                        borderRadius: 'var(--radius-md)',
                                        padding: '14px 18px',
                                        marginBottom: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        color: 'var(--accent-primary)',
                                        fontWeight: 700,
                                        fontSize: '1.05rem',
                                        animation: 'twFadeIn 0.3s ease',
                                    }}
                                >
                                    <Trophy size={22} />
                                    <span>ผู้โชคดีได้รับ: {winner.title}! 🎉</span>
                                </div>
                            )}

                            {/* Spin button */}
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                <button
                                    onClick={startSpin}
                                    disabled={spinning}
                                    className="btn-primary"
                                    style={{
                                        width: '100%',
                                        justifyContent: 'center',
                                        padding: '14px 28px',
                                        fontSize: '1.05rem',
                                    }}
                                >
                                    {spinning ? (
                                        <>
                                            <div className="login-spinner" />
                                            <span>กำลังสุ่ม...</span>
                                        </>
                                    ) : winner ? (
                                        <>
                                            <RotateCcw size={18} />
                                            <span>สุ่มใหม่อีกครั้ง</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={18} />
                                            <span>เริ่มสุ่มของขวัญ! 🎰</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
