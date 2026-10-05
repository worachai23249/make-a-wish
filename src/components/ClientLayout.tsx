'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { ToastProvider } from '@/components/Toast';
import { ConfirmProvider } from '@/components/ConfirmDialog';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SessionProvider } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';

export default function ClientLayout({
    children,
    isLoggedIn = false,
    role,
}: {
    children: React.ReactNode;
    isLoggedIn?: boolean;
    role?: string;
}) {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/register';
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    return (
        <SessionProvider>
            <ThemeProvider>
                <ToastProvider>
                    <ConfirmProvider>
                        {isAuthPage ? (
                            children
                        ) : (
                            <>
                                <button
                                    className="mobile-menu-btn"
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    aria-label="Toggle menu"
                                >
                                    {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                                </button>

                                {sidebarOpen && (
                                    <div
                                        className="sidebar-overlay"
                                        onClick={() => setSidebarOpen(false)}
                                    />
                                )}

                                <Sidebar
                                    isOpen={sidebarOpen}
                                    onClose={() => setSidebarOpen(false)}
                                    isLoggedIn={isLoggedIn}
                                    role={role}
                                />
                                <div className="main-content">
                                    {children}
                                </div>
                            </>
                        )}
                    </ConfirmProvider>
                </ToastProvider>
            </ThemeProvider>
        </SessionProvider>
    );
}
