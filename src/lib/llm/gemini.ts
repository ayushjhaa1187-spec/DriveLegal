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

/**
 * Generic LLM call for router - uses Gemini 1.5 Flash
 */
export async function callGemini(
  systemPrompt: string,
  userMessage: string,
  options: { temperature?: number; maxTokens?: number; jsonMode?: boolean } = {}
): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: "user", parts: [{ text: userMessage }] }, { role: "model", parts: [{ text: "" }] }],
    generationConfig: {
      responseMimeType: options.jsonMode ? "application/json" : "text/plain",
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens ?? 2048,
    },
  };

  // Adjust contents to fix gemini API specific message structure if needed
  // Note: Gemini 1.5 Flash supports system_instruction
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
       system_instruction: { parts: [{ text: systemPrompt }] },
       contents: [{ role: "user", parts: [{ text: userMessage }] }],
       generationConfig: body.generationConfig
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini ${res.status}: ${err}`);
  }

  const data = await res.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  return {
    content,
    provider: "gemini",
    tokensUsed: data?.usageMetadata?.totalTokenCount ?? 0,
    cached: false,
  };
}

/**
 * Gemini Vision for document OCR and image analysis.
 * Supports both base64 inlineData and potentially image URLs.
 */
export async function callGeminiVision(
  systemPrompt: string,
  userMessage: string,
  images: any, // Can be { inlineData: { data, mimeType } } or string[]
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  // Prepare parts
  const parts: any[] = [{ text: userMessage }];
  
  if (images && images.inlineData) {
    parts.push(images);
  } else if (Array.isArray(images)) {
    images.forEach(url => {
      // Note: Gemini API standard multimodal expects inlineData for images usually in REST
      // but some versions support fileData. For local base64 we use inlineData.
      // If we only have URLs, we'd need to fetch them first or use fileData if hosted.
      console.warn("URL-based images in Gemini REST require pre-fetching to base64.");
    });
  }

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: "user", parts }],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: options.temperature ?? 0,
      maxOutputTokens: options.maxTokens ?? 2048,
    },
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini Vision ${res.status}: ${err}`);
  }

  const data = await res.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

  return {
    content,
    provider: "gemini",
    tokensUsed: data?.usageMetadata?.totalTokenCount ?? 0,
    cached: false,
  };
}
