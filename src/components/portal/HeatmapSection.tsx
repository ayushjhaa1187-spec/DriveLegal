"use client";

import { Card } from "@/components/ui/Card";
import { MapPin, Info } from "lucide-react";

interface HeatmapData {
  geohash_5: string;
  state_code: string;
  total_overcharge_inr: number;
  scans_count: number;
}

export function HeatmapSection({ data }: { data: HeatmapData[] }) {
  if (!data || data.length === 0) return null;

  // Sort by highest overcharge
  const topZones = [...data]
    .sort((a, b) => b.total_overcharge_inr - a.total_overcharge_inr)
    .slice(0, 12);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          Overcharge Hotspot Zones (Geohash-5)
        </h3>
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
          <Info className="h-3 w-3" />
          Aggregated to protect user privacy
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {topZones.map((zone, i) => {
          const intensity = Math.min(zone.total_overcharge_inr / 5000, 1);
          
          return (
            <Card 
              key={i} 
              className="p-4 border-none shadow-lg bg-white dark:bg-slate-900 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform"
            >
              <div 
                className="absolute inset-0 bg-rose-500 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity"
                style={{ opacity: 0.03 + (intensity * 0.1) }}
              />
              
              <div className="relative flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-rose-500" />
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase">
                      {zone.geohash_5}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{zone.state_code}</span>
                </div>

                <div>
                  <p className="text-lg font-black text-slate-900 dark:text-white">
                    ₹{(zone.total_overcharge_inr / 1000).toFixed(1)}k
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    from {zone.scans_count} scans
                  </p>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-rose-500 h-full rounded-full"
                    style={{ width: `${intensity * 100}%` }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
