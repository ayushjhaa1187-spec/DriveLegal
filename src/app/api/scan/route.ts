import { NextRequest, NextResponse } from "next/server";
import { callGeminiVision } from "../../../lib/llm/gemini";
import { SCAN_EXTRACTION_SYSTEM_PROMPT } from "../../../lib/prompts";

export const runtime = "edge";

export interface ScanResult {
  amountCharged?: number;
  violation?: string;
  section?: string;
  category?: string;
  vehicleType?: string;
  place?: string;
  date?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { image, mimeType } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Logic remains the same, but input is now JSON base64
    const response = await callGeminiVision(
      SCAN_EXTRACTION_SYSTEM_PROMPT,
      "Extract all traffic violation and penalty information from this challan document.",
      { inlineData: { data: image, mimeType: mimeType || "image/jpeg" } }
    );

    const extractedData = JSON.parse(response.content);

    return NextResponse.json({ data: extractedData, provider: response.provider });
  } catch (error) {
    console.error("Scan API error:", error);
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 });
  }
}
