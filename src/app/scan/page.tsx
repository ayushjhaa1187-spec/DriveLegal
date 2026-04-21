"use client";
import Link from "next/link";


import { useState, useRef, useEffect } from "react";
import { 
  Camera, Upload, AlertCircle, ShieldCheck, 
  ChevronLeft, FileWarning, Search, Download,
  Scale, FileText, CheckCircle2, History,
  Maximize2, ArrowRightLeft, Sparkles, MapPin,
  ChevronRight, PenTool, X, Gavel
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils/cn";
import { animations } from "@/lib/animations";
import { dataLoader } from "@/lib/data/data-loader";
import { resolveViolation } from "@/lib/law-engine/resolver";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { generateDisputePDF } from "@/lib/utils/pdf-gen";
import { checkVIPAlert, type VIPCorridor } from "@/lib/geo/alerts";
import { suggestLegalDestination } from "@/lib/geo/destinations";
import { VIPAlert } from "@/components/shared/VIPAlert";
import { SignaturePad } from "@/components/shared/SignaturePad";
import { preprocessImage } from "@/lib/scan/preprocess";
import { DisputeLetterV2 } from "@/components/scan/DisputeLetterV2";
import type { ScanResult } from "@/app/api/scan/route";
import type { ResolvedViolation } from "@/lib/law-engine/types";

export default function ScanPage() {
  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [resolvedLaw, setResolvedLaw] = useState<ResolvedViolation | null>(null);
  const [activeCorridor, setActiveCorridor] = useState<VIPCorridor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isOnline = useOfflineStatus();
  
  // Dispute Flow States
  const [showDisputeFlow, setShowDisputeFlow] = useState(false);
  const [destination, setDestination] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status computation
  const isOvercharged = scanResult?.total_amount_inr != null && resolvedLaw?.resolvedFine.amount != null && 
    scanResult.total_amount_inr > resolvedLaw.resolvedFine.amount;

  // VIP Detection simulation
  useEffect(() => {
    if (scanResult && resolvedLaw) {
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const corridor = checkVIPAlert(pos.coords.latitude, pos.coords.longitude);
          setActiveCorridor(corridor);
          
          // Pre-fill destination
          const suggested = suggestLegalDestination(resolvedLaw.appliedStateCode === "DL" ? "Delhi" : "Bengaluru", corridor?.name);
          if (suggested) setDestination(suggested.name + "\n" + suggested.address);
        }, () => {});
      }
    }
  }, [scanResult, resolvedLaw]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setScanResult(null);
    setResolvedLaw(null);
    setActiveCorridor(null);
    setIsScanning(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setImage(dataUrl);

      try {
        if (!isOnline) throw new Error("OCR requires an internet connection.");

        // 1. Preprocess then OCR via API
        const enhancedDataUrl = await preprocessImage(dataUrl);
        const base64Data = enhancedDataUrl.split(",")[1];
        
        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64Data, mimeType: "image/jpeg" })
        });
        
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || "Failed to analyze image");
        
        const extracted = data.data as ScanResult;
        setScanResult(extracted);

        // 2. Resolve Law locally
        const centralLaws = await dataLoader.loadViolations("central");
        const stateCode = localStorage.getItem("user-state-code") || "central";
        const stateLaws = await dataLoader.loadViolations(stateCode.toLowerCase());

        // Use the first violation for main summary (most common case is 1 violation per challan)
        const primaryExtracted = extracted.violations?.[0];

        if (primaryExtracted) {
          // MATCHING ALGORITHM V3 (Hardened)
          // Priority 1: Exact Section match
          let matched = centralLaws.find(v => 
            v.section?.toLowerCase().replace(/\s/g, '') === primaryExtracted?.section?.toLowerCase().replace(/\s/g, '')
          );

          // Priority 2: AI Category match (Trusting the hardened extraction)
          if (!matched && primaryExtracted?.category_id) {
            matched = centralLaws.find(v => v.category === primaryExtracted.category_id);
          }

          // Priority 3: Fuzzy title match
          if (!matched) {
            const searchText = (primaryExtracted?.description || "").toLowerCase();
            matched = centralLaws.find(v => 
              v.title.en.toLowerCase().includes(searchText) ||
              searchText.includes(v.title.en.toLowerCase())
            );
          }

          if (matched) {
            const resolved = resolveViolation(matched, stateLaws, {
              stateCode: stateCode.toLowerCase(),
              vehicleType: (extracted.vehicleType as any) || "all",
              isRepeatOffender: false
            });
            setResolvedLaw(resolved);
          }
        }
      } catch (err: any) {
        setError(err.message || "An unknown error occurred");
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFinishDispute = () => {
    setShowDisputeFlow(false);
    console.log("Representation Generated");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Camera className="h-6 w-6 text-white" />
          </div>
          Challan Scanner
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          AI-powered verification for overcharged traffic fines.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* Upload State */}
        {!image && !isScanning && (
          <motion.div {...animations.pageEnter} key="upload">
            <Card 
              variant="interactive"
              className="p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center text-center group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                <Upload className="h-10 w-10 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-2">Upload Challan Receipt</h3>
              <p className="text-sm text-slate-500 max-w-xs mb-8">
                Take a clear photo of your paper receipt or upload a digital snapshot.
              </p>
              <Button leftIcon={<Camera className="h-4 w-4" />}>
                Capture or Select File
              </Button>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*" 
                capture="environment"
                onChange={handleFileUpload}
              />
            </Card>
          </motion.div>
        )}

        {/* Scanning State */}
        {isScanning && (
          <motion.div {...animations.pageEnter} key="scanning" className="space-y-6">
            <div className="aspect-[3/4] max-w-sm mx-auto bg-slate-200 dark:bg-slate-800 rounded-3xl overflow-hidden relative shadow-2xl">
              {image && <img src={image} className="w-full h-full object-cover opacity-50 grayscale" alt="Scanning" />}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="h-24 w-24 relative mb-6">
                   <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                   <div className="absolute inset-4 bg-indigo-500 rounded-2xl flex items-center justify-center animate-pulse">
                      <Search className="h-8 w-8 text-white" />
                   </div>
                </div>
                <h3 className="font-bold text-lg animate-pulse">AI Truth Extraction...</h3>
                <p className="text-xs text-slate-500 mt-2 uppercase tracking-widest font-black">Scanning Section 184 & 194D</p>
              </div>
            </div>
            <div className="max-w-sm mx-auto space-y-3">
               <Skeleton className="h-12 w-full rounded-2xl" />
               <Skeleton className="h-12 w-3/4 rounded-2xl mx-auto" />
            </div>
          </motion.div>
        )}

        {/* Results State */}
        {scanResult && !isScanning && (
          <motion.div {...animations.pageEnter} key="results" className="space-y-8">
            {activeCorridor && <VIPAlert corridor={activeCorridor} />}

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Fact Card */}
              <div className="flex-1 space-y-6">
                <Card className={cn(
                  "p-1 rounded-[2.5rem] border-2 overflow-hidden",
                  isOvercharged ? "border-red-500/20 bg-red-500/5" : "border-emerald-500/20 bg-emerald-500/5"
                )}>
                  <div className={cn(
                    "p-8 rounded-[2.3rem] flex items-center gap-6",
                    isOvercharged ? "bg-white dark:bg-slate-900" : "bg-white dark:bg-slate-900"
                  )}>
                    <div className={cn(
                      "h-16 w-16 rounded-2xl flex items-center justify-center shadow-2xl",
                      isOvercharged ? "bg-red-500" : "bg-emerald-500"
                    )}>
                      {isOvercharged ? <FileWarning className="h-8 w-8 text-white" /> : <CheckCircle2 className="h-8 w-8 text-white" />}
                    </div>
                    <div>
                      <h2 className={cn("text-2xl font-black uppercase tracking-tight", isOvercharged ? "text-red-600" : "text-emerald-600")}>
                        {isOvercharged ? "Evidence of Overcharge" : "Lawful Fine Detected"}
                      </h2>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Status: Final Verification Pass</p>
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-6 bg-slate-50 dark:bg-slate-900 border-none shadow-inner">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">On Your Receipt</p>
                    <p className={cn("text-3xl font-black", isOvercharged ? "text-red-500" : "text-slate-900 dark:text-white")}>
                      ₹{scanResult.total_amount_inr?.toLocaleString() || "0"}
                    </p>
                  </Card>
                  <Card className="p-6 bg-indigo-500/5 dark:bg-indigo-500/10 border-2 border-indigo-500/20">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Statutory Maximum</p>
                    <p className="text-3xl font-black text-indigo-500">
                      {resolvedLaw?.resolvedFine.displayText || "₹0"}
                    </p>
                  </Card>
                </div>

                <Card className="p-8 space-y-6 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-6 opacity-5">
                      <Scale className="h-24 w-24" />
                   </div>
                   <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                     <ArrowRightLeft className="h-4 w-4" /> Truth Comparison Scale
                   </h3>
                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase">
                         <span>Lawful</span>
                         <span>Dispute Baseline (100%)</span>
                         <span>Overcharge</span>
                      </div>
                      <div className="h-6 w-full bg-slate-100 dark:bg-slate-800 rounded-full p-1 shadow-inner relative">
                         <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 opacity-20 rounded-full" />
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: isOvercharged ? "100%" : "30%" }}
                           className={cn(
                             "h-full rounded-full shadow-lg relative z-10",
                             isOvercharged ? "bg-red-500" : "bg-emerald-500"
                           )}
                         />
                      </div>
                   </div>
                </Card>
              </div>

              {/* Action Column */}
              <div className="w-full lg:w-80 space-y-6">
                <Card className="p-0 overflow-hidden bg-slate-900 shadow-2xl">
                   <img src={image!} className="w-full aspect-square object-cover opacity-60" alt="Scanned" />
                   <div className="p-5 border-t border-white/5">
                      <div className="flex items-center gap-2 text-white/50 text-[10px] font-bold uppercase mb-2">
                         <MapPin className="h-3 w-3" /> Extracted Locality
                      </div>
                      <p className="text-white font-bold text-sm truncate">{activeCorridor?.name || "Detected Area"}</p>
                   </div>
                </Card>

                {isOvercharged && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 animate-pulse">
                      <div className="p-2 bg-amber-500 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-slate-900" />
                      </div>
                      <div>
                        <p className="text-amber-500 font-bold text-sm">Evidence of Overcharge</p>
                        <p className="text-[10px] text-slate-500 font-medium">Fine amount exceeds regional legal limits.</p>
                      </div>
                    </div>

                    <Button fullWidth size="lg" className="h-16 rounded-2xl shadow-2xl shadow-indigo-500/30" onClick={() => setShowDisputeFlow(true)}>
                      Generate Dispute File
                    </Button>

                    <Link href="/legal-experts" className="block">
                      <Button fullWidth variant="outline" size="lg" className="h-16 rounded-2xl border-slate-700 hover:bg-slate-800" leftIcon={<Gavel className="h-5 w-5" />}>
                        Consult Legal Expert
                      </Button>
                    </Link>
                  </div>
                )}
                
                <Button fullWidth variant="ghost" size="lg" onClick={() => { setImage(null); setScanResult(null); }}>
                   Retake Photo
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div {...animations.pageEnter} key="error">
             <Card className="p-8 border-2 border-red-100 dark:border-red-900 bg-red-50/50 dark:bg-red-900/10 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg text-red-900 dark:text-red-400 mb-2">Scan Failed</h3>
                <p className="text-sm text-red-700 dark:text-red-500 mb-8 max-w-sm mx-auto">{error}</p>
                <Button variant="outline" onClick={() => { setImage(null); setError(null); setIsScanning(false); }}>
                  Try Again
                </Button>
             </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDisputeFlow && scanResult && resolvedLaw && (
          <DisputeLetterV2 
            onClose={() => setShowDisputeFlow(false)}
            onFinish={handleFinishDispute}
            defaultDestination={destination}
            scanData={scanResult}
            lawData={resolvedLaw}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
