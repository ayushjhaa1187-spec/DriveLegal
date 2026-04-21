import { test, expect } from "@playwright/test";
import { setOffline } from "./_utils";

test.describe("Offline best-effort", () => {
  test("Calculator page remains usable without crashing when offline after load", async ({ page }) => {
    await page.goto("/calculator");
    await expect(page.getByRole("heading", { name: "Challan Calculator" })).toBeVisible();

    // Load once online (data fetch happens here)
    await page.waitForTimeout(1000);

    // Go offline
    await setOffline(page, true);

    // Interact without navigating away
    const selects = page.locator("select");
    await expect(selects).toHaveCount(3);

    await selects.nth(0).selectOption({ index: 1 });
    await selects.nth(1).selectOption({ index: 1 });
    await selects.nth(2).selectOption({ index: 1 });

    await expect(page.getByText(/Estimated Fine|₹/i)).toBeVisible();

    // Restore online
    await setOffline(page, false);
  });
});
