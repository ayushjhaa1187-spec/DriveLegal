"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { INDIAN_STATES, VEHICLE_TYPES, VIOLATION_CATEGORIES } from "@/lib/constants";
import { formatCurrency, formatFineRange } from "@/lib/utils/format-currency";

export default function CalculatorPage() {
  const [category, setCategory] = useState("");
  const [state, setState] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [repeat, setRepeat] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 py-4">
          <Calculator className="h-7 w-7 text-amber-500" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Challan Calculator
          </h1>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">

          {/* Violation Category */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Violation Type
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
            >
              <option value="">Select violation...</option>
              {VIOLATION_CATEGORIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.icon} {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              State / UT
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
            >
              <option value="">Select state...</option>
              {INDIAN_STATES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Vehicle Type
            </label>
            <select
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
            >
              <option value="">Select vehicle...</option>
              {VEHICLE_TYPES.map((v) => (
                <option key={v.code} value={v.code}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          {/* Repeat Offender */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="repeat"
              checked={repeat}
              onChange={(e) => setRepeat(e.target.checked)}
              className="h-5 w-5 rounded accent-amber-500"
            />
            <label htmlFor="repeat" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Repeat offender (second or subsequent offence)
            </label>
          </div>

          {/* Result Placeholder */}
          {category && (
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-5 mt-2">
              <p className="text-sm text-amber-700 dark:text-amber-300 font-medium mb-1">
                Estimated Fine
              </p>
              <p className="text-4xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(1000)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                ⚠️ This is a placeholder. Connect law data JSON to show real fines.
              </p>
            </div>
          )}
        </div>

        <p className="text-xs text-center text-slate-400 px-4">
          ⚠️ Fine amounts are for general guidance only. Verify with official sources.
        </p>
      </div>
    </main>
  );
}
