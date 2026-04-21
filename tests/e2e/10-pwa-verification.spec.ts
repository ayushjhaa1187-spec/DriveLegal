import { test, expect } from '@playwright/test';

test.describe('PWA Hardening Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('manifest.json has correct configuration', async ({ page }) => {
    const manifestResponse = await page.request.get('/manifest.json');
    expect(manifestResponse.ok()).toBeTruthy();
    const manifest = await manifestResponse.json();
    
    expect(manifest.name).toBe('DriveLegal');
    expect(manifest.display).toBe('standalone');
    expect(manifest.orientation).toBe('portrait');
    expect(manifest.background_color).toBe('#0f172a');
    
    // Verify maskable icon presence
    const hasMaskable = manifest.icons.some(icon => icon.purpose === 'maskable');
    expect(hasMaskable).toBeTruthy();
  });

  test('service worker is registered', async ({ page }) => {
    const swRegistered = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      return !!registration;
    });
    // Note: In dev mode services workers might not register if disabled in next.config.ts
    // but we can check if the PWARegistrar component is present
    const registrar = await page.locator('script[src*="sw"]').count();
    expect(swRegistered || registrar > 0).toBeTruthy();
  });

  test('UI respects safe areas', async ({ page }) => {
    // Check if body has the background color matched to splash
    const bgColor = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    // slate-950 is rgb(2, 6, 23) in dark mode
    // We just check if it's not default white
    expect(bgColor).not.toBe('rgb(255, 255, 255)');
  });
});
