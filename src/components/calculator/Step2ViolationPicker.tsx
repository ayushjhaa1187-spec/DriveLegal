'use client';

import type { Violation } from "@/lib/law-engine/schema";

type Category = Violation["category"];

const CATEGORIES: { value: Category; label: string; emoji: string; description: string }[] = [
  { value: "helmet", label: "Helmet", emoji: "⛑️", description: "No helmet or sub-standard helmet" },
  { value: "seatbelt", label: "Seat Belt", emoji: "🔒", description: "Not wearing seatbelt" },
  { value: "speed", label: "Speeding", emoji: "⚡", description: "Exceeding speed limits" },
  { value: "licence", label: "Licence", emoji: "🪪", description: "Driving without valid licence" },
  { value: "insurance", label: "Insurance", emoji: "📋", description: "No valid insurance" },
  { value: "intoxication", label: "Drunk Driving", emoji: "🍻", description: "Driving under influence" },
  { value: "mobile_use", label: "Mobile Use", emoji: "📱", description: "Using phone while driving" },
  { value: "dangerous_driving", label: "Dangerous Driving", emoji: "⚠️", description: "Reckless or dangerous driving" },
  { value: "registration", label: "Registration", emoji: "📄", description: "Invalid/expired registration" },
  { value: "signal_violation", label: "Signal Jump", emoji: "🚦", description: "Jumping red light/signal" },
  { value: "pollution", label: "Pollution", emoji: "💨", description: "Invalid PUC certificate" },
  { value: "overloading", label: "Overloading", emoji: "⚖️", description: "Vehicle overloaded" },
  { value: "parking", label: "Wrong Parking", emoji: "🅿️", description: "Illegal parking" },
  { value: "juvenile", label: "Juvenile Driving", emoji: "👶", description: "Minor driving motor vehicle" },
  { value: "other", label: "Other", emoji: "📝", description: "Other traffic violations" },
];

interface Step2Props {
  selectedCategory: Category | null;
  onSelectCategory: (c: Category) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step2ViolationPicker({
  selectedCategory,
  onSelectCategory,
  onNext,
  onBack,
}: Step2Props) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div>
        <label className="block text-sm font-semibold text-zinc-700 uppercase tracking-wider mb-4">
          ⚖️ Select the Violation
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              id={`cat-${cat.value}`}
              onClick={() => onSelectCategory(cat.value)}
              className={`flex flex-col items-start gap-1 p-4 rounded-2xl border-2 text-left transition-all hover:border-brand-navy
                ${selectedCategory === cat.value
                  ? "border-brand-navy bg-blue-50 shadow-md"
                  : "border-zinc-200 bg-white hover:bg-blue-50/50"
                }
              `}
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className={`font-semibold text-sm ${selectedCategory === cat.value ? "text-brand-navy" : "text-zinc-800"}`}>
                {cat.label}
              </span>
              <span className="text-xs text-zinc-500 leading-tight">{cat.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-4 bg-zinc-100 text-zinc-700 font-bold rounded-2xl text-lg hover:bg-zinc-200 transition-all"
        >
          ← Back
        </button>
        <button
          id="step2-next"
          disabled={!selectedCategory}
          onClick={onNext}
          className="flex-1 py-4 bg-brand-navy text-white font-bold rounded-2xl text-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-900 transition-all active:scale-95"
        >
          Calculate →
        </button>
      </div>
    </div>
  );
}
