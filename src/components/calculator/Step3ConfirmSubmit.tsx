'use client';

import { Check, Edit2, Shield, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { type QueryParams } from '@/lib/law-engine/types';

interface Step3ConfirmSubmitProps {
  params: QueryParams;
  onEditStep: (step: number) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function Step3ConfirmSubmit({ params, onEditStep, onSubmit, isLoading }: Step3ConfirmSubmitProps) {
  const summary = [
    { label: 'State', value: params.stateCode ?? 'Central Law', step: 1 },
    { label: 'Vehicle', value: params.vehicleType.toUpperCase(), step: 1 },
    { label: 'Offence', value: params.category?.replace('_', ' ').toUpperCase() ?? 'Not Selected', step: 2 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">Review Lookup</h2>
        <p className="text-slate-500 mt-2">Confirm your details before we query the legal engine.</p>
      </div>

      <div className="space-y-3">
        {summary.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">{item.label}</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{item.value}</p>
            </div>
            <button 
              onClick={() => onEditStep(item.step)}
              className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-brand-navy"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-[2rem] border-2 border-amber-100 dark:border-amber-900/20 flex gap-4">
        <div className="h-10 w-10 bg-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0 text-white shadow-lg">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Deterministic Resolution</p>
          <p className="text-[10px] text-amber-600/80 dark:text-amber-500/60 leading-relaxed mt-0.5">
            DriveLegal will scan the verified law packs for {params.stateCode || "national"} regulations. 
            No PI data is shared during this lookup.
          </p>
        </div>
      </div>

      <Button 
        fullWidth 
        size="lg" 
        className="h-16 rounded-[2rem] text-lg font-black bg-brand-navy dark:bg-white text-white dark:text-slate-900 shadow-2xl shadow-brand-navy/20"
        onClick={onSubmit}
        disabled={isLoading}
        leftIcon={isLoading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="h-6 w-6" />}
      >
        {isLoading ? "Querying Engines..." : "Confirm & Calculate"}
      </Button>

      <div className="flex items-center justify-center gap-2 text-slate-400">
         <Info className="h-3.5 w-3.5" />
         <p className="text-[10px] font-bold uppercase tracking-widest">Law Pack: {params.stateCode || "IN-Central"}@1.0.0</p>
      </div>
    </div>
  );
}
