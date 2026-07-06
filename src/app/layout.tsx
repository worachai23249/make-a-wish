// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Wishy — พื้นที่ความปรารถนาของคุณ",
  description: "แชร์ความปรารถนาและของขวัญในฝันกับคนพิเศษ",
  themeColor: "#f4306d",
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

