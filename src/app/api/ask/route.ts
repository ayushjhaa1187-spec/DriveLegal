import { NextRequest, NextResponse } from "next/server";
import { routeLLMRequest } from "@/lib/llm/router";
import { parseUserIntent } from "@/lib/llm/intent-parser";
import { RIGHTS_CHAT_SYSTEM_PROMPT } from "@/lib/llm/prompts";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, mode = "rights", language = "en" } = body;

    if (!query || typeof query !== "string" || query.length > 500) {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }

    if (mode === "intent") {
      const intent = await parseUserIntent(query);
      return NextResponse.json({ intent });
    }

    const languageNames: Record<string, string> = {
      hi: "Hindi", ta: "Tamil", te: "Telugu", mr: "Marathi",
      bn: "Bengali", gu: "Gujarati", kn: "Kannada", ml: "Malayalam", pa: "Punjabi",
    };

    const systemPrompt =
      language !== "en" && languageNames[language]
        ? `${RIGHTS_CHAT_SYSTEM_PROMPT}\n\nIMPORTANT: Respond in ${languageNames[language]}.`
        : RIGHTS_CHAT_SYSTEM_PROMPT;

    const response = await routeLLMRequest({
      systemPrompt,
      userMessage: query,
      temperature: 0.3,
      maxTokens: 1024,
    });

    return NextResponse.json({
      answer: response.content,
      provider: response.provider,
    });
  } catch (error) {
    console.error("Ask API error:", error);
    return NextResponse.json(
      { error: "Service temporarily unavailable. Please try again." },
      { status: 503 }
    );
  }
}
