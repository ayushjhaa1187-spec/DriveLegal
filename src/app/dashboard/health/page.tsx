"use client";

import { useState, useEffect } from "react";
import { 
  ChevronLeft, Info, ShieldCheck, 
  AlertCircle, History, ExternalLink, Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { animations } from "@/lib/animations";
import { computeHealth } from "@/lib/health/score";
import { HealthGauge } from "@/components/health/HealthGauge";
import { ReminderCard } from "@/components/health/ReminderCard";

export default function HealthPage() {
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [health, setHealth] = useState<any>(null);
  const [expiryDates, setExpiryDates] = useState({
    Insurance: "2026-12-15",
    PUC: "2026-05-20",
    Licence: "2034-08-10"
  });

  useEffect(() => {
    // Load history from local storage
    const stored = localStorage.getItem("drivelegal_scanHistory");
    const parsed = stored ? JSON.parse(stored) : [];
    setHistory(parsed);
    setHealth(computeHealth(parsed));

    const storedDates = localStorage.getItem("drivelegal_expiry_dates");
    if (storedDates) {
      try {
        setExpiryDates(JSON.parse(storedDates));
      } catch {}
    }
  }, []);

  const handleEditDate = (type: "Insurance" | "PUC" | "Licence") => {
    const newDate = window.prompt(`Enter new expiry date for ${type} (YYYY-MM-DD):`, expiryDates[type]);
    if (newDate && !isNaN(Date.parse(newDate))) {
      const updated = { ...expiryDates, [type]: newDate };
      setExpiryDates(updated);
      localStorage.setItem("drivelegal_expiry_dates", JSON.stringify(updated));
    } else if (newDate) {
      alert("Invalid date format. Please use YYYY-MM-DD");
    }
  };

  if (!health) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-12 flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} leftIcon={<ChevronLeft className="h-4 w-4" />}>
          Dashboard
        </Button>
        <div className="text-right">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Licence <span className="text-indigo-500">Health</span></h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Official Protection Status</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
        <motion.div {...animations.pageEnter}>
          <HealthGauge 
            score={health.score} 
            tier={health.tier} 
            status={health.status} 
          />
        </motion.div>

        <motion.div {...animations.pageEnter} transition={{ delay: 0.2 }} className="space-y-6">
           <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
                Your profile is <span className={health.tier === 'green' ? 'text-emerald-500' : health.tier === 'yellow' ? 'text-amber-500' : 'text-rose-500'}>
                  {health.status}
                </span>
              </h2>
              <p className="text-slate-500 font-medium">{health.recommendation}</p>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-slate-50 dark:bg-slate-900 border-none">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Citations</p>
                 <p className="text-2xl font-black text-slate-900 dark:text-white">{history.length}</p>
              </Card>
              <Card className="p-4 bg-slate-50 dark:bg-slate-900 border-none">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Risk Points</p>
                 <p className="text-2xl font-black text-slate-900 dark:text-white">{100 - health.score}</p>
              </Card>
           </div>

           <Button fullWidth size="lg" className="h-16 rounded-2xl bg-indigo-500 border-none shadow-xl shadow-indigo-500/20" leftIcon={<Info className="h-5 w-5" />}>
              Download Health Audit (PDF)
           </Button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* Reminders */}
         <div className="md:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
               <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Document Renewal</h3>
               <Button variant="ghost" size="sm" className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">+ Add Document</Button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
               <ReminderCard type="Insurance" expiryDate={expiryDates.Insurance} onEdit={() => handleEditDate("Insurance")} />
               <ReminderCard type="PUC" expiryDate={expiryDates.PUC} onEdit={() => handleEditDate("PUC")} />
               <ReminderCard type="Licence" expiryDate={expiryDates.Licence} onEdit={() => handleEditDate("Licence")} />
            </div>
         </div>

         {/* Tips / Insights */}
         <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Survival Tips</h3>
            <Card className="p-6 bg-slate-900 text-white relative overflow-hidden">
               <Sparkles className="h-12 w-12 text-amber-500 mb-4" />
               <h4 className="font-bold mb-2">Avoid Speed Traps</h4>
               <p className="text-xs text-slate-400 leading-relaxed">Based on your activity, you frequent MH-02. Stay under 70km/h on the Freeway to avoid automated fines.</p>
               <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase">Premium Insight</span>
                  <ExternalLink className="h-3 w-3 text-slate-600" />
               </div>
            </Card>

            <Card className="p-6 border-2 border-indigo-500/20 bg-indigo-500/5">
               <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-400 mb-2 flex items-center gap-2">
                 <ShieldCheck className="h-4 w-4" /> Legal Coverage
               </h4>
               <p className="text-xs text-slate-500 leading-relaxed">Protect your licence from suspension for as low as ₹199/year.</p>
               <Button variant="ghost" size="sm" className="mt-3 px-0 text-indigo-600 font-black uppercase tracking-widest text-[10px]">Learn More</Button>
            </Card>
         </div>
      </div>
    </div>
  );
}
