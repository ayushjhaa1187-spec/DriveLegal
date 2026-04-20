'use client';

import { useState } from "react";
import { ExternalLink, RefreshCw, Share2, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import type { QueryResult } from "@/lib/law-engine/types";
import { WhyThisAmount } from "./WhyThisAmount";

interface ResultCardProps {
  result: QueryResult;
  isRepeatOffender: boolean;
  onToggleRepeat: (v: boolean) => void;
  onReset: () => void;
}

export function ResultCard({ result, isRepeatOffender, onToggleRepeat, onReset }: ResultCardProps) {
  const [copied, setCopied] = useState(false);

  if (result.results.length === 0) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 text-center py-16 space-y-4">
        <div className="text-6xl">🔍</div>
        <h3 className="text-xl font-bold text-zinc-800">No violations found</h3>
        <p className="text-zinc-500 max-w-sm mx-auto">
          No matching rule found for this combination. The violation may not apply to your vehicle type, or we may not have data for this state yet.
        </p>
        <button onClick={onReset} className="mt-4 px-6 py-3 bg-brand-navy text-white rounded-xl font-semibold hover:bg-blue-900 transition-all">
          Try Again
        </button>
      </div>
    );
  }

  // Show the first (primary) result — state override prioritised by loader
  const primary = result.results[0];
  const { resolvedFine, resolvedImprisonment, licenceConsequence, citation, ruleSource } = primary;
  const v = primary.violation;

  const shareUrl = () => {
    const p = result.params;
    const url = new URL(window.location.href);
    url.pathname = "/calculator";
    url.search = "";
    if (p.stateCode) url.searchParams.set("state", p.stateCode);
    url.searchParams.set("vehicle", p.vehicleType);
    if (p.category) url.searchParams.set("category", p.category);
    if (p.isRepeatOffender) url.searchParams.set("repeat", "1");
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const severityColor = v.severity >= 4
    ? "text-red-600 bg-red-50 border-red-200"
    : v.severity >= 3
    ? "text-amber-600 bg-amber-50 border-amber-200"
    : "text-emerald-600 bg-emerald-50 border-emerald-200";

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-5">
      {result.usedKeywordFallback && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          Keyword fallback used — no exact category match found.
        </div>
      )}

      {/* Rule source badge */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${ruleSource === "state_override" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
          {ruleSource === "state_override" ? `⚡ ${primary.appliedStateCode} State Rules` : "🇮🇳 Central MVA 2019"}
        </span>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${severityColor}`}>
          Severity {v.severity}/5
        </span>
      </div>

      {/* Main fine card */}
      <div className="bg-white rounded-3xl border-2 border-zinc-100 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-br from-brand-navy to-blue-800 p-6 text-white">
          <p className="text-blue-200 text-sm font-medium mb-1">{v.title.en}</p>
          <div className="text-5xl font-black tracking-tight mb-1">
            {resolvedFine.displayText}
          </div>
          <p className="text-blue-200 text-sm">
            {resolvedFine.type === "range" ? "Fine range (court decides actual amount)" : "Payable fine"}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Repeat offender toggle */}
          <div className="flex items-center justify-between bg-zinc-50 rounded-2xl px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-zinc-800">Repeat Offender?</p>
              <p className="text-xs text-zinc-500">Penalties are higher for repeat violations</p>
            </div>
            <button
              id="repeat-toggle"
              onClick={() => onToggleRepeat(!isRepeatOffender)}
              className={`relative w-12 h-6 rounded-full transition-colors ${isRepeatOffender ? "bg-red-500" : "bg-zinc-300"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isRepeatOffender ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>

          {/* Consequences */}
          <div className="space-y-3">
            {resolvedImprisonment && (
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700">Imprisonment Risk</p>
                  <p className="text-sm text-red-600">{resolvedImprisonment.text}</p>
                </div>
              </div>
            )}

            {licenceConsequence && (
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-700">Licence Impact</p>
                  <p className="text-sm text-amber-600">{licenceConsequence}</p>
                </div>
              </div>
            )}

            {!resolvedImprisonment && !licenceConsequence && (
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <p className="text-sm text-emerald-700">No imprisonment or licence suspension for this offence</p>
              </div>
            )}
          </div>

          {/* Legal citation */}
          <div className="border-t border-zinc-100 pt-4">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Legal Source</p>
            <div className="bg-zinc-50 rounded-xl p-3 space-y-2">
              {citation.section && (
                <p className="text-sm font-bold text-zinc-800">{citation.section}</p>
              )}
              <p className="text-xs text-zinc-500 italic leading-relaxed">
                &ldquo;{citation.excerpt}&rdquo;
              </p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-400">
                  {citation.sourceDocument} · Verified {citation.lastVerified}
                </p>
                {citation.sourceUrl && (
                  <a
                    href={citation.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand-navy flex items-center gap-1 hover:underline"
                  >
                    Source <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Decision Trace */}
        {primary.fineDecision && (
          <WhyThisAmount 
            decision={primary.fineDecision} 
            packId={primary.ruleSource === "state_override" ? (primary.appliedStateCode || "central") : "central"} 
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="flex items-center gap-2 flex-1 justify-center py-3.5 bg-zinc-100 text-zinc-700 font-semibold rounded-2xl hover:bg-zinc-200 transition-all"
        >
          <RefreshCw className="w-4 h-4" /> New Lookup
        </button>
        <button
          id="share-result"
          onClick={shareUrl}
          className="flex items-center gap-2 flex-1 justify-center py-3.5 bg-brand-navy text-white font-semibold rounded-2xl hover:bg-blue-900 transition-all"
        >
          <Share2 className="w-4 h-4" />
          {copied ? "Copied!" : "Share Result"}
        </button>
      </div>

      <p className="text-xs text-zinc-400 text-center leading-relaxed">
        ⚠️ This is for informational purposes only and is not legal advice.
        Always verify with official government sources. Fines verified as of {citation.lastVerified}.
      </p>
    </div>
  );
}
