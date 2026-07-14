"use client";
// src/components/Toast.tsx
import React, { useEffect } from "react";

export type ToastType = "success" | "error" | "info" | "heart";

interface ToastProps {
  msg: string;
  type?: ToastType;
  onDone: () => void;
  duration?: number;
}

const ICONS: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
  heart: "🌸",
};

export default function Toast({ msg, type = "success", onDone, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [onDone, duration]);

  return (
    <div className="toast-container">
      <div className={`toast toast-${type}`}>
        <span style={{ fontWeight: 800 }}>{ICONS[type]}</span>
        {msg}
      </div>
    </div>
  );
}
