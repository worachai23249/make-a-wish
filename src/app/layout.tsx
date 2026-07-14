// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Wishy — พื้นที่ความปรารถนาของคุณ",
  description: "แชร์ความปรารถนาและของขวัญในฝันกับคนพิเศษ",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    shortcut: "/icon-192.png",
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    title: "Wishy",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#E8547A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="gradient-bg">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

