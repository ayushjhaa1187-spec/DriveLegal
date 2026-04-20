import { NextRequest, NextResponse } from "next/server";
import { STATE_NAME_TO_CODE } from "@/lib/geo/state-codes";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  // Cloudflare provides region headers
  const region = request.headers.get("cf-region") ?? "";
  const country = request.headers.get("cf-ipcountry") ?? "";

  if (country !== "IN") {
    return NextResponse.json({ stateCode: null, country });
  }

  const normalized = region.toLowerCase().trim();
  const stateCode = STATE_NAME_TO_CODE[normalized] ?? null;

  return NextResponse.json({ stateCode, region });
}
