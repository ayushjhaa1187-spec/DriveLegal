/**
 * DriveLegal — Law Engine Resolver
 * ═══════════════════════════════════════════════════
 * Merges central law with state overrides to resolve final penalties.
 */

import type { Violation } from "./schema";
import type { QueryParams, ResolvedViolation, ResolvedFine } from "./types";

export function resolveViolation(
  centralViolation: Violation,
  stateViolations: Violation[],
  params: QueryParams
): ResolvedViolation {
  // 1. Check for state override
  const stateOverride = stateViolations.find(
    (v) => v.id === centralViolation.id || v.section === centralViolation.section
  );

  const activeViolation = stateOverride || centralViolation;
  const isRepeat = params.isRepeatOffender;
  
  // 2. Select penalty block
  const penalty = (isRepeat && activeViolation.penalty.repeat_offence)
    ? activeViolation.penalty.repeat_offence
    : activeViolation.penalty.first_offence;

  // 3. Resolve Fine
  const fine: ResolvedFine = {
    amount: null,
    type: "unknown",
    displayText: "Contact Authorities",
    currency: "INR",
  };

  if (penalty.fine) {
    const f = penalty.fine;
    if (f.fixed !== undefined && f.fixed !== null) {
      fine.amount = f.fixed;
      fine.type = "fixed";
      fine.displayText = `₹${f.fixed.toLocaleString("en-IN")}`;
    } else if (f.min !== null && f.max !== null) {
      fine.amount = f.min; // Default to min for display
      fine.type = "range";
      fine.displayText = `₹${f.min.toLocaleString("en-IN")} – ₹${f.max.toLocaleString("en-IN")}`;
    } else if (f.max !== null) {
      fine.amount = f.max;
      fine.type = "fixed"; // effectively fixed max
      fine.displayText = `Up to ₹${f.max.toLocaleString("en-IN")}`;
    }
  }

  // 4. Resolve Imprisonment
  const resolvedImprisonment = penalty.imprisonment
    ? {
        text: penalty.imprisonment.text || "Not Specified",
        severity: penalty.imprisonment.severity || "may",
      }
    : null;

  return {
    violation: activeViolation,
    appliedStateCode: stateOverride ? stateOverride.jurisdiction.state_code : null,
    ruleSource: stateOverride ? "state_override" : "central",
    resolvedFine: fine,
    resolvedImprisonment,
    licenceConsequence: activeViolation.penalty.licence_suspension ?? activeViolation.penalty.licence_disqualification ?? null,
    citation: {
      section: activeViolation.section,
      sourceDocument: activeViolation.source_document ?? "Motor Vehicles Act / State Gazette",
      sourceUrl: activeViolation.source_url ?? null,
      excerpt: activeViolation.source_text_excerpt ?? "Citation text excerpt unavailable.",
      lastVerified: activeViolation.last_verified ?? new Date().toISOString().split("T")[0],
    },
  };
}
