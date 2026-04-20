import { GoogleGenerativeAI } from "@google/generative-ai";
import type { LLMResponse } from "@/types/llm";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY ?? "");

export async function callGemini(
  systemPrompt: string,
  userMessage: string,
  options: { temperature?: number; maxTokens?: number; jsonMode?: boolean } = {}
): Promise<LLMResponse> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: options.temperature ?? 0.2,
      maxOutputTokens: options.maxTokens ?? 1024,
      responseMimeType: options.jsonMode ? "application/json" : "text/plain",
    },
  });

  const result = await model.generateContent(userMessage);
  const text = result.response.text();

  return {
    content: text,
    provider: "gemini",
    tokensUsed: result.response.usageMetadata?.totalTokenCount ?? 0,
    cached: false,
  };
}

export async function callGeminiVision(
  systemPrompt: string,
  prompt: string,
  imageData: { inlineData: { data: string; mimeType: string } }
): Promise<LLMResponse> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent([prompt, imageData]);
  const text = result.response.text();

  return {
    content: text,
    provider: "gemini-vision",
    tokensUsed: result.response.usageMetadata?.totalTokenCount ?? 0,
    cached: false,
  };
}
