"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff, CheckCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

interface OfflineIndicatorProps {
  /** Show the full banner (default) or a compact icon-only badge */
  variant?: "banner" | "badge";
  className?: string;
}

export function OfflineIndicator({ variant = "banner", className = "" }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [cachedDataDate, setCachedDataDate] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const onOnline = () => { setIsOnline(true); setDismissed(false); };
    const onOffline = () => { setIsOnline(false); setDismissed(false); };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    // Try to read last sync date from localStorage (set by PWA service worker)
    try {
      const stored = localStorage.getItem("drivelegal_last_sync");
      if (stored) {
        const date = new Date(stored);
        setCachedDataDate(
          date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        );
      }
    } catch {
      // localStorage not available (e.g. private browsing)
    }

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // Badge variant — just a small status dot
  if (variant === "badge") {
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-medium ${className}`}
        title={isOnline ? "Online" : "Offline — cached data in use"}
      >
        <span
          className={`h-2 w-2 rounded-full ${isOnline ? "bg-green-500" : "bg-amber-400 animate-pulse"}`}
        />
        {isOnline ? "Online" : "Offline"}
      </span>
    );
  }

  // Dismiss online banner after a few seconds
  if (isOnline && dismissed) return null;

  // ---- ONLINE BANNER ----
  if (isOnline) {
    return (
      <div
        className={`bg-green-50 dark:bg-green-950 border-b border-green-200 dark:border-green-800 px-4 py-1.5 ${className}`}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-green-700 dark:text-green-300">
            <CheckCircle className="h-3.5 w-3.5 shrink-0" />
            <span>Online — all features available</span>
            {cachedDataDate && (
              <span className="text-green-500 dark:text-green-400">
                · Law data synced: {cachedDataDate}
              </span>
            )}
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 text-xs"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  // ---- OFFLINE BANNER ----
  return (
    <div
      className={`bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800 px-4 py-2 ${className}`}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-300">
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
          <span>Offline mode — Fine calculator &amp; law browser work without internet</span>
          {cachedDataDate && (
            <span className="text-amber-600 dark:text-amber-400">
              · Using data from {cachedDataDate}
            </span>
          )}
        </div>
        <Link
          href="/offline-features"
          className="text-xs text-amber-700 dark:text-amber-300 underline underline-offset-2 hover:no-underline shrink-0"
        >
          What works offline?
        </Link>
      </div>
    </div>
  );
}
