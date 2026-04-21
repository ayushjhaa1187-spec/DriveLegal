// Phase 9.1 — Decision Table Engine with full explanation trace
import type { Violation } from "./schema";
import type { QueryParams } from "./types";

export interface FineTrace {
  step: number;
  rule: string;
  detail: string;
  value: string | number | null;
}

export interface FineDecision {
  finalFine: number | null;
  isFineRange: boolean;
  fineMin: number | null;
  fineMax: number | null;
  imprisonmentRisk: boolean;
  imprisonmentDetail: string | null;
  licenceSuspension: string | null;
  trace: FineTrace[];
  confidence: 'high' | 'medium' | 'low';
}

export function computeFineWithTrace(
  violation: Violation,
  params: QueryParams
): FineDecision {
  const trace: FineTrace[] = [];
  let step = 1;

  // Step 1: Record trace metadata
  trace.push({
    step: step++,
    rule: 'ENGINE_INIT',
    detail: 'Deterministic Rule Engine v2 initialized',
    value: 'IN-central@1.0.0',
  });

  // Step 2: Violation match
  trace.push({
    step: step++,
    rule: 'VIOLATION_MATCHED',
    detail: `Matched violation: ${violation.title.en}`,
    value: violation.section ?? violation.id,
  });

  // Step 3: Check jurisdiction
  const isStateOverride = violation.jurisdiction.state_code !== null;
  trace.push({
    step: step++,
    rule: isStateOverride ? 'STATE_OVERRIDE_APPLIED' : 'CENTRAL_LAW_APPLIED',
    detail: isStateOverride 
      ? `Applied ${violation.jurisdiction.state_code} state schedule` 
      : 'No state override found, using national MVA schedule',
    value: violation.jurisdiction.state_code ?? 'CENTRAL',
  });

  let finalFine: number | null = null;
  let fineMin: number | null = null;
  let fineMax: number | null = null;

  // Step 4: Resolve Fine
  const penaltyScope = params.isRepeatOffender && violation.penalty.repeat_offence
    ? violation.penalty.repeat_offence
    : violation.penalty.first_offence;

  const fineData = penaltyScope.fine;

  if (fineData) {
    if (fineData.fixed !== null && fineData.fixed !== undefined) {
      finalFine = fineData.fixed;
      trace.push({
        step: step++,
        rule: 'FIXED_FINE_RESOLVED',
        detail: `Resolved specific ${params.isRepeatOffender ? 'repeat' : 'first'} offence amount`,
        value: `₹${finalFine.toLocaleString()}`,
      });
    } else if (fineData.min !== null || fineData.max !== null) {
      fineMin = fineData.min;
      fineMax = fineData.max;
      trace.push({
        step: step++,
        rule: 'FINE_RANGE_RESOLVED',
        detail: 'Law specifies a range; magistrate/officer discretion applies',
        value: `₹${fineMin?.toLocaleString()} - ₹${fineMax?.toLocaleString()}`,
      });
    }
  }

  // Step 5: Imprisonment check
  const imprisonment = penaltyScope.imprisonment;
  const imprisonmentRisk = !!(imprisonment && imprisonment.value !== null && imprisonment.value !== undefined);
  
  if (imprisonmentRisk && imprisonment) {
    trace.push({
      step: step++,
      rule: 'IMPRISONMENT_RISK',
      detail: `${imprisonment.severity === 'shall' ? 'Mandatory' : 'Potential'} imprisonment applies`,
      value: imprisonment.text || `${imprisonment.value} ${imprisonment.unit}`,
    });
  }

  // Step 6: Licence impact
  if (violation.penalty.licence_suspension) {
    trace.push({
      step: step++,
      rule: 'LICENCE_IMPACT',
      detail: 'Licence suspension recommended',
      value: violation.penalty.licence_suspension,
    });
  }

  // Step 7: Confidence scoring
  const confidence: 'high' | 'medium' | 'low' = 
    violation.confidence === 'high' ? 'high' : 
    violation.confidence === 'medium' ? 'medium' : 'low';

  trace.push({
    step: step++,
    rule: 'CONFIDENCE_SCORED',
    detail: 'Data accuracy confidence',
    value: confidence.toUpperCase(),
  });

  return {
    finalFine,
    isFineRange: finalFine === null && (fineMin !== null || fineMax !== null),
    fineMin,
    fineMax,
    imprisonmentRisk,
    imprisonmentDetail: imprisonment?.text ?? null,
    licenceSuspension: violation.penalty.licence_suspension ?? null,
    trace,
    confidence,
  };
}
