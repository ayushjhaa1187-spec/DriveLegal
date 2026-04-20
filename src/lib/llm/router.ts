import { callGemini } from "./gemini";
import { callGroq } from "./groq";
import type { LLMResponse } from "@/types/llm";

interface RouterOptions {
  systemPrompt: string;
  userMessage: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  preferredProvider?: "gemini" | "groq";
}

export async function routeLLMRequest(options: RouterOptions): Promise<LLMResponse> {
  const providers =
    options.preferredProvider === "groq"
      ? [callGroq, callGemini]
      : [callGemini, callGroq];

  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      const result = await provider(
        options.systemPrompt,
        options.userMessage,
        {
          temperature: options.temperature,
          maxTokens: options.maxTokens,
          jsonMode: options.jsonMode,
        }
      );
      return result;
    } catch (error) {
      lastError = error as Error;
      console.error(`LLM provider failed, trying next:`, error);
      continue;
    }
  }

  throw new Error(`All LLM providers failed. Last error: ${lastError?.message}`);
}
