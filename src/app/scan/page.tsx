'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Camera, Upload, AlertCircle, CheckCircle, FileWarning } from "lucide-react";
import { queryViolations } from "@/lib/law-engine/engine";
import { INDIA_STATES } from "@/lib/law-engine/states";
import type { ScanResult } from "@/app/api/scan/route";
import type { QueryResult } from "@/lib/law-engine/types";
import { detectState } from "@/lib/geo/detector";
import { generateDisputePDF } from "@/lib/utils/pdf-gen";
import { Info, Download, ShieldCheck, Scale, FileText } from "lucide-react";

export default function ScanPage() {
  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [engineResult, setEngineResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const update = () => setIsOffline(!navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    update();
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset state
    setError(null);
    setScanResult(null);
    setEngineResult(null);
    setIsScanning(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setImage(dataUrl);

      // Extract base64 without data type prefix
      const base64Data = dataUrl.split(",")[1];
      const mimeType = file.type || "image/jpeg";

      try {
        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64Data, mimeType })
        });
        
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || "Failed to scan image");
        if (!data.success) throw new Error("Could not extract data");

        const extracted = data.data as ScanResult;
        setScanResult(extracted);
        
        if (extracted.section || extracted.violation) {
          // Detect state to do an accurate lookup
          const geo = await detectState();
          
          const result = await queryViolations({
            stateCode: geo.stateCode,
            vehicleType: "all",
            searchText: extracted.section || extracted.violation || undefined,
            isRepeatOffender: false
          });
          setEngineResult(result);
        }

      } catch (err: any) {
        setError(err.message || "An unknown error occurred");
      } finally {
        setIsScanning(false);
      }
    };
    reader.onerror = () => {
      setError("Failed to read file");
      setIsScanning(false);
    };
    reader.readAsDataURL(file);
  }

  // Calculate if overcharged
  let isOvercharged = false;
  let isSettlementEligible = false;
  const match = engineResult?.results[0];
  const currentState = engineResult?.params.stateCode;

  if (scanResult?.amountCharged != null && match) {
    const fineDef = match.violation.penalty.first_offence?.fine;
    if (fineDef) {
      if (fineDef.fixed != null) {
        if (scanResult.amountCharged > fineDef.fixed) isOvercharged = true;
      } else if (fineDef.max != null) {
        if (scanResult.amountCharged > fineDef.max) isOvercharged = true;
      }
    }
    
    // Delhi Settlement Logic (Sept 2024 Framework)
    // Eligible for major offences like Red Light, Speeding, Seatbelt (if notification active)
    if (currentState === "DL" && ["red_light", "speeding", "seatbelt", "helmet"].some(c => match.violation.category.includes(c as any))) {
      isSettlementEligible = true;
    }
  }

  const handleDownloadPDF = () => {
    if (!scanResult || !match) return;
    generateDisputePDF({
      amountCharged: scanResult.amountCharged || 0,
      date: scanResult.date,
      section: scanResult.section,
      match: match
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
       <div className="border-b border-zinc-100 bg-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="p-1 text-zinc-400 hover:text-brand-navy transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-zinc-900">Scan & Verify</h1>
            <p className="text-xs text-zinc-400">Check if you were overcharged</p>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 space-y-6">
        
        {isOffline && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
             <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
               <AlertCircle className="w-6 h-6" />
             </div>
             <h3 className="font-bold text-amber-900 mb-1">You are offline</h3>
             <p className="text-sm text-amber-700">AI Challan scanning requires an internet connection to process the image. Please reconnect to use this feature.</p>
          </div>
        )}

        {/* Upload Zone */}
        {!image && !isScanning && !isOffline && (
          <div className="bg-white border-2 border-dashed border-zinc-200 rounded-3xl p-8 text-center hover:border-brand-navy hover:bg-slate-50 transition-all">
            <div className="w-16 h-16 bg-blue-50 text-brand-navy rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-zinc-800 mb-2">Upload your Challan</h2>
            <p className="text-sm text-zinc-500 mb-6">Take a photo of your receipt to verify the fine amount against official records.</p>
            
            <label className="inline-flex items-center gap-2 bg-brand-navy text-white px-6 py-3 rounded-xl font-medium cursor-pointer hover:bg-blue-900 transition-colors">
              <Upload className="w-4 h-4" />
              Choose Photo or Take Picture
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        )}

        {isScanning && (
           <div className="bg-white border border-zinc-200 rounded-3xl p-8 text-center">
            <div className="w-16 h-16 rounded-full border-4 border-zinc-100 border-t-brand-navy animate-spin mx-auto mb-4" />
            <p className="font-medium text-zinc-800">Analyzing Challan with AI...</p>
            <p className="text-xs text-zinc-500 mt-2">Extracting section and fine details</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 flex items-start gap-3">
             <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
             <div>
               <p className="font-semibold text-sm">Scan Error</p>
               <p className="text-xs mt-1">{error}</p>
               <button onClick={() => { setImage(null); setError(null); }} className="text-xs font-medium underline mt-2">Try Again</button>
             </div>
          </div>
        )}

        {scanResult && match && !isScanning && (
          <div className="space-y-6">
            
            {/* Truth Comparison Card */}
            <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
              <div className={`px-5 py-3 flex items-center justify-between ${isOvercharged ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                <div className="flex items-center gap-2">
                  {isOvercharged ? <FileWarning className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {isOvercharged ? "Potential Overcharge" : "Amount Verified"}
                  </span>
                </div>
                <div className="text-[10px] opacity-80 font-medium">Source: MVA 2019 + State Schedule</div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-8 relative">
                  {/* Vertical Divider */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-zinc-100 hidden sm:block" />
                  
                  <div className="text-center space-y-1">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">On Challan</p>
                    <p className={`text-4xl font-black ${isOvercharged ? 'text-red-600' : 'text-zinc-800'}`}>
                      ₹{scanResult.amountCharged || "---"}
                    </p>
                    <p className="text-[10px] text-zinc-500 italic">Extracted via AI</p>
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-[10px] text-brand-navy font-bold uppercase tracking-widest">Legal Maximum</p>
                    <p className="text-4xl font-black text-brand-navy">
                      {match.resolvedFine.displayText}
                    </p>
                    <p className="text-[10px] text-zinc-500 italic">{match.citation.section}</p>
                  </div>
                </div>

                {isSettlementEligible && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-blue-900">Delhi 50% Settlement Opportunity</p>
                      <p className="text-xs text-blue-700 leading-relaxed">
                        This offence may be eligible for a 50% compounding reduction under the Sept 2024 Delhi framework. 
                        Verification of settlement window (90 days) is required.
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-zinc-50 flex flex-col gap-3">
                   {isOvercharged && (
                     <button 
                       onClick={handleDownloadPDF}
                       className="w-full bg-brand-navy text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-blue-900/10"
                     >
                       <Download className="w-5 h-5" />
                       Download Dispute Notice (PDF)
                     </button>
                   )}
                   <button 
                    onClick={() => { setImage(null); setScanResult(null); }}
                    className="w-full text-zinc-400 text-sm font-medium py-2 hover:text-zinc-600"
                   >
                     Rescan Different Receipt
                   </button>
                </div>
              </div>
            </div>

            {/* Legal Text Snippet */}
            <div className="bg-slate-100 rounded-2xl p-5 border border-zinc-200/50">
              <div className="flex items-center gap-2 mb-3 text-zinc-600">
                <Scale className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Applicable Law</h4>
              </div>
              <p className="text-sm text-zinc-700 font-serif leading-relaxed italic">
                "{match.violation.plain_english_summary.slice(0, 200)}..."
              </p>
              <Link href="/rights" className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-navy mt-3 uppercase tracking-tighter hover:underline">
                View Full Rights & Procedure <ChevronLeft className="w-3 h-3 rotate-180" />
              </Link>
            </div>
            
          </div>
        )}

        {/* Not Found case */}
        {scanResult && !match && !error && !isScanning && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800">
            Could not find an official violation matching the exact text scanned. Please try scanning again or use the manual calculator.
            <button onClick={() => { setImage(null); setScanResult(null); }} className="block mt-4 text-xs font-medium underline">Try Again</button>
          </div>
        )}

      </div>
    </div>
  );
}
