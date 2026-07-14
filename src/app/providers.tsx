// src/app/providers.tsx
"use client";
import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("Service Worker registered successfully", reg))
        .catch((err) => console.error("Service Worker registration failed", err));
    }
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}
