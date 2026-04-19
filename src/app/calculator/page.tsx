'use client';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { WizardProgress } from "@/components/calculator/WizardProgress";
import { Step1StateVehicle } from "@/components/calculator/Step1StateVehicle";
import { Step2ViolationPicker } from "@/components/calculator/Step2ViolationPicker";
import { ResultCard } from "@/components/calculator/ResultCard";
import { queryViolations } from "@/lib/law-engine/engine";
import type { VehicleTypeInput, QueryResult } from "@/lib/law-engine/types";
import type { Violation } from "@/lib/law-engine/schema";

type Category = Violation["category"];
type Step = 1 | 2 | 3;

function CalculatorInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Wizard state
  const [step, setStep] = useState<Step>(1);
  const [selectedState, setSelectedState] = useState<string | null>(
    searchParams.get("state") ?? null
  );
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleTypeInput | null>(
    (searchParams.get("vehicle") as VehicleTypeInput) ?? null
  );
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    (searchParams.get("category") as Category) ?? null
  );
  const [isRepeatOffender, setIsRepeatOffender] = useState(
    searchParams.get("repeat") === "1"
  );
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If URL has all params pre-filled, jump to result
  useEffect(() => {
    if (selectedState && selectedVehicle && selectedCategory) {
      setStep(3);
      runQuery(selectedState, selectedVehicle, selectedCategory, isRepeatOffender);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runQuery(
    state: string | null,
    vehicle: VehicleTypeInput,
    category: Category,
    repeat: boolean
  ) {
    setIsLoading(true);
    setQueryResult(null);
    try {
      const result = await queryViolations({
        stateCode: state,
        vehicleType: vehicle,
        category,
        isRepeatOffender: repeat,
      });
      setQueryResult(result);
    } catch (e) {
      console.error("Engine error:", e);
    } finally {
      setIsLoading(false);
    }
  }

  function goToStep2() {
    if (!selectedState || !selectedVehicle) return;
    setStep(2);
  }

  function goToStep3() {
    if (!selectedCategory || !selectedVehicle) return;
    setStep(3);
    runQuery(selectedState, selectedVehicle, selectedCategory, isRepeatOffender);
  }

  function handleToggleRepeat(val: boolean) {
    setIsRepeatOffender(val);
    if (selectedCategory && selectedVehicle) {
      runQuery(selectedState, selectedVehicle, selectedCategory, val);
    }
  }

  function handleReset() {
    setStep(1);
    setSelectedState(null);
    setSelectedVehicle(null);
    setSelectedCategory(null);
    setIsRepeatOffender(false);
    setQueryResult(null);
    router.replace("/calculator");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-10">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-brand-navy transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-3xl font-black font-headings text-zinc-900">
            Challan Calculator
          </h1>
          <p className="text-zinc-500 mt-1">
            Instant, offline, source-backed fine lookup
          </p>
        </div>

        {/* Progress */}
        <WizardProgress currentStep={step} />

        {/* Steps */}
        {step === 1 && (
          <Step1StateVehicle
            selectedState={selectedState}
            selectedVehicle={selectedVehicle}
            onSelectState={setSelectedState}
            onSelectVehicle={setSelectedVehicle}
            onNext={goToStep2}
          />
        )}

        {step === 2 && (
          <Step2ViolationPicker
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onNext={goToStep3}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <div>
            {isLoading ? (
              <div className="space-y-6 animate-slide-up">
                <div className="bg-white rounded-3xl border border-zinc-100 p-8 shadow-xl">
                  <div className="h-4 w-24 bg-zinc-100 rounded animate-pulse mb-6" />
                  <div className="h-16 w-48 bg-zinc-100 rounded animate-pulse mb-8" />
                  <div className="space-y-4">
                    <div className="h-4 w-full bg-zinc-50 rounded animate-pulse" />
                    <div className="h-4 w-5/6 bg-zinc-50 rounded animate-pulse" />
                    <div className="h-4 w-4/6 bg-zinc-50 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ) : queryResult ? (
              <ResultCard
                result={queryResult}
                isRepeatOffender={isRepeatOffender}
                onToggleRepeat={handleToggleRepeat}
                onReset={handleReset}
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <Suspense>
      <CalculatorInner />
    </Suspense>
  );
}
