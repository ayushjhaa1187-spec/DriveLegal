import Groq from "groq-sdk";
import type { LLMResponse } from "@/types/llm";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY ?? "" });

export async function callGroq(
  systemPrompt: string,
  userMessage: string,
  options: { temperature?: number; maxTokens?: number; jsonMode?: boolean } = {}
): Promise<LLMResponse> {
  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    model: "llama-3.1-70b-versatile",
    temperature: options.temperature ?? 0.2,
    max_tokens: options.maxTokens ?? 1024,
    response_format: options.jsonMode ? { type: "json_object" } : undefined,
  });

  const text = completion.choices[0]?.message?.content ?? "";

  return {
    content: text,
    provider: "groq",
    tokensUsed: completion.usage?.total_tokens ?? 0,
    cached: false,
  };
}
