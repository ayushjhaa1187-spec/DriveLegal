import { test, expect } from "@playwright/test";

test.describe("Calculator", () => {
  test("Selects basic inputs and shows result placeholder/amount", async ({ page }) => {
    await page.goto("/calculator");

    // It uses 3 selects in current UI. We select first option for each.
    const selects = page.locator("select");
    await expect(selects).toHaveCount(3);

    // Violation type
    await selects.nth(0).selectOption({ index: 1 });
    // State
    await selects.nth(1).selectOption({ index: 1 });
    // Vehicle
    await selects.nth(2).selectOption({ index: 1 });

    // Toggle repeat offender (optional)
    const repeat = page.locator('input[type="checkbox"]#repeat');
    if (await repeat.count()) await repeat.check();

    // Result box should appear
    await expect(page.getByText(/Estimated Fine/i)).toBeVisible();

    // Should show some currency symbol
    await expect(page.getByText(/₹/)).toBeVisible();
  });
});
