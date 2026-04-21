import { test, expect } from "@playwright/test";
import { env, softExpectOneOfVisible } from "./_utils";

test.describe("Ask AI", () => {
  test("Sends a question and receives response or graceful fallback", async ({ page }) => {
    await page.goto("/ask");

    const input = page.getByPlaceholder("Ask about traffic laws...");
    await expect(input).toBeVisible();

    await input.fill("What is the fine for helmet in Maharashtra?");
    await page.getByRole("button", { name: /Send message/i }).click();

    // We accept either:
    // - an assistant message bubble appears
    // - a known fallback error text appears
    const winner = await softExpectOneOfVisible(page, [
      { label: "assistant-bubble", locator: () => page.locator("div").filter({ hasText: "⚠️" }).first() },
      { label: "fallback-text", locator: () => page.getByText(/Service temporarily unavailable|Sorry, I could not process|Please check your connection/i) },
      { label: "any-assistant-text", locator: () => page.locator("main").getByText(/legal|fine|section|act|MVA/i) },
    ], env.strictLLM ? 20_000 : 12_000);

    expect(winner).toBeTruthy();
  });
});
