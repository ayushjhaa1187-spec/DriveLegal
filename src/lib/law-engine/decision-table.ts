// Phase 9.1 — decision-table engine with explanation trace.
// TODO(phase-9): implement.

export type DecisionInput = {
  state: string;
  vehicleType: string;
  offenceCount: number;
  specialConditions?: string[];
};

export type TraceStep = {
  rule: string;
  source?: { packId: string; section: string; url?: string };
  detail?: string;
};

export type DecisionResult = {
  amount: { min: number; max: number; currency: 'INR' };
  trace: TraceStep[];
};

export function evaluate(_input: DecisionInput): DecisionResult {
  // TODO(phase-9): implement.
  return { amount: { min: 0, max: 0, currency: 'INR' }, trace: [] };
}
