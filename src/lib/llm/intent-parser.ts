import { routeLLMRequest } from "./router";
import { INTENT_PARSER_SYSTEM_PROMPT } from "./prompts";
import type { ParsedIntent } from "@/types/llm";

export async function parseUserIntent(query: string): Promise<ParsedIntent> {
  try {
    const response = await routeLLMRequest({
      systemPrompt: INTENT_PARSER_SYSTEM_PROMPT,
      userMessage: query,
      temperature: 0.1,
      maxTokens: 256,
      jsonMode: true,
    });

    const parsed = JSON.parse(response.content);

    return {
      violations: Array.isArray(parsed.violations) ? parsed.violations : [],
      state: parsed.state ?? null,
      vehicleType: parsed.vehicleType ?? null,
      isRepeatOffender: parsed.isRepeatOffender ?? false,
      rawQuery: query,
      confidence: parsed.confidence ?? 0.5,
    };
  } catch {
    return fallbackKeywordParse(query);
  }
}

function fallbackKeywordParse(query: string): ParsedIntent {
  const lower = query.toLowerCase();
  const violations: string[] = [];

  const keywordMap: Record<string, string> = {
    helmet: "helmet",
    "seat belt": "seatbelt",
    seatbelt: "seatbelt",
    speed: "speed",
    drunk: "drunk_driving",
    alcohol: "drunk_driving",
    signal: "signal",
    "red light": "signal",
    parking: "parking",
    mobile: "mobile_phone",
    phone: "mobile_phone",
    license: "license",
    licence: "license",
    insurance: "insurance",
    pollution: "pollution",
    overload: "overloading",
  };

  for (const [keyword, violation] of Object.entries(keywordMap)) {
    if (lower.includes(keyword)) violations.push(violation);
  }

  const stateMap: Record<string, string> = {
    maharashtra: "MH", delhi: "DL", "tamil nadu": "TN",
    karnataka: "KA", "uttar pradesh": "UP", "west bengal": "WB",
    gujarat: "GJ", rajasthan: "RJ", kerala: "KL", punjab: "PB",
  };

  let state: string | null = null;
  for (const [name, code] of Object.entries(stateMap)) {
    if (lower.includes(name)) { state = code; break; }
  }

  const vehicleMap: Record<string, string> = {
    bike: "2W", motorcycle: "2W", scooter: "2W",
    car: "4W", truck: "HMV", bus: "HMV", auto: "3W", rickshaw: "3W",
  };

  let vehicleType: string | null = null;
  for (const [keyword, type] of Object.entries(vehicleMap)) {
    if (lower.includes(keyword)) { vehicleType = type; break; }
  }

  return {
    violations,
    state,
    vehicleType,
    isRepeatOffender: lower.includes("second time") || lower.includes("again") || lower.includes("repeat"),
    rawQuery: query,
    confidence: violations.length > 0 ? 0.6 : 0.2,
  };
}
