'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Box,
    Users,
    User,
    Moon,
    Sun,
    LogOut,
    ShieldCheck,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { logout } from '@/app/lib/actions';
import { useSession } from 'next-auth/react';

const userNavItems = [
    { href: '/dashboard', label: 'หน้าหลัก', icon: LayoutDashboard },
    { href: '/friends', label: 'เพื่อนของฉัน', icon: Users },
    { href: '/profile', label: 'โปรไฟล์', icon: User },
];

const adminNavItems = [
    { href: '/admin', label: 'แผงควบคุม', icon: ShieldCheck },
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
    isLoggedIn?: boolean;
    role?: string;
}

export default function Sidebar({ isOpen = false, onClose, isLoggedIn = false, role }: SidebarProps) {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const { data: session } = useSession();

    const user = session?.user as { name?: string; emoji?: string; username?: string } | undefined;
    const navItems = role === 'admin' ? adminNavItems : userNavItems;

    return (
        <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
            <div className="sidebar-brand">
                <div className="sidebar-brand-inner">
                    <div className="sidebar-logo">🎁</div>
                    <div>
                        <div className="sidebar-title">Make a Wish</div>
                        <div className="sidebar-subtitle">แชร์ความปรารถนา</div>
                    </div>
                </div>
            </div>

            {/* User info */}
            {isLoggedIn && user && (
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                }}>
                    <div style={{
                        width: '40px', height: '40px',
                        borderRadius: '50%',
                        background: 'var(--accent-gradient)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        flexShrink: 0,
                    }}>
                        {user.emoji || '🌸'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                            {user.name || 'ผู้ใช้งาน'}
                        </div>
                        <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            fontFamily: 'JetBrains Mono, monospace',
                        }}>
                            @{user.username || '...'}
                        </div>
                    </div>
                </div>
            )}

            <nav className="sidebar-nav">
                <div className="sidebar-section-label">เมนู</div>
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`sidebar-link ${isActive ? 'active' : ''}`}
                            onClick={onClose}
                        >
                            <Icon size={18} />
                            {item.label}
                        </Link>
                    );
                })}

                {/* Spaces section for user */}
                {role !== 'admin' && isLoggedIn && (
                    <Link
                        href="/dashboard"
                        className={`sidebar-link ${pathname.startsWith('/spaces') ? 'active' : ''}`}
                        onClick={onClose}
                        style={{ marginTop: '4px' }}
                    >
                        <Box size={18} />
                        ห้องของฉัน
                    </Link>
                )}
            </nav>

            <div className="sidebar-bottom-actions">
                <button
                    onClick={toggleTheme}
                    className="btn-sidebar-action theme-toggle"
                >
                    <div className="action-icon-wrapper">
                        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                    </div>
                    <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>

                {isLoggedIn ? (
                    <form action={logout} style={{ width: '100%' }}>
                        <button type="submit" className="btn-sidebar-action logout">
                            <div className="action-icon-wrapper">
                                <LogOut size={16} />
                            </div>
                            <span>ออกจากระบบ</span>
                        </button>
                    </form>
                ) : null}
            </div>

            <div className="sidebar-footer">
                Made with 💕 Make a Wish
            </div>
        </aside>
    );
}
