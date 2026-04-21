import { test } from "@playwright/test";
import { env, requireSupabaseOrSkip, postgrestInsertShouldFail, postgrestSelect } from "./_utils";

test.describe("Supabase RLS & Public Views", () => {
  test("Direct insert to analytics tables should fail (scan_events)", async ({ request }, testInfo) => {
    requireSupabaseOrSkip(testInfo);

    await postgrestInsertShouldFail(request, "scan_events", {
      state_code: "DL",
      geohash_5: "tdr5v",
      status: "correct"
    });
  });

  test("Public view v_hotspots_public should be readable", async ({ request }, testInfo) => {
    requireSupabaseOrSkip(testInfo);

    // Only checks that select works; data may be empty.
    await postgrestSelect(request, "v_hotspots_public", "geohash_5,state_code,type,hotspot_count");
  });
});
