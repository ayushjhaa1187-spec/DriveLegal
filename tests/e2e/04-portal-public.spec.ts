import { test, expect } from "@playwright/test";

test.describe("Public Transparency Portal", () => {
  test("Portal loads and shows public analytics sections", async ({ page }) => {
    await page.goto("/portal");

    await expect(page.getByRole("heading", { name: /Transparency Portal/i })).toBeVisible();

    // Should show some analytics content (depends on your portal UI)
    // We look for keywords that should exist in portal copy or tables.
    await expect(
      page.getByText(/Compliance|Overcharge|violations|analytics/i)
    ).toBeVisible();
  });
});
