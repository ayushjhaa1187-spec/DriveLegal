"use client";

import { motion } from "framer-motion";
import { AlertTriangle, MapPin, Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { animations } from "@/lib/animations";
import type { VIPCorridor } from "@/lib/geo/alerts";

interface VIPAlertProps {
  corridor: VIPCorridor;
}

export function VIPAlert({ corridor }: VIPAlertProps) {
  return (
    <motion.div {...animations.pageEnter} className="w-full">
      <Card className="bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-200 dark:border-amber-800 p-6 overflow-hidden relative group">
        {/* Animated background pulse */}
        <div className="absolute top-0 right-0 h-32 w-32 bg-amber-500/10 rounded-full -translate-y-16 translate-x-16 blur-3xl group-hover:scale-150 transition-transform duration-700" />
        
        <div className="flex gap-5 relative z-10">
          <div className="h-14 w-14 bg-amber-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
             <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">High-Enforcement Zone Detected</span>
              <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            </div>
            
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {corridor.name}, <span className="text-amber-600 font-bold">{corridor.city}</span>
            </h3>
            
            <p className="text-sm text-amber-900/70 dark:text-amber-300/70 font-medium leading-relaxed italic">
              "{corridor.alertMessage}"
            </p>
            
            <div className="pt-3 flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/50 dark:bg-black/20 rounded-full border border-amber-200/50 dark:border-amber-800/50 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                <Info className="h-3 w-3" /> Strict Speed Enforcement
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/50 dark:bg-black/20 rounded-full border border-amber-200/50 dark:border-amber-800/50 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                <MapPin className="h-3 w-3" /> CCTV Surveillance Area
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
