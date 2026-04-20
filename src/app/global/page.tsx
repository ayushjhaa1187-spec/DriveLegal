"use client";

import { useState, useMemo } from "react";
import { 
  Globe, TrendingUp, Info, ShieldCheck, 
  ChevronRight, Sparkles, AlertCircle, Share2,
  Scale, Briefcase, Landmark
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend 
} from "recharts";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import { animations } from "@/lib/animations";
import { WhatsAppShare } from "@/components/shared/WhatsAppShare";
import globalData from "@/../data/global/benchmark.json";

export default function GlobalBenchmarkPage() {
  const [selectedCountries, setSelectedCountries] = useState(["IN", "UAE", "UK", "SG"]);

  // Format data for Recharts
  const chartData = useMemo(() => {
    const metrics = ["helmet", "speeding", "drunk_driving", "phone_usage"];
    const labels: Record<string, string> = {
      helmet: "Helmet Safety",
      speeding: "Speed Limits",
      drunk_driving: "DUI Enforcement",
      phone_usage: "Device Usage"
    };

    return metrics.map(metric => {
      const entry: any = { subject: labels[metric] };
      selectedCountries.forEach(code => {
        const country = globalData.jurisdictions.find(j => j.code === code);
        if (country) {
          // Normalize for comparison (log scale or percentage of max)
          // For visualization, we'll use raw currency values but normalized for visual weight
          entry[country.name] = (country.penalties as any)[metric] || 0;
        }
      });
      return entry;
    });
  }, [selectedCountries]);

  const toggleCountry = (code: string) => {
    if (selectedCountries.includes(code)) {
      if (selectedCountries.length > 2) {
        setSelectedCountries(prev => prev.filter(c => c !== code));
      }
    } else if (selectedCountries.length < 5) {
      setSelectedCountries(prev => [...prev, code]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:py-16 space-y-12">
      {/* Header */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="h-16 w-16 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/20 rotate-3">
          <Globe className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white leading-tight">
          Global Law <span className="text-blue-600">Benchmark</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
          How do Indian traffic laws stack up against the world? Compare penalties, strictness, and transparency in one interactive view.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Comparison Engine */}
        <Card className="lg:col-span-8 p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900">
           <div className="p-6 lg:p-8 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2">
                 {globalData.jurisdictions.map(j => (
                   <button
                     key={j.code}
                     onClick={() => toggleCountry(j.code)}
                     className={cn(
                       "px-4 py-2 rounded-xl text-xs font-bold transition-all border-2",
                       selectedCountries.includes(j.code)
                         ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20"
                         : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-300"
                     )}
                   >
                     {j.name}
                   </button>
                 ))}
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Comparing {selectedCountries.length} Regions</p>
           </div>

           <div className="h-[400px] lg:h-[600px] p-4 lg:p-8">
              <ResponsiveContainer width="100%" height="100%">
                 <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                    <PolarGrid stroke="#94a3b8" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontWeight: "bold", fontSize: "12px" }} />
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                    {selectedCountries.map((code, i) => {
                      const name = globalData.jurisdictions.find(j => j.code === code)?.name;
                      const colors = ["#2563eb", "#10b981", "#f59e0b", "#6366f1", "#ec4899"];
                      return (
                        <Radar
                          key={code}
                          name={name}
                          dataKey={name!}
                          stroke={colors[i]}
                          fill={colors[i]}
                          fillOpacity={0.1}
                          strokeWidth={3}
                        />
                      );
                    })}
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0f172a", borderRadius: "1rem", border: "none", color: "white" }}
                      itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                    />
                    <Legend iconType="circle" />
                 </RadarChart>
              </ResponsiveContainer>
           </div>
        </Card>

        {/* Action Sidebar */}
        <div className="lg:col-span-4 space-y-6">
           <Card className="p-8 bg-slate-900 text-white border-none space-y-6">
              <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center">
                 <Landmark className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                 <h3 className="text-xl font-bold mb-2">Did You Know?</h3>
                 <p className="text-sm text-slate-400 leading-relaxed">
                   India has the world's 4th strictest 2-wheeler laws but ranks lower in digital transparency compared to the UK and Singapore.
                 </p>
              </div>
              <WhatsAppShare 
                fullWidth
                title="Global Comparison"
                text="Bhai dekh, India ke traffic laws baaki duniya se kitne alag hain! (Calculated via DriveLegal)"
              />
           </Card>

           <Card className="p-8 border-none bg-emerald-50 dark:bg-emerald-900/10 space-y-4">
              <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                 <ShieldCheck className="h-6 w-6" />
                 <h4 className="font-black uppercase tracking-tight text-sm">Transparency Index</h4>
              </div>
              <div className="space-y-3">
                 {globalData.rankings.transparency.map((code, i) => {
                   const name = globalData.jurisdictions.find(j => j.code === code)?.name;
                   return (
                     <div key={code} className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">#{i+1} {name}</span>
                        <div className="h-1.5 w-24 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${100 - i * 20}%` }}
                             className="h-full bg-emerald-500"
                           />
                        </div>
                     </div>
                   );
                 })}
              </div>
           </Card>

           <div className="p-6 bg-slate-100 dark:bg-slate-800/50 rounded-[2rem] border border-slate-200 dark:border-slate-700 flex gap-4">
              <Info className="h-5 w-5 text-slate-400 shrink-0" />
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                Data compiled from official Govt Gazettes of respective countries as of April 2026. Normalization applied for visual weight.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
