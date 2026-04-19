import type { Violation } from "./schema";

// ─── Input ────────────────────────────────────────────────────────────────────

export type VehicleTypeInput =
  | "2W"
  | "3W"
  | "4W"
  | "LMV"
  | "HMV"
  | "transport"
  | "non_transport"
  | "all";

export interface QueryParams {
  /** ISO state code, e.g. "MH". Null = central law only. */
  stateCode: string | null;
  /** Normalized vehicle type */
  vehicleType: VehicleTypeInput;
  /** Exact violation ID, e.g. "IN::Section-194D::helmet-not-worn-by-rider" */
  violationId?: string;
  /** Category slug, e.g. "helmet" */
  category?: Violation["category"];
  /** Whether to prefer repeat-offence penalty */
  isRepeatOffender: boolean;
  /** Free-text fallback search (optional) */
  searchText?: string;
}

// ─── Output ───────────────────────────────────────────────────────────────────

export interface ResolvedFine {
  amount: number | null;
  /** "fixed" | "min" | "max" | "range" */
  type: "fixed" | "range" | "unknown";
  /** e.g. "₹1,000" */
  displayText: string;
  currency: string;
}

export interface ResolvedViolation {
  /** Original violation record (source of truth) */
  violation: Violation;
  /** Which state's rule was applied */
  appliedStateCode: string | null;
  /** "state_override" | "central" */
  ruleSource: "state_override" | "central";
  /** Resolved fine after override + offence type applied */
  resolvedFine: ResolvedFine;
  /** Resolved imprisonment (null if none) */
  resolvedImprisonment: {
    text: string;
    severity: "may" | "shall";
  } | null;
  /** Any licence consequence */
  licenceConsequence: string | null;
  /** Citation object for display */
  citation: {
    section: string | null;
    sourceDocument: string;
    sourceUrl: string | null;
    excerpt: string;
    lastVerified: string;
  };
}

export interface QueryResult {
  params: QueryParams;
  results: ResolvedViolation[];
  /** True if keyword fallback was used (no structured match found) */
  usedKeywordFallback: boolean;
  /** ISO timestamp of lookup */
  resolvedAt: string;
}

// ─── State Map ────────────────────────────────────────────────────────────────

export interface StateInfo {
  code: string;
  name: string;
  hasOverride: boolean;
}
