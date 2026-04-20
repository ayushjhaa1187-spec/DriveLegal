'use client';

import { ExplanationTrace } from './ExplanationTrace';
import { LawPackBadge } from '../LawPackBadge';
import type { FineDecision } from '@/lib/law-engine/decision-table';

interface WhyThisAmountProps {
  decision: FineDecision;
  packId: string;
}

export function WhyThisAmount({ decision, packId }: WhyThisAmountProps) {
  if (!decision || !decision.trace) return null;

  return (
    <div className="space-y-4 py-4 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
          Decision Trace
        </h4>
        <LawPackBadge packId={packId} />
      </div>

      <ExplanationTrace 
        trace={decision.trace} 
        confidence={decision.confidence} 
      />
      
      <p className="text-[10px] text-slate-400 leading-relaxed px-1">
        This trace shows the deterministic logic steps taken by the DriveLegal engine to resolve your fine. 
        It prioritizes state compounding schedules over central defaults.
      </p>
    </div>
  );
}
