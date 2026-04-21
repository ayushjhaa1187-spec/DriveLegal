import { test, expect } from "@playwright/test";
import { gotoAndExpectHeading } from "./_utils";

test.describe("Smoke", () => {
  test("Home loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("DriveLegal")).toBeVisible();
  });

  test("Core routes render", async ({ page }) => {
    await gotoAndExpectHeading(page, "/calculator", "Challan Calculator");
    await gotoAndExpectHeading(page, "/ask", "Legal AI Assistant");
    await gotoAndExpectHeading(page, "/scan", "Scan & Verify Challan");
    await gotoAndExpectHeading(page, "/rights", "Know Your Rights");
  });
});
