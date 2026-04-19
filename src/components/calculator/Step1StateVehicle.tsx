'use client';

import { useState, useMemo } from "react";
import { MapPin, ChevronDown, Search } from "lucide-react";
import { INDIA_STATES } from "@/lib/law-engine/states";
import type { VehicleTypeInput } from "@/lib/law-engine/types";

const VEHICLE_TYPES: { value: VehicleTypeInput; label: string; emoji: string }[] = [
  { value: "2W", label: "Two Wheeler", emoji: "🏍️" },
  { value: "4W", label: "Four Wheeler", emoji: "🚗" },
  { value: "3W", label: "Auto / Three Wheeler", emoji: "🛺" },
  { value: "HMV", label: "Heavy Vehicle", emoji: "🚛" },
  { value: "transport", label: "Transport Vehicle", emoji: "🚌" },
];

interface Step1Props {
  selectedState: string | null;
  selectedVehicle: VehicleTypeInput | null;
  onSelectState: (code: string) => void;
  onSelectVehicle: (v: VehicleTypeInput) => void;
  onNext: () => void;
}

export function Step1StateVehicle({
  selectedState,
  selectedVehicle,
  onSelectState,
  onSelectVehicle,
  onNext,
}: Step1Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredStates = useMemo(
    () =>
      INDIA_STATES.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  );

  const selectedStateName = INDIA_STATES.find((s) => s.code === selectedState)?.name;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* State Selector */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-zinc-700 uppercase tracking-wider">
          📍 Your State / UT
        </label>
        <div className="relative">
          <button
            id="state-selector"
            onClick={() => setIsOpen((v) => !v)}
            className="w-full flex items-center justify-between bg-white border-2 border-zinc-200 hover:border-brand-navy rounded-2xl px-5 py-4 text-left transition-all focus:outline-none focus:border-brand-navy"
          >
            <span className={selectedStateName ? "text-zinc-900 font-medium" : "text-zinc-400"}>
              {selectedStateName ?? "Select your state..."}
            </span>
            <ChevronDown
              className={`w-5 h-5 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isOpen && (
            <div className="absolute z-50 w-full mt-2 bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-3 border-b border-zinc-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search state..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-zinc-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
                  />
                </div>
              </div>
              <ul className="max-h-56 overflow-y-auto divide-y divide-zinc-50">
                {filteredStates.map((state) => (
                  <li key={state.code}>
                    <button
                      onClick={() => {
                        onSelectState(state.code);
                        setIsOpen(false);
                        setSearchQuery("");
                      }}
                      className={`w-full flex items-center justify-between px-5 py-3 text-sm hover:bg-blue-50 transition-colors text-left
                        ${selectedState === state.code ? "bg-blue-50 text-brand-navy font-semibold" : "text-zinc-700"}
                      `}
                    >
                      <span>{state.name}</span>
                      {state.hasOverride && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                          State rules
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {selectedState && (
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <MapPin className="w-3 h-3" />
            {INDIA_STATES.find(s => s.code === selectedState)?.hasOverride
              ? <span className="text-amber-600 font-medium">State-specific fines apply for {selectedStateName}</span>
              : <span>Using Central Motor Vehicles Act 2019 rates</span>
            }
          </div>
        )}
      </div>

      {/* Vehicle Type */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-zinc-700 uppercase tracking-wider">
          🚗 Vehicle Type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {VEHICLE_TYPES.map((v) => (
            <button
              key={v.value}
              id={`vehicle-${v.value}`}
              onClick={() => onSelectVehicle(v.value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 font-medium text-sm transition-all hover:border-brand-navy group
                ${selectedVehicle === v.value
                  ? "border-brand-navy bg-blue-50 text-brand-navy shadow-md"
                  : "border-zinc-200 bg-white text-zinc-600 hover:bg-blue-50/50"
                }
              `}
            >
              <span className="text-3xl">{v.emoji}</span>
              <span>{v.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        id="step1-next"
        disabled={!selectedState || !selectedVehicle}
        onClick={onNext}
        className="w-full py-4 bg-brand-navy text-white font-bold rounded-2xl text-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-900 transition-all active:scale-95"
      >
        Continue →
      </button>
    </div>
  );
}
