/**
 * Shared output validator for both Gemini and Groq outputs.
 * Kept in a separate module so both parsers import it cleanly.
 */

import type { Violation } from "@/lib/law-engine/schema";
import type { VehicleTypeInput } from "@/lib/law-engine/types";
import type { StructuredIntent } from "./gemini";

const VALID_CATEGORIES = new Set([
  "speed", "safety", "documentation", "dangerous_driving", "intoxication",
  "helmet", "seatbelt", "insurance", "licence", "registration", "overloading",
  "juvenile", "pollution", "parking", "signal_violation", "mobile_use",
  "vehicle_condition", "permit", "other",
]);
const VALID_STATES = new Set([
  "AN","AP","AR","AS","BR","CH","CT","DN","DL","GA","GJ","HR","HP",
  "JK","JH","KA","KL","LA","LD","MP","MH","MN","ML","MZ","NL","OR",
  "PY","PB","RJ","SK","TN","TS","TR","UP","UT","WB",
]);
const VALID_VEHICLES = new Set<VehicleTypeInput>([
  "2W","3W","4W","LMV","HMV","transport","non_transport","all",
]);

export function validateGroqOutput(raw: Record<string, unknown>): StructuredIntent {
  const category = typeof raw.category === "string" && VALID_CATEGORIES.has(raw.category)
    ? (raw.category as StructuredIntent["category"])
    : null;
  const stateCode = typeof raw.stateCode === "string" && VALID_STATES.has(raw.stateCode.toUpperCase())
    ? raw.stateCode.toUpperCase()
    : null;
  const vehicleType = typeof raw.vehicleType === "string" && VALID_VEHICLES.has(raw.vehicleType as VehicleTypeInput)
    ? (raw.vehicleType as VehicleTypeInput)
    : null;
  return { category, stateCode, vehicleType };
}
