// Phase 9.3 — Property-based tests for law engine decision table
import { describe, it, expect } from 'vitest';
import { computeFineWithTrace } from '@/lib/law-engine/decision-table';
import type { Violation } from '@/types/violation';

const BASE_VIOLATION: Violation = {
  id: 'test-001',
  section: 'Section 194D',
  ruleReference: null,
  title: { en: 'Test Violation' },
  plainEnglishSummary: 'Test',
  category: 'helmet',
  appliesTo: ['2W'],
  jurisdiction: { country: 'IN', stateCode: null, stateName: null },
  penalty: {
    fineFirstOffenceINR: 1000,
    fineRepeatOffenceINR: 2000,
    fineMinINR: null,
    fineMaxINR: null,
    imprisonmentFirstOffence: { value: null, unit: null, text: null },
    imprisonmentRepeatOffence: { value: null, unit: null, text: null },
    communityService: null,
    licenceSuspension: '3 months',
    licenceDisqualification: null,
    otherPenaltyText: null,
  },
  offenceProgression: { firstOffenceText: null, subsequentOffenceText: null },
  compoundable: null,
  compoundingAmountINR: null,
  stateOverrideOfSection: null,
  severity: 2,
  effectiveDate: null,
  sourceDocument: 'MVA 2019',
  sourcePage: 1,
  sourceUrl: 'https://example.com',
  sourceTextExcerpt: '...',
  confidence: 'high',
  lastVerified: '2024-01-01',
  extractionNotes: '',
};

const BASE_INPUT = {
  violationId: 'test',
  violationQuery: '',
  vehicleType: '2W' as const,
  stateCode: 'MH',
  isRepeatOffender: false,
  hasPassenger: false,
};

describe('Law Engine Properties', () => {
  it('fine is never negative', () => {
    const result = computeFineWithTrace(BASE_VIOLATION, BASE_INPUT);
    if (result.finalFine != null) {
      expect(result.finalFine).toBeGreaterThanOrEqual(0);
    }
  });

  it('repeat fine >= first offence fine', () => {
    const first = computeFineWithTrace(BASE_VIOLATION, { ...BASE_INPUT, isRepeatOffender: false });
    const repeat = computeFineWithTrace(BASE_VIOLATION, { ...BASE_INPUT, isRepeatOffender: true });

    if (first.finalFine != null && repeat.finalFine != null) {
      expect(repeat.finalFine).toBeGreaterThanOrEqual(first.finalFine);
    }
  });

  it('state override wins over central law', () => {
    const override = {
      stateCode: 'MH',
      stateName: 'Maharashtra',
      section: 'Section 194D',
      ruleReference: null,
      title: { en: 'Test' },
      overrideType: 'compoundingAmount' as const,
      amountINR: 500,
      appliesTo: ['2W'] as ('2W' | '4W' | 'HV' | 'all')[],
      effectiveDate: null,
      sourceDocument: 'MH Schedule',
      sourcePage: 1,
      sourceUrl: 'https://example.com',
      sourceTextExcerpt: '...',
      confidence: 'high' as const,
      notes: '',
    };

    const result = computeFineWithTrace(BASE_VIOLATION, BASE_INPUT, [override]);
    expect(result.finalFine).toBe(500);
    expect(result.trace.some((t) => t.rule === 'STATE_OVERRIDE_APPLIED')).toBe(true);
  });

  it('trace always has at least 3 steps', () => {
    const result = computeFineWithTrace(BASE_VIOLATION, { ...BASE_INPUT, stateCode: 'DL' });
    expect(result.trace.length).toBeGreaterThanOrEqual(3);
  });

  it('fine range: min <= max', () => {
    const rangeViolation: Violation = {
      ...BASE_VIOLATION,
      penalty: {
        ...BASE_VIOLATION.penalty,
        fineFirstOffenceINR: null,
        fineRepeatOffenceINR: null,
        fineMinINR: 500,
        fineMaxINR: 2000,
      },
    };
    const result = computeFineWithTrace(rangeViolation, { ...BASE_INPUT, stateCode: 'DL' });
    if (result.fineMin != null && result.fineMax != null) {
      expect(result.fineMin).toBeLessThanOrEqual(result.fineMax);
    }
  });
});
