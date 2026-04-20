"use client";

import { useState, useRef } from "react";
import { ScanLine, Upload, Camera, AlertTriangle, CheckCircle } from "lucide-react";

export default function ScanPage() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPEG, PNG, WebP)");
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function handleScan() {
    if (!image) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", image);

      const res = await fetch("/api/scan", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Scan failed");
      setResult(data.extracted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scan challan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 py-4">
          <ScanLine className="h-7 w-7 text-amber-500" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Scan & Verify Challan
          </h1>
        </div>

        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 text-center cursor-pointer hover:border-amber-400 transition-colors"
        >
          {preview ? (
            <img
              src={preview}
              alt="Challan preview"
              className="max-h-64 mx-auto rounded-xl object-contain"
            />
          ) : (
            <div className="space-y-3">
              <Upload className="h-12 w-12 text-slate-400 mx-auto" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                Drop challan photo here or click to upload
              </p>
              <p className="text-xs text-slate-400">JPEG, PNG, WebP — max 5MB</p>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        {image && !loading && (
          <button
            onClick={handleScan}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <ScanLine className="h-5 w-5" />
            Scan & Verify
          </button>
        )}

        {loading && (
          <div className="text-center py-8 space-y-3">
            <div className="h-10 w-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Reading challan with AI...
            </p>
          </div>
        )}

        {result && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <h2 className="font-bold text-slate-900 dark:text-white">Extracted Data</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full ml-auto ${
                result.extraction_confidence === "high"
                  ? "bg-green-100 text-green-800"
                  : result.extraction_confidence === "medium"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-red-100 text-red-800"
              }`}>
                {result.extraction_confidence} confidence
              </span>
            </div>

            {[
              ["Challan Number", result.challan_number],
              ["Vehicle Number", result.vehicle_number],
              ["Date of Offence", result.date_of_offence],
              ["Total Amount", result.total_amount_inr ? `₹${result.total_amount_inr}` : null],
            ].map(([label, value]) => (
              value && (
                <div key={label as string} className="flex justify-between text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-medium text-slate-900 dark:text-white">{value}</span>
                </div>
              )
            ))}

            {result.violations?.length > 0 && (
              <div>
                <p className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-2">
                  Violations
                </p>
                {result.violations.map((v: any, i: number) => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 mb-2">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{v.description}</p>
                    {v.section && <p className="text-xs text-slate-500 font-mono mt-1">{v.section}</p>}
                    {v.amount_charged_inr && (
                      <p className="text-sm font-bold text-amber-600 mt-1">₹{v.amount_charged_inr}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-slate-400 text-center pt-2">
              ⚠️ Verify all amounts against official MVA 2019. AI may make errors.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
