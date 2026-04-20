"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface HealthGaugeProps {
  score: number;
  tier: "green" | "yellow" | "red";
  status: string;
}

export function HealthGauge({ score, tier, status }: HealthGaugeProps) {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const colors = {
    green: "text-emerald-500",
    yellow: "text-amber-500",
    red: "text-rose-500",
  };

  const ringGradients = {
    green: "from-emerald-500 to-teal-400",
    yellow: "from-amber-500 to-orange-400",
    red: "from-rose-500 to-red-600",
  };

  return (
    <div className="relative flex items-center justify-center h-64 w-64 mx-auto">
      <svg className="h-full w-full -rotate-90 transform">
        {/* Background Track */}
        <circle
          cx="128"
          cy="128"
          r={radius}
          stroke="currentColor"
          strokeWidth="16"
          fill="transparent"
          className="text-slate-100 dark:text-slate-800"
        />
        {/* Progress Ring */}
        <motion.circle
          cx="128"
          cy="128"
          r={radius}
          stroke="currentColor"
          strokeWidth="16"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          fill="transparent"
          strokeLinecap="round"
          className={cn(colors[tier], "drop-shadow-lg")}
        />
      </svg>
      
      {/* Central Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.p 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className={cn("text-4xl font-black", colors[tier])}
        >
          {score}
        </motion.p>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-1">
          {status}
        </p>
      </div>

      {/* Glossy Overlay */}
      <div className="absolute inset-0 rounded-full border-[20px] border-white/5 pointer-events-none" />
    </div>
  );
}
