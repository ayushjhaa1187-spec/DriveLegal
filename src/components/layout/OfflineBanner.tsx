"use client";

import { WifiOff } from "lucide-react";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";

export function OfflineBanner() {
  const isOnline = useOfflineStatus();

  if (isOnline) return null;

  return (
    <div className="bg-amber-500 text-slate-900 px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium">
      <WifiOff className="h-4 w-4" />
      You are offline — core features still work from local data
    </div>
  );
}
