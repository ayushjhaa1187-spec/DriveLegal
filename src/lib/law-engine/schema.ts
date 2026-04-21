import { z } from "zod";

export const VehicleTypeSchema = z.enum([
  "2W",
  "3W",
  "4W",
  "LMV",
  "HMV",
  "transport",
  "non_transport",
  "pedestrian",
  "all",
]);

export type VehicleType = z.infer<typeof VehicleTypeSchema>;

export const FineSchema = z.object({
  min: z.number().nullable(),
  max: z.number().nullable(),
  fixed: z.number().nullable().optional(),
  currency: z.string().default("INR"),
});

export const ImprisonmentSchema = z.object({
  value: z.number().nullable().optional(),
  unit: z.enum(["days", "months", "years"]).nullable().optional(),
  severity: z.enum(["may", "shall"]).nullable().optional(),
  text: z.string().nullable().optional(),
});

export const ViolationSchema = z.object({
  id: z.string(), // e.g., "IN::Section-184::dangerous-driving"
  section: z.string().nullable(), // e.g., "Section 184"
  rule_reference: z.string().nullable().optional(),
  title: z.object({
    en: z.string(),
    hi: z.string().optional(),
    ta: z.string().optional(),
    // Add other languages as needed
  }),
  plain_english_summary: z.string(),
  category: z.enum([
    "speeding",
    "speed",
    "safety",
    "documentation",
    "dangerous_driving",
    "intoxication",
    "helmet",
    "seatbelt",
    "insurance",
    "licence",
    "registration",
    "overloading",
    "juvenile",
    "pollution",
    "parking",
    "signal_violation",
    "mobile_use",
    "vehicle_condition",
    "permit",
    "other",
  ]),
  severity: z.number().min(1).max(10),
  applies_to: z.array(VehicleTypeSchema),
  jurisdiction: z.object({
    country: z.string().default("IN"),
    state_code: z.string().nullable(), // null for central law
    state_name: z.string().nullable(),
  }),
  penalty: z.object({
    first_offence: z.object({
      fine: FineSchema.nullable(),
      imprisonment: ImprisonmentSchema.nullable().optional(),
    }),
    repeat_offence: z.object({
      fine: FineSchema.nullable(),
      imprisonment: ImprisonmentSchema.nullable().optional(),
    }).nullable().optional(),
    licence_suspension: z.string().nullable().optional(),
    licence_disqualification: z.string().nullable().optional(),
    community_service: z.string().nullable().optional(),
    other_penalty_text: z.string().nullable().optional(),
  }),
  compoundable: z.boolean().nullable().optional(),
  compounding_amount_inr: z.number().nullable().optional(),
  effective_date: z.string().nullable().optional(), // ISO date
  source_url: z.string().nullable().optional(),
  source_document: z.string().optional(),
  source_page: z.number().nullable().optional(),
  source_text_excerpt: z.string().optional(),
  confidence: z.enum(["high", "medium", "low"]).optional(),
  extraction_notes: z.array(z.string()).optional(),
  last_verified: z.string().optional(), // ISO date
});

export type Violation = z.infer<typeof ViolationSchema>;

export const ViolationsDatasetSchema = z.object({
  document_metadata: z.object({
    source_document: z.string(),
    document_type: z.enum([
      "central_act",
      "state_notification",
      "state_compounding_schedule",
      "court_order",
      "other",
    ]),
    jurisdiction: z.string(),
    language: z.string(),
    pages_processed: z.array(z.number()).optional(),
    extraction_timestamp: z.string(),
  }),
  violations: z.array(ViolationSchema),
});

export type ViolationsDataset = z.infer<typeof ViolationsDatasetSchema>;
