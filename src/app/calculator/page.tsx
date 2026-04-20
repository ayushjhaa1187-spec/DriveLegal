"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Car, Bike, Truck, Search, History, Scale, 
  ChevronRight, ArrowLeft, RefreshCw, AlertCircle, CheckCircle2,
  Calculator, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Skeleton, CalculatorResultSkeleton } from "@/components/ui/Skeleton";
import { dataLoader } from "@/lib/data/data-loader";
import { SmartSearch } from "@/lib/search/smart-search";
import { VEHICLE_TYPES, VIOLATION_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import { WhatsAppShare } from "@/components/shared/WhatsAppShare";
import { animations } from "@/lib/animations";
import { resolveViolation } from "@/lib/law-engine/resolver"; 
import { Step3ConfirmSubmit } from "@/components/calculator/Step3ConfirmSubmit";
import { ResultCard } from "@/components/calculator/ResultCard";
import { queryViolations } from "@/lib/law-engine/engine";
import type { QueryResult } from "@/lib/law-engine/types";
import type { Violation } from "@/lib/law-engine/schema";

export default function CalculatorPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [vehicle, setVehicle] = useState<string | null>(null);
  const [stateCode, setStateCode] = useState<string>("central");
  const [searchQuery, setSearchQuery] = useState("");
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [isRepeatOffender, setIsRepeatOffender] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);

  // Load state from Storage
  useEffect(() => {
    const cached = localStorage.getItem("user-state");
    if (cached) {
      try {
        const { code } = JSON.parse(cached);
        setStateCode(code.toLowerCase());
      } catch {}
    }

    // Listen for state changes
    const handleStateChange = (e: any) => {
      setStateCode(e.detail.code.toLowerCase());
    };
    window.addEventListener("state-changed", handleStateChange);
    return () => window.removeEventListener("state-changed", handleStateChange);
  }, []);

  // Load violations when state changes
  useEffect(() => {
    setLoading(true);
    dataLoader.loadViolations(stateCode)
      .then(setViolations)
      .finally(() => setLoading(false));
  }, [stateCode]);

  // Smart Search logic
  const searchEngine = useMemo(() => new SmartSearch(violations), [violations]);
  const searchResults = useMemo(() => 
    searchEngine.search(searchQuery, { vehicleType: vehicle || "all" }),
    [searchEngine, searchQuery, vehicle]
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
            <Calculator className="h-8 w-8 text-amber-500" />
            Legal Calculator
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {step < 4 
              ? `Step ${step} of 3: ${step === 1 ? "Choose Vehicle" : step === 2 ? "Specify Violation" : "Review Details"}`
              : "Legal Resolution Found"}
          </p>
        </div>
        {step > 1 && (
          <Button variant="ghost" size="sm" onClick={() => setStep(step - 1 as any)} leftIcon={<ArrowLeft />}>
            Back
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: VEHICLE SELECTION */}
        {step === 1 && (
          <motion.div key="step1" {...animations.pageEnter} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VEHICLE_TYPES.map((type) => (
              <Card
                key={type.code}
                variant="interactive"
                className={cn("p-6", vehicle === type.code && "border-amber-500 bg-amber-50/50 dark:bg-amber-900/20")}
                onClick={() => {
                  setVehicle(type.code);
                  setStep(2);
                }}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center",
                    vehicle === type.code ? "bg-amber-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  )}>
                    {type.code === "2W" ? <Bike /> : type.code === "HMV" ? <Truck /> : <Car />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{type.label}</h3>
                    <p className="text-sm text-slate-500">Select to see specific laws</p>
                  </div>
                  <ChevronRight className="ml-auto text-slate-300" />
                </div>
              </Card>
            ))}
          </motion.div>
        )}

        {/* STEP 2: VIOLATION SEARCH */}
        {step === 2 && (
          <motion.div key="step2" {...animations.pageEnter} className="space-y-6">
            <div className="sticky top-[7.5rem] lg:top-[9rem] z-20 bg-slate-50 dark:bg-slate-950 pb-4">
              <Input
                placeholder="Search e.g. 'no helmet', 'signal jump', 'Section 184'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="h-5 w-5" />}
                autoFocus
              />
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                {VIOLATION_CATEGORIES.map((cat) => (
                  <button
                    key={cat.code}
                    onClick={() => setSearchQuery(cat.label)}
                    className="whitespace-nowrap px-4 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:border-amber-400 dark:hover:border-amber-500 transition-colors"
                  >
                    <span className="mr-1.5">{cat.icon}</span> {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {loading ? (
                Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
              ) : searchResults.length > 0 ? (
                searchResults.map((res) => (
                  <Card
                    key={res.violation.id}
                    variant="interactive"
                    className="p-5"
                    onClick={() => {
                      setSelectedViolation(res.violation);
                      setStep(3);
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200">
                        {res.violation.category.replace("_", " ")}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{res.violation.section}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">{res.violation.title.en}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {res.violation.plain_english_summary}
                    </p>
                  </Card>
                ))
              ) : (
                <div className="text-center py-20 bg-slate-100/50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                  <div className="h-16 w-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-700 dark:text-slate-300">No results found</h3>
                  <p className="text-slate-500">Try common terms like "helmet" or "license".</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* STEP 3: REVIEW & CONFIRM */}
        {step === 3 && selectedViolation && (
          <motion.div key="step3" {...animations.pageEnter}>
            <Step3ConfirmSubmit 
               params={{
                 stateCode: stateCode === "central" ? null : stateCode.toUpperCase(),
                 vehicleType: (vehicle || "all") as any,
                 violationId: selectedViolation.id,
                 isRepeatOffender,
                 category: selectedViolation.category
               }}
               isLoading={calculating}
               onEditStep={(s) => setStep(s as any)}
               onSubmit={async () => {
                 setCalculating(true);
                 try {
                   const res = await queryViolations({
                     stateCode: stateCode === "central" ? null : stateCode.toUpperCase(),
                     vehicleType: (vehicle || "all") as any,
                     violationId: selectedViolation.id,
                     isRepeatOffender,
                     category: selectedViolation.category
                   });
                   setQueryResult(res);
                   setStep(4);
                 } finally {
                   setCalculating(false);
                 }
               }}
            />
          </motion.div>
        )}

        {/* STEP 4: RESULTS */}
        {step === 4 && queryResult && (
          <motion.div key="step4" {...animations.pageEnter}>
            <ResultCard 
              result={queryResult}
              isRepeatOffender={isRepeatOffender}
              onToggleRepeat={(val) => {
                setIsRepeatOffender(val);
                // Trigger re-calculation
                queryViolations({
                   ...queryResult.params,
                   isRepeatOffender: val
                }).then(setQueryResult);
              }}
              onReset={() => {
                setStep(1);
                setSelectedViolation(null);
                setQueryResult(null);
                setSearchQuery("");
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
