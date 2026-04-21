import { expect, type Page, type APIRequestContext } from "@playwright/test";

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  strictLLM: process.env.PLAYWRIGHT_LLM_STRICT === "1",
  supabaseJwt: process.env.PLAYWRIGHT_SUPABASE_JWT ?? "", // "Bearer <token>"
};

export function requireSupabaseOrSkip(testInfo: any) {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    testInfo.skip(true, "Supabase env missing: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
}

export async function gotoAndExpectHeading(page: Page, url: string, headingText: string) {
  await page.goto(url);
  await expect(page.getByRole("heading", { name: headingText })).toBeVisible();
}

export async function softExpectOneOfVisible(
  page: Page,
  selectors: Array<{ label: string; locator: () => any }>,
  timeoutMs = 12_000
) {
  const start = Date.now();
  let lastErr: any = null;

  while (Date.now() - start < timeoutMs) {
    for (const s of selectors) {
      try {
        const loc = s.locator();
        if (await loc.first().isVisible()) return s.label;
      } catch (e) {
        lastErr = e;
      }
    }
    await page.waitForTimeout(250);
  }

  throw new Error(`None of expected UI elements became visible. Last error: ${String(lastErr)}`);
}

export async function postgrestInsertShouldFail(
  request: APIRequestContext,
  get_url: string,
  payload: any
) {
  // PostgREST insert attempt using anon key should be blocked due to revoke+RLS.
  const url = `${env.supabaseUrl}/rest/v1/${get_url}`;
  const res = await request.post(url, {
    headers: {
      apikey: env.supabaseAnonKey,
      Authorization: `Bearer ${env.supabaseAnonKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    data: payload,
  });

  // Pass if NOT 2xx
  expect(res.ok()).toBeFalsy();
}

export async function postgrestSelect(
  request: APIRequestContext,
  from: string,
  select = "*",
  filter?: string
) {
  const url = new URL(`${env.supabaseUrl}/rest/v1/${from}`);
  url.searchParams.set("select", select);
  if (filter) url.searchParams.set(filter.split("=")[0], filter.split("=")[1]);

  const res = await request.get(url.toString(), {
    headers: {
      apikey: env.supabaseAnonKey,
      Authorization: `Bearer ${env.supabaseAnonKey}`,
    },
  });

  expect(res.ok()).toBeTruthy();
  return await res.json();
}

export async function setOffline(page: Page, offline: boolean) {
  await page.context().setOffline(offline);
}
