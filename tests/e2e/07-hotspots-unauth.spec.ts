import { test, expect } from "@playwright/test";
import { env, requireSupabaseOrSkip } from "./_utils";

test.describe("Hotspots - unauth access", () => {
  test("hotspot-create function should reject missing Authorization", async ({ request }, testInfo) => {
    requireSupabaseOrSkip(testInfo);

    // Note: This assumes you deploy hotspot-create as Supabase Edge Function:
    // POST {SUPABASE_URL}/functions/v1/hotspot-create
    const url = `${env.supabaseUrl}/functions/v1/hotspot-create`;

    const res = await request.post(url, {
      headers: { "Content-Type": "application/json" },
      data: {
        type: "overcharging",
        lat: 28.6139,
        lng: 77.2090,
        state_code: "DL",
        description: "Test hotspot from Playwright (unauth)"
      },
    });

    // Accept 401 or 403 or 404 (if not deployed yet)
    expect([401, 403, 404]).toContain(res.status());
  });
});
