'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Camera, Upload, AlertCircle, CheckCircle, FileWarning } from "lucide-react";
import { queryViolations } from "@/lib/law-engine/engine";
import { INDIA_STATES } from "@/lib/law-engine/states";
import type { ScanResult } from "@/app/api/scan/route";
import type { QueryResult } from "@/lib/law-engine/types";
import { detectState } from "@/lib/geo/detector";

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
  const match = engineResult?.results[0];

  if (scanResult?.amountCharged != null && match) {
    const fineDef = match.violation.penalty.first_offence?.fine;
    if (fineDef) {
      if (fineDef.fixed != null) {
        if (scanResult.amountCharged > fineDef.fixed) isOvercharged = true;
      } else if (fineDef.max != null) {
        if (scanResult.amountCharged > fineDef.max) isOvercharged = true;
      }
    }
  }

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
            
            {/* Captured Image thumb */}
            <div className="flex justify-between items-center bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <img src={image!} alt="Challan" className="w-16 h-16 object-cover rounded-lg border border-zinc-200" />
                <div>
                   <p className="font-bold text-zinc-800">Challan Extracted</p>
                   <p className="text-xs text-zinc-500">Section {scanResult.section || "Unknown"}</p>
                </div>
              </div>
              <button onClick={() => { setImage(null); setScanResult(null); }} className="text-xs font-medium text-brand-navy border border-brand-navy px-3 py-1.5 rounded-lg">Rescan</button>
            </div>

            {/* Comparison Details */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white border border-zinc-200 rounded-2xl p-5 text-center shadow-sm">
                 <p className="text-xs text-zinc-500 font-medium mb-1 uppercase tracking-wider">Amount Charged</p>
                 <p className="text-3xl font-black text-zinc-800">{scanResult.amountCharged ? `₹${scanResult.amountCharged}` : "Unknown"}</p>
               </div>
               <div className="bg-white border border-zinc-200 rounded-2xl p-5 text-center shadow-sm">
                 <p className="text-xs text-zinc-500 font-medium mb-1 uppercase tracking-wider">Official Fine</p>
                 <p className="text-3xl font-black text-brand-navy">{match.resolvedFine.displayText}</p>
               </div>
            </div>

            {/* Verdict */}
            {isOvercharged ? (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-red-700 mb-2">
                  <FileWarning className="w-5 h-5" />
                  <h3 className="font-bold">You may have been overcharged.</h3>
                </div>
                <p className="text-sm text-red-600">
                  The official fine for <b>{match.violation.title.en}</b> is {match.resolvedFine.displayText}, but your receipt shows ₹{scanResult.amountCharged}.
                </p>
                <div className="mt-4 p-4 bg-white rounded-xl border border-red-100 shadow-sm">
                  <p className="text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wide">Draft Dispute Notice</p>
                  <p className="text-sm text-zinc-800 whitespace-pre-wrap font-serif">
{`To the Traffic Police Department,

I was issued a challan for Rs ${scanResult.amountCharged}/- on ${scanResult.date || "[Date]"}. According to ${match.citation.section} of the Motor Vehicles Act, the official compoundable fine is ${match.resolvedFine.displayText}.

I request rectification of this errant challan amount as per official rules.`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-emerald-700 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <h3 className="font-bold">Challan amount verified.</h3>
                </div>
                <p className="text-sm text-emerald-600">
                  The amount charged matches the official maximum limit for <b>{match.violation.title.en}</b>.
                </p>
              </div>
            )}
            
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
