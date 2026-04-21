"use client";

import { useSearchParams } from "next/navigation";
import { CalculatorManager } from "@/components/calculator/CalculatorManager";
import { Card } from "@/components/ui/Card";
import { Suspense } from "react";

export default function EmbedCalculatorPage() {
  return (
    <Suspense fallback={<div>Loading calculator...</div>}>
      <EmbedContent />
    </Suspense>
  );
}

function EmbedContent() {
  const searchParams = useSearchParams();
  const theme = searchParams.get("theme") || "light";
  const defaultState = searchParams.get("state") || "";

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-slate-950 text-white" : "bg-white text-slate-900"} p-4 overflow-hidden`}>
      <Card className="max-w-md mx-auto border-none shadow-none bg-transparent">
        <div className="mb-4 text-center">
          <h1 className="text-xl font-bold">DriveLegal Widget</h1>
          <p className="text-xs text-slate-400 dark:text-slate-300">Official Multilingual Fine Calculator</p>
        </div>
        
        <CalculatorManager embedded={true} initialState={defaultState} />
        
        <div className="mt-4 text-center">
          <a 
            href="https://drivelegal.app" 
            target="_blank" 
            className="text-[10px] text-amber-600 font-bold uppercase tracking-widest hover:underline"
          >
            Powered by DriveLegal.app
          </a>
        </div>
      </Card>
    </div>
  );
}
