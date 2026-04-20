export type VehicleType =
  | "2W" | "3W" | "4W" | "LMV" | "HMV"
  | "transport" | "non_transport" | "pedestrian" | "all";

export type ViolationCategory =
  | "speed" | "safety" | "documentation" | "dangerous_driving"
  | "intoxication" | "helmet" | "seatbelt" | "insurance" | "licence"
  | "registration" | "overloading" | "juvenile" | "pollution" | "parking"
  | "signal_violation" | "mobile_use" | "vehicle_condition" | "permit" | "other";

export type Severity = 1 | 2 | 3 | 4 | 5;
export type Confidence = "high" | "medium" | "low";

// NEW: Regulation source types for multi-law display
export type RegulationSource = "MVA" | "CMVR" | "BNS" | "STATE";

export interface Penalty {
  fine_first_offence_inr: number | null;
  fine_repeat_offence_inr: number | null;
  fine_min_inr: number | null;
  fine_max_inr: number | null;
  imprisonment_first_offence: {
    value: number | null;
    unit: "days" | "months" | "years" | null;
    text: string | null;
  };
  imprisonment_repeat_offence: {
    value: number | null;
    unit: "days" | "months" | "years" | null;
    text: string | null;
  };
  community_service: string | null;
  licence_suspension: string | null;
  licence_disqualification: string | null;
  other_penalty_text: string | null;
}

export interface Jurisdiction {
  country: string;
  state_code: string | null;
  state_name: string | null;
}

export interface MultilingualString {
  en: string;
  hi?: string;
  ta?: string;
  te?: string;
  mr?: string;
  bn?: string;
  gu?: string;
  kn?: string;
  ml?: string;
  pa?: string;
}

// NEW: BNS section mapping interface
export interface BNSMapping {
  bnsSection: string;       // e.g. "Section 285"
  mvaSection: string;       // e.g. "Section 185"
  offenceDescription: string;
}

// NEW: CMVR rule reference interface
export interface CMVRRule {
  ruleNumber: string;       // e.g. "Rule 125"
  title: string;
  category: string;
  appliesTo: VehicleType[];
}

export interface Violation {
  id: string;
  section: string | null;
  rule_reference: string | null;
  title: MultilingualString;
  plain_english_summary: string;
  category: ViolationCategory;
  applies_to: VehicleType[];
  jurisdiction: Jurisdiction;
  penalty: Penalty;
  offence_progression: {
    first_offence_text: string | null;
    subsequent_offence_text: string | null;
  };
  compoundable: boolean | null;
  compounding_amount_inr: number | null;
  state_override_of_section: string | null;
  severity: Severity;
  effective_date: string | null;
  source_document: string;
  source_page: number;
  source_url: string;
  source_text_excerpt: string;
  confidence: Confidence;
  last_verified: string;
  extraction_notes: string[];
  // NEW: Multi-regulation support fields
  regulationSources: RegulationSource[];  // e.g. ["MVA", "BNS"]
  bnsSection?: string;                    // e.g. "Section 285" (BNS 2023)
  bnsDescription?: string;               // Short BNS offence description
  cmvrRules?: string[];                  // e.g. ["Rule 125", "Rule 100"]
}

export interface StateOverride {
  state_code: string;
  state_name: string;
  section: string | null;
  rule_reference: string | null;
  title_en: string;
  override_type:
    | "compounding_amount"
    | "payable_fine"
    | "amendment"
    | "administrative_schedule";
  amount_inr: number | null;
  applies_to: VehicleType[];
  effective_date: string | null;
  source_document: string;
  source_page: number;
  source_url: string;
  source_text_excerpt: string;
  confidence: Confidence;
  notes: string[];
}

export interface LawDataFile {
  metadata: {
    jurisdiction: string;
    state_code: string | null;
    state_name: string | null;
    last_updated: string;
    source_documents: string[];
    total_violations: number;
    coverage_notes: string;
  };
  violations: Violation[];
  state_overrides?: StateOverride[];
}
