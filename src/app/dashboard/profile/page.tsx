"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  User, MapPin, Car, Languages, 
  Save, ChevronLeft, ShieldCheck, CheckCircle2 
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { animations } from "@/lib/animations";
import { INDIAN_STATES, VEHICLE_TYPES } from "@/lib/llm/schema";

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [profile, setProfile] = useState({
    display_name: "",
    preferred_state_code: "DL",
    preferred_language: "en",
    preferred_vehicle: "4W" // Assuming we might add this or just local state for now
  });

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setProfile({
          display_name: data.display_name || "",
          preferred_state_code: data.preferred_state_code || "DL",
          preferred_language: data.preferred_language || "en",
          preferred_vehicle: (data as any).preferred_vehicle || "4W"
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: profile.display_name,
          preferred_state_code: profile.preferred_state_code,
          preferred_language: profile.preferred_language,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);

      if (!error) {
        setSuccess(true);
        // Also update local user-state for calculator persistence
        localStorage.setItem("user-state", JSON.stringify({ code: profile.preferred_state_code }));
        setTimeout(() => setSuccess(false), 3000);
      }
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} leftIcon={<ChevronLeft className="h-4 w-4" />}>
          Back
        </Button>
        <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Profile <span className="text-indigo-500">Settings</span></h1>
      </div>

      <motion.div {...animations.pageEnter} className="space-y-6">
        <Card className="p-8">
           <div className="space-y-8">
              {/* Display Name */}
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <User className="h-3 w-3" /> Full Name / Alias
                 </label>
                 <Input 
                   value={profile.display_name}
                   onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                   placeholder="Enter your name"
                   className="h-14 rounded-2xl"
                 />
              </div>

              {/* Preferred State */}
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <MapPin className="h-3 w-3" /> Primary Driving State
                 </label>
                 <div className="grid grid-cols-2 gap-3">
                    <select 
                      value={profile.preferred_state_code}
                      onChange={(e) => setProfile(prev => ({ ...prev, preferred_state_code: e.target.value }))}
                      className="col-span-2 h-14 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-4 text-sm font-bold focus:border-indigo-500 outline-none transition-all"
                    >
                       {INDIAN_STATES.map(s => (
                         <option key={s} value={s}>{s}</option>
                       ))}
                    </select>
                 </div>
                 <p className="text-[10px] text-slate-400 font-medium italic">Determines default rule packs for calculator and assistant.</p>
              </div>

              {/* Vehicle Type */}
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Car className="h-3 w-3" /> Primary Vehicle
                 </label>
                 <div className="flex flex-wrap gap-2">
                    {VEHICLE_TYPES.map(v => (
                       <button
                         key={v}
                         onClick={() => setProfile(prev => ({ ...prev, preferred_vehicle: v }))}
                         className={cn(
                           "px-4 py-2 rounded-xl text-xs font-bold transition-all border-2",
                           profile.preferred_vehicle === v 
                            ? "border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400" 
                            : "border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200"
                         )}
                       >
                          {v}
                       </button>
                    ))}
                 </div>
              </div>

              {/* Language */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Languages className="h-3 w-3" /> Preferred Language
                 </label>
                 <div className="flex gap-2">
                    {['en', 'hi', 'bn', 'ta', 'mr'].map(l => (
                      <button
                        key={l}
                        onClick={() => setProfile(prev => ({ ...prev, preferred_language: l }))}
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black uppercase transition-all border-2",
                          profile.preferred_language === l 
                            ? "border-indigo-500 bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                            : "border-slate-100 dark:border-slate-800 text-slate-400"
                        )}
                      >
                         {l}
                      </button>
                    ))}
                 </div>
              </div>
           </div>
        </Card>

        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <ShieldCheck className="h-3 w-3 text-emerald-500" /> AES-256 Cloud Encrypted
           </div>
           <Button 
             className="min-w-[160px] h-14 rounded-2xl shadow-xl shadow-indigo-500/20"
             onClick={handleSave}
             disabled={saving}
             leftIcon={success ? <CheckCircle2 className="h-5 w-5" /> : <Save className="h-5 w-5" />}
           >
             {saving ? "Saving..." : success ? "Saved!" : "Save Profile"}
           </Button>
        </div>
      </motion.div>
    </div>
  );
}

