import { NextRequest, NextResponse } from "next/server";
import { INDIA_STATES } from "@/lib/law-engine/states";

export const runtime = "edge";

// Cloudflare provides CF-IPCountry and via Vercel: x-vercel-ip-country-region
// In development these will be absent — we return null gracefully.
export async function GET(request: NextRequest) {
  const headers = request.headers;

  // Vercel edge: x-vercel-ip-country-region = e.g. "MH"
  const vercelRegion = headers.get("x-vercel-ip-country-region");
  // Cloudflare: CF-Region
  const cfRegion = headers.get("cf-region");
  // Cloudflare: CF-IPCountry (fallback — country only)
  const cfCountry = headers.get("cf-ipcountry");

  const rawCode = vercelRegion ?? cfRegion ?? null;

  // Validate against known state list
  const stateCode =
    rawCode && INDIA_STATES.some((s) => s.code === rawCode.toUpperCase())
      ? rawCode.toUpperCase()
      : null;

  return NextResponse.json(
    { stateCode, source: rawCode ? "header" : null, country: cfCountry },
    {
      headers: {
        // Cache for 1 hour on CDN edge; IP-based detection doesn't change often
        "Cache-Control": "public, s-maxage=3600",
      },
    }
  );
}
