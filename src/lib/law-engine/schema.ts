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
  value: z.number().nullable(),
  unit: z.enum(["days", "months", "years"]).nullable(),
  severity: z.enum(["may", "shall"]).nullable(),
  text: z.string().nullable(),
});

export const ViolationSchema = z.object({
  id: z.string(), // e.g., "IN::Section-184::dangerous-driving"
  section: z.string().nullable(), // e.g., "Section 184"
  rule_reference: z.string().nullable(),
  title: z.object({
    en: z.string(),
    hi: z.string().optional(),
    ta: z.string().optional(),
    // Add other languages as needed
  }),
  plain_english_summary: z.string(),
  category: z.enum([
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
  severity: z.number().min(1).max(5),
  applies_to: z.array(VehicleTypeSchema),
  jurisdiction: z.object({
    country: z.string().default("IN"),
    state_code: z.string().nullable(), // null for central law
    state_name: z.string().nullable(),
  }),
  penalty: z.object({
    first_offence: z.object({
      fine: FineSchema.nullable(),
      imprisonment: ImprisonmentSchema.nullable(),
    }),
    repeat_offence: z.object({
      fine: FineSchema.nullable(),
      imprisonment: ImprisonmentSchema.nullable(),
    }).nullable(),
    licence_suspension: z.string().nullable(),
    licence_disqualification: z.string().nullable(),
    community_service: z.string().nullable(),
    other_penalty_text: z.string().nullable(),
  }),
  compoundable: z.boolean().nullable(),
  compounding_amount_inr: z.number().nullable(),
  effective_date: z.string().nullable(), // ISO date
  source_url: z.string().nullable(),
  source_document: z.string(),
  source_page: z.number().nullable(),
  source_text_excerpt: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
  extraction_notes: z.array(z.string()),
  last_verified: z.string(), // ISO date
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
    pages_processed: z.array(z.number()),
    extraction_timestamp: z.string(),
  }),
  violations: z.array(ViolationSchema),
});

export type ViolationsDataset = z.infer<typeof ViolationsDatasetSchema>;
