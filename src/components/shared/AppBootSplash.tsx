"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export function AppBootSplash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 900);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: "#0B1A3A" }}
      aria-live="polite"
      aria-label="DriveLegal loading"
    >
      {/* Tricolor top bar */}
      <div className="absolute top-0 left-0 right-0 flex h-1.5">
        <div className="flex-1" style={{ background: "#FF9933" }} />
        <div className="flex-1" style={{ background: "#FFFFFF" }} />
        <div className="flex-1" style={{ background: "#138808" }} />
      </div>

      {/* Shield Logo */}
      <div className="mb-5 animate-pulse">
        <Image
          src="/brand/drivelegal-shield.svg"
          alt="DriveLegal"
          width={80}
          height={80}
          priority
        />
      </div>

      {/* Brand name */}
      <div
        className="font-extrabold tracking-tight text-3xl mb-2"
        style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}
      >
        <span style={{ color: "#f59e0b" }}>Drive</span>
        <span style={{ color: "#ffffff" }}>Legal</span>
      </div>

      <p className="text-slate-400 text-sm mb-6">
        India&apos;s Road Safety Initiative
      </p>

      {/* Tricolor progress bar */}
      <div className="w-48 h-1 rounded-full overflow-hidden bg-slate-800">
        <div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, #FF9933, #f59e0b, #138808)",
            animation: "bootProgress 0.85s ease-out forwards",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes bootProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>

      {/* Disclaimer */}
      <p className="absolute bottom-4 text-slate-600 text-xs text-center px-4">
        Not an official Government of India website.
      </p>
    </div>
  );
}
