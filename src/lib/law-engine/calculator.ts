import type { CalculatorInput, CalculatorResult } from "@/types/calculator";
import type { Violation, StateOverride } from "@/types/violation";
import { getStateOverride } from "./state-overrides";
import { DISCLAIMER_TEXT } from "@/lib/constants";

export function calculateFine(
  violation: Violation,
  input: CalculatorInput,
  stateOverrides: StateOverride[]
): CalculatorResult {
  const stateOverride = getStateOverride(
    stateOverrides,
    violation.section,
    input.stateCode,
    input.vehicleType
  );

  let baseFine = 0;
  let stateOverrideApplied = false;
  let stateOverrideAmount: number | null = null;

  if (
    stateOverride?.amount_inr !== null &&
    stateOverride?.amount_inr !== undefined
  ) {
    baseFine = stateOverride.amount_inr;
    stateOverrideApplied = true;
    stateOverrideAmount = stateOverride.amount_inr;
  } else if (
    input.isRepeatOffender &&
    violation.penalty.fine_repeat_offence_inr !== null
  ) {
    baseFine = violation.penalty.fine_repeat_offence_inr;
  } else if (violation.penalty.fine_first_offence_inr !== null) {
    baseFine = violation.penalty.fine_first_offence_inr;
  } else if (
    violation.penalty.fine_min_inr !== null &&
    violation.penalty.fine_max_inr !== null
  ) {
    baseFine = Math.round(
      (violation.penalty.fine_min_inr + violation.penalty.fine_max_inr) / 2
    );
  }

  const repeatOffenderPremium =
    input.isRepeatOffender &&
    violation.penalty.fine_repeat_offence_inr !== null &&
    !stateOverrideApplied
      ? (violation.penalty.fine_repeat_offence_inr ?? 0) -
        (violation.penalty.fine_first_offence_inr ?? 0)
      : 0;

  const imprisonmentApplicable = input.isRepeatOffender
    ? violation.penalty.imprisonment_repeat_offence.value !== null
    : violation.penalty.imprisonment_first_offence.value !== null;

  const imprisonmentDetails = input.isRepeatOffender
    ? violation.penalty.imprisonment_repeat_offence.text
    : violation.penalty.imprisonment_first_offence.text;

  const legalSections: string[] = [];
  if (violation.section) legalSections.push(violation.section);
  if (violation.rule_reference) legalSections.push(violation.rule_reference);

  const shareableUrl = `${process.env.NEXT_PUBLIC_APP_URL}/calculator/${
    violation.id
  }?state=${input.stateCode ?? "IN"}&vehicle=${
    input.vehicleType ?? "all"
  }&repeat=${input.isRepeatOffender}`;

  return {
    violation,
    appliedFine: baseFine || null,
    fineBreakdown: {
      baseFine,
      stateOverrideApplied,
      stateOverrideAmount,
      repeatOffenderPremium,
      total: baseFine,
    },
    imprisonmentRisk: {
      applicable: imprisonmentApplicable,
      details: imprisonmentDetails,
    },
    licenceImpact: {
      suspension: violation.penalty.licence_suspension,
      disqualification: violation.penalty.licence_disqualification,
    },
    additionalConsequences: violation.penalty.other_penalty_text
      ? [violation.penalty.other_penalty_text]
      : [],
    stateSpecificNotes: stateOverride
      ? `This amount reflects the ${input.stateCode} state schedule (${stateOverride.source_document})`
      : null,
    shareableUrl,
    legalSections,
    sourceUrl: violation.source_url,
    disclaimer: DISCLAIMER_TEXT,
  };
}
