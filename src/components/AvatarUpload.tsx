'use client';

import { useState, useRef } from 'react';
import { Camera, RefreshCw } from 'lucide-react';
import { useToast } from './Toast';

interface AvatarUploadProps {
    currentAvatarUrl?: string | null;
    userId?: string;
    emoji?: string;
    onImageCompressed: (base64Data: string) => void;
}

export default function AvatarUpload({
    currentAvatarUrl,
    userId,
    emoji = '🌸',
    onImageCompressed,
}: AvatarUploadProps) {
    const { showToast } = useToast();
    const [preview, setPreview] = useState<string | null>(
        currentAvatarUrl || (userId ? `/api/users/${userId}/avatar` : null)
    );
    const [compressing, setCompressing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast('error', 'ไฟล์ไม่ถูกต้อง', 'กรุณาเลือกไฟล์รูปภาพเท่านั้น');
            return;
        }

        setCompressing(true);
        const reader = new FileReader();

        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // HTML5 Canvas compression
                const canvas = document.createElement('canvas');
                const MAX_SIZE = 256;
                let width = img.width;
                let height = img.height;

                // Scale down maintaining aspect ratio
                if (width > height) {
                    if (width > MAX_SIZE) {
                        height = Math.round((height * MAX_SIZE) / width);
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width = Math.round((width * MAX_SIZE) / height);
                        height = MAX_SIZE;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    setCompressing(false);
                    return;
                }

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);

                // 82% quality JPEG
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);

                setPreview(compressedBase64);
                onImageCompressed(compressedBase64);
                setCompressing(false);

                // Calculate file size reduction
                const approxSizeKB = Math.round((compressedBase64.length * 3) / 4 / 1024);
                showToast('success', 'บีบอัดรูปสำเร็จ!', `ขนาดรูปภาพเหลือเพียง ~${approxSizeKB} KB`);
            };

            img.onerror = () => {
                setCompressing(false);
                showToast('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถอ่านไฟล์รูปภาพได้');
            };

            img.src = event.target?.result as string;
        };

        reader.readAsDataURL(file);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div
                className="avatar-wrapper"
                onClick={() => fileInputRef.current?.click()}
                style={{
                    width: '110px',
                    height: '110px',
                    borderRadius: '50%',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '3px solid var(--border-default)',
                    boxShadow: '0 8px 24px rgba(232, 97, 122, 0.25)',
                    background: 'var(--bg-elevated)',
                    cursor: 'pointer',
                }}
            >
                {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={preview}
                        alt="Avatar"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '3rem',
                            background: 'var(--accent-gradient)',
                        }}
                    >
                        {emoji}
                    </div>
                )}

                <div className="avatar-overlay">
                    {compressing ? <RefreshCw className="animate-spin" size={24} /> : <Camera size={24} />}
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />

            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-primary)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                }}
            >
                <Camera size={14} />
                <span>เปลี่ยนรูปโปรไฟล์</span>
            </button>
        </div>
    );
}
