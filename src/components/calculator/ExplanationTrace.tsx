'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import type { FineTrace } from '@/lib/law-engine/decision-table';

interface ExplanationTraceProps {
  trace: FineTrace[];
  confidence: 'high' | 'medium' | 'low';
}

export function ExplanationTrace({ trace, confidence }: ExplanationTraceProps) {
  const [open, setOpen] = useState(false);

  const confidenceConfig = {
    high: {
      label: 'High confidence',
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-950',
    },
    medium: {
      label: 'Medium confidence',
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950',
    },
    low: {
      label: 'Low confidence',
      color: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-950',
    },
  };

  const config = confidenceConfig[confidence];

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Why this amount?
          </span>
          <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {open && (
        <div className="border-t border-slate-200 dark:border-slate-800 p-4">
          <div className="space-y-3">
            {trace.map((t) => (
              <div key={t.step} className="flex gap-3">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xs font-bold text-amber-700 dark:text-amber-300">
                  {t.step}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                    {t.rule}
                  </div>
                  <div className="text-sm text-slate-700 dark:text-slate-300">{t.detail}</div>
                  {t.value != null && (
                    <div className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                      {t.value}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
