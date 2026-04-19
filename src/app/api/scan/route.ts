import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export interface ScanResult {
  section: string | null;
  violation: string | null;
  amountCharged: number | null;
  date: string | null;
  confidence: "high" | "low";
}

const SYSTEM_PROMPT = `You are a traffic challan (fine ticket) text extractor.
Extract the following information from the challan receipt image:
- section: The legal section of the violation (e.g. "194D", "177", "185")
- violation: Short description of the offence (e.g. "Driving without helmet")
- amountCharged: The total fine amount printed on the receipt, as a number
- date: The date of the challan in YYYY-MM-DD format
- confidence: "high" if you are sure about the amount and section, "low" otherwise

Return EXACTLY a JSON object with these 5 keys. If a field isn't found, use null.
Do not include any other text or markdown formatting outside the JSON object.`;

/** Strict validation of Gemini Vision output */
function validateSchema(raw: any): ScanResult {
  return {
    section: typeof raw?.section === "string" ? raw.section : null,
    violation: typeof raw?.violation === "string" ? raw.violation : null,
    amountCharged: typeof raw?.amountCharged === "number" ? raw.amountCharged : null,
    date: typeof raw?.date === "string" ? raw.date : null,
    confidence: raw?.confidence === "high" || raw?.confidence === "low" ? raw.confidence : "low",
  };
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    
    // Accept base64 image data string
    const body = await request.json();
    const base64Image = body.image; // "iVBORw0KGgo..." (no data prefix)
    const mimeType = body.mimeType || "image/jpeg";

    if (!base64Image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const requestBody = {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{
        role: "user",
        parts: [
          { text: "Extract the challan details from this image." },
          { inlineData: { mimeType, data: base64Image } }
        ]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0,
      }
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API error: ${res.status} ${errText}`);
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    
    try {
      const parsed = JSON.parse(rawText);
      const validated = validateSchema(parsed);
      return NextResponse.json({ success: true, data: validated });
    } catch {
      return NextResponse.json({ error: "Failed to parse OCR response" }, { status: 500 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
