import { NextRequest, NextResponse } from "next/server";
import { callGeminiVision } from "../../../lib/llm/gemini";
import { SCAN_EXTRACTION_SYSTEM_PROMPT } from "../../../lib/prompts";

export const runtime = "nodejs";

import { z } from "zod";

const ScanResultSchema = z.object({
  challan_number: z.string().nullable().optional(),
  date_of_offence: z.string().nullable().optional(),
  vehicle_number: z.string().nullable().optional(),
  officer_name: z.string().nullable().optional(),
  police_station: z.string().nullable().optional(),
  violations: z.array(z.object({
    section: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    amount_charged_inr: z.number().nullable().optional(),
    category_id: z.string().nullable().optional(),
  })).optional(),
  total_amount_inr: z.number().nullable().optional(),
  due_date: z.string().nullable().optional(),
  issuing_authority: z.string().nullable().optional(),
  vehicleType: z.enum(["2W", "3W", "4W", "LMV", "HMV", "transport", "all"]).nullable().optional(),
  extraction_confidence: z.enum(["high", "medium", "low"]).optional(),
});

export type ScanResult = z.infer<typeof ScanResultSchema>;

export async function POST(request: NextRequest) {
  try {
    const { image, mimeType } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const response = await callGeminiVision(
      SCAN_EXTRACTION_SYSTEM_PROMPT,
      "Extract all traffic violation and penalty information from this challan document. Return JSON.",
      { inlineData: { data: image, mimeType: mimeType || "image/jpeg" } }
    );

    const rawJson = JSON.parse(response.content);
    const result = ScanResultSchema.safeParse(rawJson);
    
    if (!result.success) {
      console.warn("OCR Schema Validation Failure:", result.error);
      // Fallback to raw if logic allows, or return error
      return NextResponse.json({ data: rawJson, warning: "Schema validation partial match", provider: response.provider });
    }

    return NextResponse.json({ data: result.data, provider: response.provider });
  } catch (error) {
    console.error("Scan API error:", error);
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 });
  }
}
