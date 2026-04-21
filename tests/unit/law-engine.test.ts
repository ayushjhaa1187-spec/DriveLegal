import { describe, it, expect } from "vitest";
import { resolveViolation } from "../../src/lib/law-engine/resolver";
import type { Violation } from "../../src/lib/law-engine/schema";
import type { QueryParams } from "../../src/lib/law-engine/types";

const mockCentralViolation: Violation = {
  id: "IN::S184::dangerous-driving",
  section: "Section 184",
  rule_reference: null,
  title: { en: "Dangerous Driving" },
  plain_english_summary: "Driving dangerously on public roads.",
  category: "dangerous_driving",
  severity: 4,
  applies_to: ["all"],
  jurisdiction: { country: "IN", state_code: null, state_name: "Central" },
  penalty: {
    first_offence: {
      fine: { min: 1000, max: 5000, fixed: null, currency: "INR" },
      imprisonment: { value: 6, unit: "months", severity: "may", text: "Up to 6 months" }
    },
    repeat_offence: {
      fine: { min: 10000, max: 10000, fixed: 10000, currency: "INR" },
      imprisonment: null
    }
  },
  source_document: "Motor Vehicles Act 1988",
  source_text_excerpt: "Section 184 details penalties for dangerous driving.",
  confidence: "high",
  extraction_notes: [],
  last_verified: "2024-01-01"
};

describe("Law Engine Resolver", () => {
  it("should calculate correct fine for standard central violation", () => {
    const params: QueryParams = {
      stateCode: "KA",
      vehicleType: "LMV",
      isRepeatOffender: false
    };
    
    const result = resolveViolation(mockCentralViolation, [], params);
    
    expect(result.resolvedFine.amount).toBe(1000); // Default to min
    expect(result.appliedStateCode).toBe(null);
    expect(result.ruleSource).toBe("central");
  });

  it("should apply state overrides correctly", () => {
    const stateOverride: Violation = {
      ...mockCentralViolation,
      jurisdiction: { country: "IN", state_code: "DL", state_name: "Delhi" },
      penalty: {
        ...mockCentralViolation.penalty,
        first_offence: {
          fine: { min: 2000, max: 2000, fixed: 2000, currency: "INR" },
          imprisonment: null
        }
      }
    };

    const params: QueryParams = {
      stateCode: "DL",
      vehicleType: "LMV",
      isRepeatOffender: false
    };

    const result = resolveViolation(mockCentralViolation, [stateOverride], params);

    expect(result.resolvedFine.amount).toBe(2000);
    expect(result.appliedStateCode).toBe("DL");
    expect(result.ruleSource).toBe("state_override");
  });

  it("should apply repeat offender multiplier if applicable", () => {
    const params: QueryParams = {
      stateCode: "MH",
      vehicleType: "LMV",
      isRepeatOffender: true
    };

    const result = resolveViolation(mockCentralViolation, [], params);

    expect(result.resolvedFine.amount).toBe(10000);
    expect(result.resolvedFine.type).toBe("fixed");
  });
});
