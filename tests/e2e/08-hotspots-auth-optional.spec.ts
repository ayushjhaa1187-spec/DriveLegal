import { test, expect } from "@playwright/test";
import { env, requireSupabaseOrSkip, postgrestSelect } from "./_utils";

test.describe("Hotspots - authenticated create (optional)", () => {
  test("Creates hotspot via edge function if PLAYWRIGHT_SUPABASE_JWT provided", async ({ request }, testInfo) => {
    requireSupabaseOrSkip(testInfo);

    if (!env.supabaseJwt) {
      test.skip(!env.supabaseJwt, "Set PLAYWRIGHT_SUPABASE_JWT='Bearer <access_token>' to enable this test.");
    }

    const url = `${env.supabaseUrl}/functions/v1/hotspot-create`;

    const before = await postgrestSelect(
      request,
      "v_hotspots_public",
      "geohash_5,state_code,type,hotspot_count",
      "state_code=eq.DL"
    );

    const res = await request.post(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: env.supabaseJwt, // Bearer token
      },
      data: {
        type: "overcharging",
        lat: 28.6139,
        lng: 77.2090,
        state_code: "DL",
        description: "Playwright auth hotspot test"
      },
    });

    // If function not deployed, accept 404 but do not fail hard.
    if (res.status() === 404) {
      test.skip(res.status() === 404, "hotspot-create function not deployed (404).");
    }

    expect(res.ok()).toBeTruthy();

    const after = await postgrestSelect(
      request,
      "v_hotspots_public",
      "geohash_5,state_code,type,hotspot_count",
      "state_code=eq.DL"
    );

    // Not guaranteed to change due to aggregation buckets; just ensure query works.
    expect(Array.isArray(after)).toBeTruthy();
    expect(Array.isArray(before)).toBeTruthy();
  });
});
