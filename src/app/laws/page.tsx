"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Search, Filter, Scale, ChevronRight, 
  BookOpen, Hash, MapPin, AlertCircle,
  FileText, Shield, Info, ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils/cn";
import { animations } from "@/lib/animations";
import { dataLoader } from "@/lib/data/data-loader";
import { SmartSearch } from "@/lib/search/smart-search";
import { VIOLATION_CATEGORIES } from "@/lib/constants";
import type { Violation } from "@/lib/law-engine/schema";
import mhDigest from "../../../data/digests/states/MH.json";

export default function LawsPage() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [stateCode, setStateCode] = useState<string>("central");
  const [loading, setLoading] = useState(true);

  // Load configuration
  useEffect(() => {
    const cached = localStorage.getItem("user-state");
    if (cached) {
       try {
         const { code } = JSON.parse(cached);
         setStateCode(code.toLowerCase());
       } catch {}
    }
  }, []);

  // Load violations
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await dataLoader.loadViolations(stateCode);
        setViolations(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [stateCode]);

  // Search logic
  const searchEngine = useMemo(() => new SmartSearch(violations), [violations]);
  const results = useMemo(() => {
    let filtered = violations;
    
    if (selectedCategory) {
      filtered = filtered.filter(v => v.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      return searchEngine.search(searchQuery).map(r => r.violation);
    }
    
    return filtered;
  }, [violations, searchQuery, selectedCategory, searchEngine]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
      {/* Header Section */}
      <div className="mb-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-3 flex items-center gap-3">
              <div className="h-12 w-12 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center">
                 <BookOpen className="h-6 w-6 text-white dark:text-slate-900" />
              </div>
              Legal Encyclopedia
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              The complete codex of Indian Traffic Laws. Search by section number, keyword, or category.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
             <MapPin className="h-4 w-4 text-slate-500" />
             <span className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">{stateCode} Dataset</span>
             <div className="h-4 w-px bg-slate-300 dark:bg-slate-600 mx-1" />
             <span className="text-xs font-bold text-emerald-600 uppercase tracking-tighter">Verified</span>
          </div>
        </div>

        {/* State Summary Digest Card */}
        {stateCode === "mh" && mhDigest?.key_highlights?.length > 0 && (
          <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800/30 rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Maharashtra Compounding Highlights</h3>
            </div>
            <ul className="space-y-2">
              {mhDigest.key_highlights.map((highlight, index) => (
                <li key={index} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                  {highlight}
                </li>
              ))}
            </ul>
             <p className="mt-4 text-xs font-mono text-emerald-800/60 dark:text-emerald-200/50">
               Auto-generated via Gemini processing over latest state gazette overrides.
             </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1 space-y-8">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Categories</h3>
            <div className="space-y-1.5">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-left",
                  selectedCategory === null 
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                )}
              >
                All Laws
                <span className="text-[10px] opacity-60">{violations.length}</span>
              </button>
              {VIOLATION_CATEGORIES.map((cat) => (
                <button
                  key={cat.code}
                  onClick={() => setSelectedCategory(cat.code)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-left",
                    selectedCategory === cat.code 
                      ? "bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                  )}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span className="flex-1 truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800/50">
             <Shield className="h-6 w-6 text-indigo-500 mb-3" />
             <h4 className="font-bold text-indigo-900 dark:text-indigo-400 text-sm mb-1">Official Dataset</h4>
             <p className="text-[10px] text-indigo-700/70 dark:text-indigo-400/70 leading-relaxed">
               All laws in this directory are sourced from the Central Motor Vehicles Act and State-specific GAZETTE notifications.
             </p>
          </div>
        </aside>

        {/* Search and List Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 sticky top-20 lg:top-[5.5rem] z-30 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md pb-4 pt-2">
             <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                  placeholder="Search laws e.g. 'helmet', 'Section 184'..." 
                  className="pl-12 h-14 bg-white dark:bg-slate-900 shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
             <Button variant="outline" className="h-14 px-6 gap-2 border-2">
                <Filter className="h-4 w-4" /> Filter Advanced
             </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
             <AnimatePresence mode="popLayout" initial={false}>
                {loading ? (
                  Array(6).fill(0).map((_, i) => (
                    <div key={i} className="animate-pulse bg-white dark:bg-slate-900 h-28 rounded-3xl border border-slate-100 dark:border-slate-800" />
                  ))
                ) : results.length > 0 ? (
                  results.map((v, i) => (
                    <motion.div
                      key={v.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className="p-0 overflow-hidden group border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 transition-all shadow-sm">
                        <div className="flex flex-col sm:flex-row h-full">
                           <div className="w-full sm:w-2 bg-slate-100 dark:bg-slate-800 group-hover:bg-amber-500 transition-colors" />
                           <div className="flex-1 p-6 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                     <span className="text-[10px] font-black font-mono uppercase tracking-widest text-slate-400">{v.section}</span>
                                     <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase">{v.category.replace("_", " ")}</span>
                                  </div>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                                <h3 className="font-extrabold text-slate-900 dark:text-white mb-2 leading-tight lg:pr-10">{v.title.en}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                   {v.plain_english_summary}
                                </p>
                              </div>
                           </div>
                           <div className="p-6 sm:pl-0 sm:border-l border-slate-100 dark:border-slate-800 flex flex-col justify-center items-center sm:w-32 bg-slate-50/50 dark:bg-slate-900/50">
                               <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Standard</p>
                               <p className="text-lg font-black text-slate-900 dark:text-white">
                                  ₹{v.penalty.first_offence?.fine?.fixed?.toLocaleString() || v.penalty.first_offence?.fine?.min?.toLocaleString() || "---"}
                               </p>
                               <span className="text-[12px] text-emerald-600 font-black">Min Fine</span>
                           </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-32 flex flex-col items-center text-center">
                     <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6">
                        <Search className="h-10 w-10 text-slate-400" />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No matching laws found</h3>
                     <p className="text-sm text-slate-500 max-w-sm">
                        Try searching for generic terms like "driving", "permit", or "penalty".
                     </p>
                  </div>
                )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
