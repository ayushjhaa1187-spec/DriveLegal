import { test, expect } from "@playwright/test";

test.describe("Admin Portal Guard", () => {
  test("Non-admin cannot access /portal/admin", async ({ page }) => {
    await page.goto("/portal/admin");

    // Pass if we do NOT see admin portal heading/content.
    await expect(page.getByText(/Admin Portal/i)).not.toBeVisible();

    // We accept redirect to /auth or /portal
    await expect(
      page.getByText(/Transparency Portal|Sign in|Unauthorized|Forbidden/i)
    ).toBeVisible();
  });
});
