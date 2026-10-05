import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import { auth } from "@/auth";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Make a Wish 🎁 — แชร์ความปรารถนากับคนพิเศษ",
    description: "แอปบันทึกรายการของขวัญ/ความปรารถนาและแชร์กับคนพิเศษในห้องส่วนตัว",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Make a Wish",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: "#E8617A",
};

export default async function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const session = await auth();
    const isLoggedIn = !!session?.user;
    const role = (session?.user as { role?: string })?.role;

    return (
        <html lang="th">
            <body className={`${geist.variable} antialiased`}>
                <ClientLayout isLoggedIn={isLoggedIn} role={role}>
                    {children}
                </ClientLayout>
            </body>
        </html>
    );
}
