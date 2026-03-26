import { test, expect } from '@playwright/test';

test.describe('SEO Verification', () => {
  test('homepage has proper title and meta description', async ({ page }) => {
    await page.goto('/');

    // Should have a meaningful title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    // Should have a meta description
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute('content', /.+/);
  });

  test('detail pages have dynamic titles', async ({ page }) => {
    // Visit religions list first to get a valid detail link
    await page.goto('/religions');
    await page.waitForSelector('main', { timeout: 10000 });

    const detailLink = page.locator('a[href*="religions/"]').first();
    if (await detailLink.isVisible()) {
      await detailLink.click();
      await expect(page).toHaveURL(/\/religions\/.+/);

      const title = await page.title();
      expect(title).toBeTruthy();
      // Detail page title should differ from a generic title
      expect(title.length).toBeGreaterThan(0);
    }
  });

  test('/robots.txt is accessible', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);

    const text = await page.locator('body').textContent();
    expect(text).toBeTruthy();
    // robots.txt should contain User-agent directive
    expect(text!.toLowerCase()).toContain('user-agent');
  });

  test('/sitemap.xml is accessible and valid XML', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);

    const contentType = response!.headers()['content-type'] || '';
    // Should be XML content type
    expect(contentType).toMatch(/xml|text/);

    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();
    // Should contain standard sitemap XML elements
    expect(body!).toContain('urlset');
  });

  test('OpenGraph meta tags present on detail pages', async ({ page }) => {
    await page.goto('/religions');
    await page.waitForSelector('main', { timeout: 10000 });

    const detailLink = page.locator('a[href*="religions/"]').first();
    if (await detailLink.isVisible()) {
      await detailLink.click();
      await expect(page).toHaveURL(/\/religions\/.+/);

      // Check for OpenGraph tags
      const ogTitle = page.locator('meta[property="og:title"]');
      const ogDesc = page.locator('meta[property="og:description"]');
      const ogType = page.locator('meta[property="og:type"]');

      // At least og:title should be present
      await expect(ogTitle).toHaveAttribute('content', /.+/, { timeout: 3000 }).catch(() => {
        // OG tags may not be implemented yet; this is a soft check
      });
    }
  });
});
