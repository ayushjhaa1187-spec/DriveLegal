"use client";

import { useState, useEffect } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { detectState } from "@/lib/geo/detector";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog";
import { INDIAN_STATES } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";

export function StateBadge() {
  const [stateCode, setStateCode] = useState<string | null>(null);
  const [stateName, setStateName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    // Try cached preference first
    const cached = localStorage.getItem("user-state");
    if (cached) {
      try {
        const { code, name } = JSON.parse(cached);
        setStateCode(code);
        setStateName(name);
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem("user-state");
      }
    }
    
    // Auto-detect
    detectState()
      .then((result) => {
        if (result.stateCode) {
          setStateCode(result.stateCode);
          setStateName(result.stateName);
          localStorage.setItem(
            "user-state",
            JSON.stringify({ code: result.stateCode, name: result.stateName })
          );
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function handleStateChange(code: string, name: string) {
    setStateCode(code);
    setStateName(name);
    localStorage.setItem("user-state", JSON.stringify({ code, name }));
    setPickerOpen(false);
    // Trigger global update event
    window.dispatchEvent(new CustomEvent("state-changed", { detail: { code, name } }));
  }

  return (
    <>
      <button
        onClick={() => setPickerOpen(true)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
          "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700",
          "text-xs font-medium transition-colors",
          "text-slate-700 dark:text-slate-300"
        )}
        aria-label={`Current state: ${stateName ?? "Not set"}. Click to change.`}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <MapPin className="h-3.5 w-3.5 text-amber-500" />
        )}
        <span>{stateCode ?? "Set State"}</span>
      </button>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent>
          <DialogTitle>Select Your State</DialogTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            We'll show fines specific to your state.
          </p>
          <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {INDIAN_STATES.map((state) => (
              <button
                key={state.code}
                onClick={() => handleStateChange(state.code, state.name)}
                className={cn(
                  "px-3 py-2.5 text-left rounded-lg text-sm transition-colors",
                  stateCode === state.code
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 font-semibold"
                    : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium"
                )}
              >
                <span className="text-xs font-mono text-slate-500 mr-2">{state.code}</span>
                {state.name}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
