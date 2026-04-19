import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const SYSTEM_PROMPT = `You are a knowledgeable assistant for Indian traffic laws and driver rights.
The user is asking about their rights regarding a specific traffic situation.
Rules:
1. Provide accurate information based strictly on the Motor Vehicles Act, 1988 and its 2019 amendments.
2. Keep the advice general and factual. Focus on the legal process, rights, and what documents are valid (e.g. DigiLocker).
3. Do NOT provide personal legal advice for a specific ongoing court case.
4. Keep the response concise, using simple bullet points.
5. ALWAYS conclude your message with: "\n\n*Disclaimer: This is general information, not legal advice.*"
`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    
    const body = await request.json().catch(() => null);
    if (!body?.query || typeof body.query !== "string") {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const requestBody = {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: body.query }] }],
      generationConfig: {
        temperature: 0.2, // low temp for factual legal advice
        maxOutputTokens: 300,
      }
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    if (!res.ok) {
      throw new Error("Failed to fetch from Gemini");
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "Could not generate response.";

    return NextResponse.json({ text });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
