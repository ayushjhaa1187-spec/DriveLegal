/**
 * Gemini Intent Parser
 *
 * ONLY returns { category, stateCode, vehicleType } — never fine amounts.
 * Client then calls queryViolations() locally with these params.
 */

import type { Violation } from "@/lib/law-engine/schema";
import type { VehicleTypeInput } from "@/lib/law-engine/types";

export interface StructuredIntent {
  category: Violation["category"] | null;
  stateCode: string | null;
  vehicleType: VehicleTypeInput | null;
}

// Whitelists for server-side validation (guardrail per user review)
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

const SYSTEM_PROMPT = `You are a traffic violation intent parser for Indian roads.
From the user's query, extract ONLY:
- category: one of [speed, safety, documentation, dangerous_driving, intoxication, helmet, seatbelt, insurance, licence, registration, overloading, juvenile, pollution, parking, signal_violation, mobile_use, vehicle_condition, permit, other]
- stateCode: 2-letter Indian state code (e.g. MH, DL, KA) or null if not mentioned
- vehicleType: one of [2W, 3W, 4W, LMV, HMV, transport, all] or null if not mentioned

Return ONLY valid JSON with these 3 keys. Do NOT include fine amounts, legal advice, or any other text.
Example: {"category":"helmet","stateCode":"MH","vehicleType":"2W"}`;

export async function parseUserIntent(
  query: string,
  lang: string = "en",
  apiKey: string
): Promise<StructuredIntent | null> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: "user", parts: [{ text: `Query (language: ${lang}): ${query}` }] }],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0,
      maxOutputTokens: 128,
    },
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini ${res.status}: ${err}`);
  }

  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  try {
    const parsed = JSON.parse(raw);
    return validateAndNormalize(parsed);
  } catch {
    return null;
  }
}

/** Strict server-side whitelist validation — never trust raw model output */
function validateAndNormalize(raw: Record<string, unknown>): StructuredIntent {
  const category = typeof raw.category === "string" && VALID_CATEGORIES.has(raw.category)
    ? (raw.category as Violation["category"])
    : null;

  const stateCode = typeof raw.stateCode === "string" && VALID_STATES.has(raw.stateCode.toUpperCase())
    ? raw.stateCode.toUpperCase()
    : null;

  const vehicleType = typeof raw.vehicleType === "string" && VALID_VEHICLES.has(raw.vehicleType as VehicleTypeInput)
    ? (raw.vehicleType as VehicleTypeInput)
    : null;

  return { category, stateCode, vehicleType };
}
