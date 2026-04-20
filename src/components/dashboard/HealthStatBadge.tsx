"use client";

import { useState, useEffect } from "react";
import { ShieldCheck } from "lucide-react";
import { computeHealth } from "@/lib/health/score";
import { StatCard } from "@/components/dashboard/StatCard";

export function HealthStatBadge() {
  const [mounted, setMounted] = useState(false);
  const [healthData, setHealthData] = useState({ status: "SAFE", color: "emerald" });

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("drivelegal_scanHistory");
      const history = stored ? JSON.parse(stored) : [];
      const { status, tier } = computeHealth(history);
      
      const colorMap: Record<string, string> = {
        green: "emerald",
        yellow: "amber",
        red: "rose"
      };
      
      setHealthData({ status, color: colorMap[tier] || "emerald" });
    } catch {
      // Default fallback
    }
  }, []);

  if (!mounted) {
    return (
      <StatCard 
        icon={ShieldCheck}
        title="Rights Guard"
        value="..."
        subtitle="Licence Health"
        color="emerald"
      />
    );
  }

  return (
    <StatCard 
      icon={ShieldCheck}
      title="Rights Guard"
      value={healthData.status}
      subtitle="Licence Health"
      color={healthData.color as any}
    />
  );
}
