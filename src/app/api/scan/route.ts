import { NextRequest, NextResponse } from "next/server";
import { callGeminiVision } from "@/lib/llm/gemini";
import { SCAN_EXTRACTION_SYSTEM_PROMPT } from "@/lib/llm/prompts";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum 5MB." }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Use JPEG, PNG, or WebP." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const response = await callGeminiVision(
      SCAN_EXTRACTION_SYSTEM_PROMPT,
      "Extract all traffic violation and penalty information from this challan document.",
      { inlineData: { data: base64, mimeType: file.type } }
    );

    const extractedData = JSON.parse(response.content);

    return NextResponse.json({ extracted: extractedData, provider: response.provider });
  } catch (error) {
    console.error("Scan API error:", error);
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 });
  }
}
