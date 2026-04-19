/**
 * LLM Router — Gemini → Groq fallback → null (keyword mode)
 */

import { parseUserIntent, type StructuredIntent } from "./gemini";

interface ParseResult {
  intent: StructuredIntent | null;
  provider: "gemini" | "groq" | "keyword";
  error?: string;
}

// Groq structured output via Llama-3.1 70B
async function parseWithGroq(
  query: string,
  lang: string,
  apiKey: string
): Promise<StructuredIntent | null> {
  const systemPrompt = `You are a traffic violation intent parser for Indian roads.
From the user's query extract ONLY valid JSON with 3 keys:
- category: one of [speed,safety,documentation,dangerous_driving,intoxication,helmet,seatbelt,insurance,licence,registration,overloading,juvenile,pollution,parking,signal_violation,mobile_use,vehicle_condition,permit,other] or null
- stateCode: 2-letter Indian state code or null
- vehicleType: one of [2W,3W,4W,LMV,HMV,transport,all] or null
Return ONLY the JSON object.`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Query (language: ${lang}): ${query}` },
        ],
        temperature: 0,
        max_tokens: 128,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content ?? "";

    // Re-use Gemini's strict validator
    const { validateGroqOutput } = await import("./validate");
    return validateGroqOutput(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function routeIntent(
  query: string,
  lang: string,
  geminiKey: string | undefined,
  groqKey: string | undefined
): Promise<ParseResult> {
  // Pass 1: Gemini
  if (geminiKey) {
    try {
      const intent = await parseUserIntent(query, lang, geminiKey);
      if (intent) return { intent, provider: "gemini" };
    } catch (e: any) {
      // 429 or network error — fall through
      console.warn("Gemini parse failed:", e.message);
    }
  }

  // Pass 2: Groq
  if (groqKey) {
    try {
      const intent = await parseWithGroq(query, lang, groqKey);
      if (intent) return { intent, provider: "groq" };
    } catch (e: any) {
      console.warn("Groq parse failed:", e.message);
    }
  }

  // Pass 3: Keyword mode — client handles
  return { intent: null, provider: "keyword" };
}
