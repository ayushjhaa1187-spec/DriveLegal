import Fuse from "fuse.js";
import { parseUserIntent, type StructuredIntent, callGemini } from "./gemini";
import { dataLoader } from "@/lib/data/data-loader";
import { callGroq } from "./groq";

/**
 * Universal LLM Router: Directs requests to available providers (Gemini/Groq).
 */
export async function routeLLMRequest(options: {
  systemPrompt: string;
  userMessage: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}) {
  // Logic: Prefer Gemini for complex logic, Groq for speed if needed.
  // For now, default to Gemini with fallback to Groq if API key issues occur.
  try {
    return await callGemini(options.systemPrompt, options.userMessage, {
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      jsonMode: options.jsonMode,
    });
  } catch (err) {
    console.warn("Gemini call failed, attempting Groq fallback:", err);
    try {
      return await callGroq(options.systemPrompt, options.userMessage, {
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        jsonMode: options.jsonMode,
      });
    } catch (groqErr) {
      console.error("All LLM providers failed:", groqErr);
      throw new Error("AI services currently unavailable.");
    }
  }
}

/**
 * Hybrid Router: Coordinates between LLM and Fuzzy Local Search.
 */
export async function resolveIntent(
  query: string,
  isOnline: boolean,
  stateCode: string = "central"
): Promise<StructuredIntent | null> {
  // Path 1: Online via Gemini
  if (isOnline) {
    try {
      const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
      const intent = await parseUserIntent(query, "en", apiKey);
      if (intent && intent.category) return intent;
    } catch (err) {
      console.warn("Gemini intent parsing failed, falling back to local fuzzy search.", err);
    }
  }

  // Path 2: Offline / Fallback via Fuzzy Search (Fuse.js)
  return await fuzzyMatchIntent(query, stateCode);
}

/**
 * Local Fuzzy Matcher using Fuse.js on cached violations data.
 */
async function fuzzyMatchIntent(query: string, stateCode: string): Promise<StructuredIntent | null> {
  // Heuristic: Check for direct category matches first (Fast & Reliable)
  const categories = [
    "speed", "safety", "documentation", "dangerous_driving", "intoxication",
    "helmet", "seatbelt", "insurance", "licence", "registration", "overloading",
    "juvenile", "pollution", "parking", "signal_violation", "mobile_use",
    "vehicle_condition", "permit"
  ];
  const q = query.toLowerCase();
  for (const cat of categories) {
    if (q.includes(cat)) {
      return { category: cat as StructuredIntent["category"], stateCode: null, vehicleType: null };
    }
  }

  // Fallback to fuzzy search if no direct keyword found
  try {
    const violations = await dataLoader.loadViolations();
    const fuse = new Fuse(violations, {
      keys: [
        { name: "category", weight: 0.9 },
        { name: "title.en", weight: 0.7 },
        { name: "plain_english_summary", weight: 0.3 }
      ],
      threshold: 0.6,
      includeScore: true
    });

    const results = fuse.search(query);
    if (results.length > 0) {
      const top = results[0].item;
      return {
        category: top.category as StructuredIntent["category"],
        stateCode: null,
        vehicleType: null
      };
    }
  } catch (err) {
    console.error("Fuzzy match logic error:", err);
  }
  return null;
}

