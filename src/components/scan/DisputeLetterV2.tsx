'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PenTool, ChevronRight, MessageCircle, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SignaturePad } from '@/components/shared/SignaturePad';
import { WhatsAppShare } from '@/components/shared/WhatsAppShare';
import { cn } from '@/lib/utils/cn';

interface DisputeLetterV2Props {
  onClose: () => void;
  onFinish: (data: any) => void;
  defaultDestination: string;
  scanData: any;
  lawData: any;
}

export function DisputeLetterV2({ onClose, onFinish, defaultDestination, scanData, lawData }: DisputeLetterV2Props) {
  const [step, setStep] = useState(1);
  const [destination, setDestination] = useState(defaultDestination);
  const [signature, setSignature] = useState<string | null>(null);
  const [grounds, setGrounds] = useState<string[]>(['overcharge']);

  const shareText = `*DriveLegal Citizen Representation*
Ref: Challan Dispute for Section ${scanData.section || 'N/A'}
Lawful Fine: ₹${lawData.resolvedFine.amount}
Charged: ₹${scanData.amountCharged}
Difference: ₹${scanData.amountCharged - lawData.resolvedFine.amount}

I am formally disputing this charge based on verifiable legal records.`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/80 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] p-8 lg:p-12 relative z-50 shadow-2xl max-h-[95vh] overflow-y-auto"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <X className="h-6 w-6 text-slate-400" />
        </button>

        <div className="mb-8 text-center text-slate-950">
          <div className="h-14 w-14 bg-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-500/20">
            <PenTool className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-black  dark:text-white leading-tight">
            Draft <span className="text-indigo-500">Legal Representation</span>
          </h2>
          <div className="flex justify-center gap-2 mt-4">
             {[1, 2, 3].map(s => (
               <div key={s} className={cn(
                 "h-1 rounded-full transition-all duration-500",
                 step === s ? "w-8 bg-indigo-500" : "w-4 bg-slate-200 dark:bg-slate-800"
               )} />
             ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recipient Authority</label>
                  <textarea 
                    rows={3}
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-3xl p-6 text-sm font-bold outline-none focus:border-indigo-500 transition-all text-gray-800"
                  />
               </div>
               
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Grounds for Representation</label>
                  <div className="grid grid-cols-1 gap-2">
                     {[
                       { id: 'overcharge', label: 'Fine amount exceeds legal limit' },
                       { id: 'procedural', label: 'Procedural error by officer' },
                       { id: 'evidence', label: 'Lack of visual/photographic evidence' }
                     ].map(g => (
                       <button
                         key={g.id}
                         onClick={() => setGrounds(prev => prev.includes(g.id) ? prev.filter(x => x !== g.id) : [...prev, g.id])}
                         className={cn(
                           "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left",
                           grounds.includes(g.id) 
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" 
                            : "border-slate-100 dark:border-slate-800 bg-transparent"
                         )}
                       >
                         <div className={cn(
                           "h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all",
                           grounds.includes(g.id) ? "bg-indigo-500 border-indigo-500" : "border-slate-300 dark:border-slate-700"
                         )}>
                            {grounds.includes(g.id) && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                         </div>
                         <span className={cn("text-xs font-bold", grounds.includes(g.id) ? "text-indigo-900 dark:text-indigo-300" : "text-slate-500")}>
                           {g.label}
                         </span>
                       </button>
                     ))}
                  </div>
               </div>

               <Button fullWidth size="lg" className="h-16 rounded-[2rem]" rightIcon={<ChevronRight />} onClick={() => setStep(2)}>
                  Next: Signature
               </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Digital Validation (Optional)</label>
                  <SignaturePad 
                    onSave={(url) => setSignature(url)}
                    onClear={() => setSignature(null)}
                  />
               </div>
               <div className="flex gap-3">
                  <Button variant="ghost" className="flex-1 h-14 rounded-2xl" onClick={() => setStep(1)}>Back</Button>
                  <Button fullWidth size="lg" className="flex-[2] h-14 rounded-2xl" rightIcon={<ChevronRight />} onClick={() => setStep(3)}>
                    Finalize Letter
                  </Button>
               </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
               <div className="p-8 bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-100 dark:border-emerald-900/20 rounded-[2.5rem] flex flex-col items-center text-center">
                  <div className="h-20 w-20 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20">
                     <CheckCircle2 className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-400">Letter Ready</h3>
                  <p className="text-xs text-emerald-700/60 font-bold uppercase tracking-widest mt-2">Legal Artifact #DL-{Math.floor(Math.random()*9000)+1000}</p>
               </div>

               <div className="space-y-4">
                  <WhatsAppShare 
                    fullWidth
                    size="lg"
                    className="h-16 rounded-2xl"
                    title="Traffic Dispute Representations"
                    text={shareText}
                  />
                  <Button 
                    fullWidth 
                    variant="outline" 
                    size="lg" 
                    className="h-16 rounded-2xl text-slate-600 border-slate-200"
                    onClick={() => onFinish({ destination, signature, grounds })}
                    leftIcon={<FileText className="h-5 w-5" />}
                  >
                    Download Official PDF
                  </Button>
               </div>

               <p className="text-[10px] text-center text-slate-400 leading-relaxed max-w-xs mx-auto">
                 DriveLegal citizen representations are drafted as per Section 200 of the Motor Vehicles Act, 1988.
               </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
