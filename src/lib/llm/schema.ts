import { z } from 'zod';

export const VIOLATION_CATEGORIES = [
  "speed", "safety", "documentation", "dangerous_driving", "intoxication",
  "helmet", "seatbelt", "insurance", "licence", "registration", "overloading",
  "juvenile", "pollution", "parking", "signal_violation", "mobile_use",
  "vehicle_condition", "permit", "other"
] as const;

export const VEHICLE_TYPES = [
  "2W", "3W", "4W", "LMV", "HMV", "transport", "non_transport", "all"
] as const;

export const INDIAN_STATES = [
  "AN","AP","AR","AS","BR","CH","CT","DN","DL","GA","GJ","HR","HP",
  "JK","JH","KA","KL","LA","LD","MP","MH","MN","ML","MZ","NL","OR",
  "PY","PB","RJ","SK","TN","TS","TR","UP","UT","WB"
] as const;

export const IntentSchema = z.object({
  category: z.enum(VIOLATION_CATEGORIES).nullable(),
  stateCode: z.enum(INDIAN_STATES).nullable(),
  vehicleType: z.enum(VEHICLE_TYPES).nullable(),
  isRepeatOffender: z.boolean().default(false),
}).strict(); // Reject extra keys to prevent "fines" in output

export type StructuredIntent = z.infer<typeof IntentSchema>;
