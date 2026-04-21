import { test, expect } from "@playwright/test";
import path from "node:path";

test.describe("Scan & Verify", () => {
  test("Rejects non-image or processes image without crashing", async ({ page }) => {
    await page.goto("/scan");

    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toHaveCount(1);

    const fixturePath = path.join(process.cwd(), "tests/e2e/fixtures/sample.png");
    await fileInput.setInputFiles(fixturePath);

    // After upload, the Scan & Verify button should appear
    const scanBtn = page.getByRole("button", { name: /Scan & Verify/i });
    await expect(scanBtn).toBeVisible();

    await scanBtn.click();

    // Either:
    // - extraction succeeds and shows "Extracted Data"
    // - extraction fails and shows error banner
    await expect(
      page.getByText(/Extracted Data|Failed to process image|Scan failed/i)
    ).toBeVisible({ timeout: 30_000 });
  });
});
