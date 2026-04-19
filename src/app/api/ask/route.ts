import { NextRequest, NextResponse } from "next/server";
import { routeIntent } from "@/lib/llm/router";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.query || typeof body.query !== "string") {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const query = body.query.trim().slice(0, 500); // length cap
  const lang = typeof body.lang === "string" ? body.lang : "en";

  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  const result = await routeIntent(query, lang, geminiKey, groqKey);

  return NextResponse.json(
    {
      intent: result.intent,
      provider: result.provider,
      // provider is purely informational — client shouldn't branch logic on it
    },
    {
      headers: {
        // Same intent parse result is stable for 24h across users
        "Cache-Control": "public, s-maxage=86400",
      },
    }
  );
}
