// Phase 9.1 — Decision Table Engine with full explanation trace
import type { Violation, StateOverride, VehicleType } from '@/types/violation';
import type { CalculatorInput } from '@/types/calculator';

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
  input: CalculatorInput,
  stateOverrides: StateOverride[] = [],
): FineDecision {
  const trace: FineTrace[] = [];
  let step = 1;

  // Step 1: Record loaded packs
  trace.push({
    step: step++,
    rule: 'DATA_LOADED',
    detail: 'Loaded central law pack',
    value: 'IN-central@1.0.0',
  });

  // Step 2: Violation match
  trace.push({
    step: step++,
    rule: 'VIOLATION_MATCHED',
    detail: `Matched violation: ${violation.title?.en}`,
    value: violation.section ?? violation.id,
  });

  // Step 3: Check state override
  const override = stateOverrides.find(
    (o) =>
      o.stateCode === input.stateCode &&
      o.section === violation.section &&
      (o.appliesTo.includes('all') || o.appliesTo.includes(input.vehicleType as VehicleType)),
  );

  let finalFine: number | null = null;

  if (override?.amountINR != null) {
    trace.push({
      step: step++,
      rule: 'STATE_OVERRIDE_APPLIED',
      detail: `State ${input.stateCode} override found: ${override.overrideType}`,
      value: override.amountINR,
    });
    finalFine = override.amountINR;
  } else {
    trace.push({
      step: step++,
      rule: 'NO_STATE_OVERRIDE',
      detail: `No override for ${input.stateCode}, using central law`,
      value: null,
    });
  }

  // Step 4: Repeat offender / first offence
  if (finalFine === null) {
    if (input.isRepeatOffender && violation.penalty?.fineRepeatOffenceINR != null) {
      trace.push({
        step: step++,
        rule: 'REPEAT_OFFENDER_APPLIED',
        detail: 'Repeat offender flag is TRUE, using repeat fine',
        value: violation.penalty.fineRepeatOffenceINR,
      });
      finalFine = violation.penalty.fineRepeatOffenceINR;
    } else if (violation.penalty?.fineFirstOffenceINR != null) {
      trace.push({
        step: step++,
        rule: 'FIRST_OFFENCE_APPLIED',
        detail: 'Using first offence fine',
        value: violation.penalty.fineFirstOffenceINR,
      });
      finalFine = violation.penalty.fineFirstOffenceINR;
    } else if (
      violation.penalty?.fineMinINR != null &&
      violation.penalty?.fineMaxINR != null
    ) {
      trace.push({
        step: step++,
        rule: 'FINE_RANGE_APPLIED',
        detail: 'Only a range is defined by law',
        value: `${violation.penalty.fineMinINR}–${violation.penalty.fineMaxINR}`,
      });
    } else {
      trace.push({
        step: step++,
        rule: 'NO_FINE_DATA',
        detail: 'No fine amount in dataset',
        value: null,
      });
    }
  }

  // Step 5: Imprisonment check
  const imprisonmentRisk = input.isRepeatOffender
    ? violation.penalty?.imprisonmentRepeatOffence?.value != null
    : violation.penalty?.imprisonmentFirstOffence?.value != null;

  const imprisonmentDetail = input.isRepeatOffender
    ? violation.penalty?.imprisonmentRepeatOffence?.text ?? null
    : violation.penalty?.imprisonmentFirstOffence?.text ?? null;

  if (imprisonmentRisk) {
    trace.push({
      step: step++,
      rule: 'IMPRISONMENT_RISK',
      detail: 'This violation carries imprisonment risk',
      value: imprisonmentDetail,
    });
  }

  // Step 6: Licence check
  if (violation.penalty?.licenceSuspension) {
    trace.push({
      step: step++,
      rule: 'LICENCE_IMPACT',
      detail: 'Licence suspension applies',
      value: violation.penalty.licenceSuspension,
    });
  }

  // Step 7: Confidence scoring
  const confidence: 'high' | 'medium' | 'low' =
    finalFine != null && override != null
      ? 'high'
      : override != null
      ? 'high'
      : violation.penalty?.fineMinINR != null
      ? 'medium'
      : 'low';

  trace.push({
    step: step++,
    rule: 'CONFIDENCE_SCORED',
    detail: 'Final confidence level',
    value: confidence,
  });

  return {
    finalFine,
    isFineRange: finalFine === null && violation.penalty?.fineMinINR != null,
    fineMin: violation.penalty?.fineMinINR ?? null,
    fineMax: violation.penalty?.fineMaxINR ?? null,
    imprisonmentRisk,
    imprisonmentDetail,
    licenceSuspension: violation.penalty?.licenceSuspension ?? null,
    trace,
    confidence,
  };
}
