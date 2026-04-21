import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { z } from "zod";
import type { Violation } from "@/lib/law-engine/schema";
import type { VehicleTypeInput } from "@/lib/law-engine/types";

// Strict Zod Schema for Intents
const IntentSchema = z.object({
  category: z.enum([
    "speed", "safety", "documentation", "dangerous_driving", "intoxication",
    "helmet", "seatbelt", "insurance", "licence", "registration", "overloading",
    "juvenile", "pollution", "parking", "signal_violation", "mobile_use",
    "vehicle_condition", "permit", "other"
  ]).nullable(),
  stateCode: z.string().length(2).toUpperCase().nullable(),
  vehicleType: z.enum([
    "2W", "3W", "4W", "LMV", "HMV", "transport", "non_transport", "all"
  ]).nullable(),
});

export type StructuredIntent = z.infer<typeof IntentSchema>;

const SYSTEM_PROMPT = `You are a traffic violation intent parser for India.
Extract the violation category, state code, and vehicle type from the user query.

Valid Categories: [speed, safety, documentation, dangerous_driving, intoxication, helmet, seatbelt, insurance, licence, registration, overloading, juvenile, pollution, parking, signal_violation, mobile_use, vehicle_condition, permit, other]
Valid Vehicles: [2W, 3W, 4W, LMV, HMV, transport, all]

Rules:
1. Return ONLY valid JSON.
2. If state is not mentioned, use null.
3. If vehicle is not mentioned, use null.
4. IMPORTANT: Never suggest a fine amount or legal advice.

Examples:
- "helmet fine delhi" -> {"category":"helmet", "stateCode":"DL", "vehicleType":"2W"}
- "overspeeding in maharashtra" -> {"category":"speed", "stateCode":"MH", "vehicleType":null}
- "drunk driving penalty" -> {"category":"intoxication", "stateCode":null, "vehicleType":null}
- "pillion without helmet" -> {"category":"helmet", "stateCode":null, "vehicleType":"2W"}
`;

function getGenAI(apiKey: string) {
  return new GoogleGenerativeAI(apiKey);
}

export async function parseUserIntent(
  query: string,
  lang: string = "en",
  apiKey: string
): Promise<StructuredIntent | null> {
  const genAI = getGenAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: SYSTEM_PROMPT
  });

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `Query (language: ${lang}): ${query}` }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0,
      }
    });

    const response = await result.response;
    const rawText = response.text();
    const rawJson = JSON.parse(rawText);
    const validated = IntentSchema.safeParse(rawJson);
    return validated.success ? validated.data : null;
  } catch (err) {
    console.error("Gemini SDK parseUserIntent error:", err);
    return null;
  }
}

export async function callGemini(
  systemPrompt: string,
  userMessage: string,
  options: { temperature?: number; maxTokens?: number; jsonMode?: boolean; apiKey?: string } = {}
): Promise<any> {
  const apiKey = options.apiKey || process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_AI_API_KEY is not set");

  const genAI = getGenAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: systemPrompt
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userMessage }] }],
    generationConfig: {
      responseMimeType: options.jsonMode ? "application/json" : "text/plain",
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens ?? 2048,
    }
  });

  const response = await result.response;
  return {
    content: response.text(),
    provider: "gemini",
    tokensUsed: response.usageMetadata?.totalTokenCount ?? 0,
    cached: false,
  };
}

export async function callGeminiVision(
  systemPrompt: string,
  userMessage: string,
  images: any, // Expecting { inlineData: { data, mimeType } }
  options: { temperature?: number; maxTokens?: number; apiKey?: string } = {}
): Promise<any> {
  const apiKey = options.apiKey || process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_AI_API_KEY is not set");

  const genAI = getGenAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: systemPrompt
  });

  // Convert legacy images format to SDK format if needed
  const parts: any[] = [{ text: userMessage }];
  if (images?.inlineData) {
    parts.push(images);
  }

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: options.temperature ?? 0,
      maxOutputTokens: options.maxTokens ?? 2048,
    }
  });

  const response = await result.response;
  return {
    content: response.text(),
    provider: "gemini",
    tokensUsed: response.usageMetadata?.totalTokenCount ?? 0,
    cached: false,
  };
}
