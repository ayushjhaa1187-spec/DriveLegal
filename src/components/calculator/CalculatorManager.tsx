"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Car, Bike, Truck, Search, ArrowLeft, ChevronRight, Calculator as CalcIcon 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { dataLoader } from "@/lib/data/data-loader";
import { SmartSearch } from "@/lib/search/smart-search";
import { VEHICLE_TYPES, VIOLATION_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import { animations } from "@/lib/animations";
import { queryViolations } from "@/lib/law-engine/engine";
import { Step3ConfirmSubmit } from "@/components/calculator/Step3ConfirmSubmit";
import { ResultCard } from "@/components/calculator/ResultCard";
import type { QueryResult } from "@/lib/law-engine/types";
import type { Violation } from "@/lib/law-engine/schema";

interface CalculatorManagerProps {
  embedded?: boolean;
  initialState?: string;
}

export function CalculatorManager({ embedded = false, initialState = "" }: CalculatorManagerProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [vehicle, setVehicle] = useState<string | null>(null);
  const [stateCode, setStateCode] = useState<string>(initialState || "central");
  const [searchQuery, setSearchQuery] = useState("");
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [isRepeatOffender, setIsRepeatOffender] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);

  useEffect(() => {
    if (!initialState) {
      const cached = localStorage.getItem("user-state");
      if (cached) {
        try {
          const { code } = JSON.parse(cached);
          setStateCode(code.toLowerCase());
        } catch {}
      }
    }
  }, [initialState]);

  useEffect(() => {
    setLoading(true);
    dataLoader.loadViolations(stateCode)
      .then(setViolations)
      .finally(() => setLoading(false));
  }, [stateCode]);

  const searchEngine = useMemo(() => new SmartSearch(violations), [violations]);
  const searchResults = useMemo(() => 
    searchEngine.search(searchQuery, { vehicleType: vehicle || "all" }),
    [searchEngine, searchQuery, vehicle]
  );

  return (
    <div className={cn("w-full", !embedded && "max-w-4xl mx-auto px-4 py-8 lg:py-12")}>
      {!embedded && (
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
              <CalcIcon className="h-8 w-8 text-amber-500" />
              Legal Calculator
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {step < 4 ? `Step ${step} of 3` : "Resolution Found"}
            </p>
          </div>
          {step > 1 && (
            <Button variant="ghost" size="sm" onClick={() => setStep(step - 1 as any)} leftIcon={<ArrowLeft />}>
              Back
            </Button>
          )}
        </div>
      )}

      {embedded && step > 1 && (
        <button onClick={() => setStep(step - 1 as any)} className="mb-4 text-xs font-bold text-amber-600 flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> Back
        </button>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" {...animations.pageEnter} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VEHICLE_TYPES.map((type) => (
              <Card
                key={type.code}
                variant="interactive"
                className={cn("p-4", vehicle === type.code && "border-amber-500 bg-amber-50")}
                onClick={() => { setVehicle(type.code); setStep(2); }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    {type.code === "2W" ? <Bike /> : type.code === "HMV" ? <Truck /> : <Car />}
                  </div>
                  <h2 className="font-bold text-base">{type.label}</h2>
                </div>
              </Card>
            ))}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" {...animations.pageEnter} className="space-y-4">
            <Input
              placeholder="Search e.g. 'helmet'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
            <div className="space-y-2">
              {loading ? <Skeleton className="h-20 w-full" /> : searchResults.map(res => (
                <Card key={res.violation.id} variant="interactive" className="p-4" onClick={() => { setSelectedViolation(res.violation); setStep(3); }}>
                  <div className="text-[10px] font-bold text-amber-600 uppercase mb-1">{res.violation.category}</div>
                  <div className="font-bold text-sm">{res.violation.title.en}</div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

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
                 } finally { setCalculating(false); }
               }}
            />
          </motion.div>
        )}

        {step === 4 && queryResult && (
          <motion.div key="step4" {...animations.pageEnter}>
            <ResultCard 
              result={queryResult}
              isRepeatOffender={isRepeatOffender}
              onToggleRepeat={(val) => {
                setIsRepeatOffender(val);
                queryViolations({ ...queryResult.params, isRepeatOffender: val }).then(setQueryResult);
              }}
              onReset={() => { setStep(1); setQueryResult(null); }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
