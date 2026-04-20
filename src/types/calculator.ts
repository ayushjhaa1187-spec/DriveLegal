import type { VehicleType, Violation } from "./violation";

export interface CalculatorInput {
  violationId: string | null;
  violationQuery: string;
  vehicleType: VehicleType | null;
  stateCode: string | null;
  isRepeatOffender: boolean;
  hasPassenger: boolean;
}

export interface CalculatorResult {
  violation: Violation | null;
  appliedFine: number | null;
  fineBreakdown: {
    baseFine: number;
    stateOverrideApplied: boolean;
    stateOverrideAmount: number | null;
    repeatOffenderPremium: number;
    total: number;
  };
  imprisonmentRisk: {
    applicable: boolean;
    details: string | null;
  };
  licenceImpact: {
    suspension: string | null;
    disqualification: string | null;
  };
  additionalConsequences: string[];
  stateSpecificNotes: string | null;
  shareableUrl: string;
  legalSections: string[];
  sourceUrl: string;
  disclaimer: string;
}
