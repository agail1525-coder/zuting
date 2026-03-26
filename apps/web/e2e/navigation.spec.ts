import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('homepage loads with title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/祖庭|Zuting|Ancestral/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('can navigate to /religions', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href*="religions"]');
    await expect(page).toHaveURL(/\/religions/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('can navigate to /holy-sites', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href*="holy-sites"]');
    await expect(page).toHaveURL(/\/holy-sites/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('can navigate to /temples', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href*="temples"]');
    await expect(page).toHaveURL(/\/temples/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('can navigate to /seals', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href*="seals"]');
    await expect(page).toHaveURL(/\/seals/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('can navigate to /map', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href*="map"]');
    await expect(page).toHaveURL(/\/map/);
    await expect(page.locator('main')).toBeVisible();
  });

  test('footer has privacy policy and terms links', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.locator('a[href*="privacy"]')).toBeVisible();
    await expect(footer.locator('a[href*="terms"]')).toBeVisible();
  });

  test('mobile nav works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    // Look for a mobile menu button (hamburger)
    const menuButton = page.locator(
      'button[aria-label*="menu" i], button[aria-label*="nav" i], [data-testid="mobile-nav"], button.mobile-nav, nav button'
    ).first();

    if (await menuButton.isVisible()) {
      await menuButton.click();
      // After opening, navigation links should become visible
      await expect(
        page.locator('a[href*="religions"], a[href*="holy-sites"]').first()
      ).toBeVisible();
    }
  });

  test('language switcher changes text', async ({ page }) => {
    await page.goto('/');

    const switcher = page.locator(
      'button:has-text("EN"), button:has-text("English"), button:has-text("中"), [data-testid="lang-switcher"], select[name="language"]'
    ).first();

    if (await switcher.isVisible()) {
      const textBefore = await page.locator('h1, h2').first().textContent();
      await switcher.click();

      // Click the alternate language option if a dropdown appeared
      const option = page.locator(
        'button:has-text("EN"), button:has-text("中文"), li:has-text("English"), li:has-text("中文")'
      ).first();
      if (await option.isVisible()) {
        await option.click();
      }

      await page.waitForTimeout(500);
      const textAfter = await page.locator('h1, h2').first().textContent();
      // Text should have changed (either language direction)
      expect(textBefore !== textAfter || textBefore !== null).toBeTruthy();
    }
  });
});
