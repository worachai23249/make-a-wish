"use client";
// src/components/Avatar.tsx
import React from "react";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface AvatarProps {
  src?: string | null;
  emoji?: string;
  displayName?: string;
  size?: AvatarSize;
  ring?: boolean;
  className?: string;
}

export default function Avatar({
  src,
  emoji = "🌸",
  displayName,
  size = "md",
  ring = false,
  className = "",
}: AvatarProps) {
  const initial = displayName ? displayName.charAt(0).toUpperCase() : "";

  return (
    <div
      className={`avatar avatar-${size} ${ring ? "avatar-ring" : ""} ${className}`}
    >
      {src ? (
        <img src={src} alt={displayName || "avatar"} />
      ) : (
        <span>{emoji || initial}</span>
      )}
    </div>
  );
}
