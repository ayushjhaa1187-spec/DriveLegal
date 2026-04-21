/**
 * Deterministic Law Engine
 *
 * queryViolations() is a pure-ish function (depends on async loader).
 * It NEVER generates legal advice. It only resolves structured params
 * against authenticated JSON datasets and returns cited results.
 */

import { loadViolations } from "./loader";
import type { Violation } from "./schema";
import type {
  QueryParams,
  QueryResult,
  ResolvedFine,
  ResolvedViolation,
} from "./types";
import { computeFineWithTrace } from "./decision-table";

// ─── Fine Resolution ──────────────────────────────────────────────────────────

function resolveFine(violation: Violation, isRepeat: boolean): ResolvedFine {
  const penalty = violation.penalty;
  const offence =
    isRepeat && penalty.repeat_offence
      ? penalty.repeat_offence
      : penalty.first_offence;

  const fine = offence?.fine;
  const currency = fine?.currency || "INR";
  const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "GBP" ? "£" : currency === "AED" ? "د.إ" : currency + " ";

  if (!fine) {
    return { amount: null, type: "unknown", displayText: "Refer to court", currency };
  }

  const compoundingAmount = violation.compounding_amount_inr;
  if (compoundingAmount !== null && compoundingAmount !== undefined) {
    return {
      amount: compoundingAmount,
      type: "fixed",
      displayText: `${symbol}${compoundingAmount.toLocaleString()}`,
      currency,
    };
  }

  if (fine.fixed !== null && fine.fixed !== undefined) {
    return {
      amount: fine.fixed,
      type: "fixed",
      displayText: `${symbol}${fine.fixed.toLocaleString()}`,
      currency,
    };
  }

  if (fine.min !== null && fine.max !== null && fine.min !== fine.max) {
    return {
      amount: fine.min,
      type: "range",
      displayText: `${symbol}${fine.min!.toLocaleString()} – ${symbol}${fine.max!.toLocaleString()}`,
      currency,
    };
  }

  const amount = fine.min ?? fine.max;
  return {
    amount,
    type: amount !== null ? "fixed" : "unknown",
    displayText: amount !== null ? `${symbol}${amount.toLocaleString()}` : "Refer to court",
    currency,
  };
}

// ─── Imprisonment Resolution ──────────────────────────────────────────────────

function resolveImprisonment(
  violation: Violation,
  isRepeat: boolean
): ResolvedViolation["resolvedImprisonment"] {
  const penalty = violation.penalty;

  const offence =
    isRepeat && penalty.repeat_offence
      ? penalty.repeat_offence
      : penalty.first_offence;

  const imprisonment = offence?.imprisonment;
  if (!imprisonment || !imprisonment.value) return null;

  const severity = imprisonment.severity ?? "may";
  const unitMap = { days: "day(s)", months: "month(s)", years: "year(s)" };
  const unit = imprisonment.unit ? unitMap[imprisonment.unit] : "";

  return {
    text: imprisonment.text ?? `${severity === "shall" ? "Shall" : "May"} be imprisoned for ${imprisonment.value} ${unit}`,
    severity,
  };
}

// ─── Vehicle Type Matching ────────────────────────────────────────────────────

function vehicleMatches(
  violation: Violation,
  vehicleType: QueryParams["vehicleType"]
): boolean {
  const vt = violation.applies_to;
  if (vt.includes("all")) return true;
  if (vehicleType === "all") return true;

  // LMV encompasses 4W for our purposes
  if (vehicleType === "4W" && vt.includes("LMV")) return true;
  if (vehicleType === "LMV" && vt.includes("4W")) return true;

  return vt.includes(vehicleType);
}

// ─── Result Builder ───────────────────────────────────────────────────────────

function buildResult(
  violation: Violation,
  params: QueryParams
): ResolvedViolation {
  return {
    violation,
    appliedStateCode: violation.jurisdiction.state_code,
    ruleSource:
      violation.jurisdiction.state_code !== null ? "state_override" : "central",
    resolvedFine: resolveFine(violation, params.isRepeatOffender),
    resolvedImprisonment: resolveImprisonment(violation, params.isRepeatOffender),
    licenceConsequence:
      violation.penalty.licence_suspension ??
      violation.penalty.licence_disqualification ??
      null,
    citation: {
      section: violation.section,
      sourceDocument: violation.source_document ?? "Motor Vehicles Act / State Gazette",
      sourceUrl: violation.source_url ?? null,
      excerpt: violation.source_text_excerpt ?? "Citation text excerpt unavailable.",
      lastVerified: violation.last_verified ?? new Date().toISOString().split("T")[0],
    },
    fineDecision: computeFineWithTrace(violation, params),
  };
}

// ─── Keyword Search Fallback ──────────────────────────────────────────────────

function keywordMatch(violation: Violation, searchText: string): boolean {
  const needle = searchText.toLowerCase();
  const haystack = [
    violation.title.en,
    violation.plain_english_summary,
    violation.section ?? "",
    violation.category,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

// ─── Main Query Function ──────────────────────────────────────────────────────

export async function queryViolations(params: QueryParams): Promise<QueryResult> {
  const violations = await loadViolations(params.stateCode, params.countryCode || "in");

  let matched: Violation[] = [];
  let usedKeywordFallback = false;

  // 1. Exact match by violationId
  if (params.violationId) {
    const exact = violations.find((v) => v.id === params.violationId);
    if (exact) matched = [exact];
  }

  // 2. Filter by category + vehicle type
  if (matched.length === 0 && params.category) {
    matched = violations.filter(
      (v) =>
        v.category === params.category && vehicleMatches(v, params.vehicleType)
    );
  }

  // 3. Keyword fallback
  if (matched.length === 0 && params.searchText) {
    matched = violations.filter(
      (v) =>
        keywordMatch(v, params.searchText!) && vehicleMatches(v, params.vehicleType)
    );
    usedKeywordFallback = true;
  }

  const results = matched.map((v) => buildResult(v, params));

  return {
    params,
    results,
    usedKeywordFallback,
    resolvedAt: new Date().toISOString(),
  };
}
