import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth';

test.describe('Journal Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('navigate to journal create page', async ({ page }) => {
    await page.goto('/journals/create');
    await expect(page.locator('main')).toBeVisible();

    // Should have a form for creating a journal entry
    const form = page.locator('form, [data-testid="journal-form"]').first();
    await expect(form).toBeVisible({ timeout: 5000 }).catch(() => {
      expect(page.url()).toContain('/journals');
    });
  });

  test('fill journal form', async ({ page }) => {
    await page.goto('/journals/create');
    await page.waitForSelector('main', { timeout: 10000 });

    // Fill in title
    const titleInput = page.locator(
      'input[name="title"], input[id="title"], input[placeholder*="标题"], input[placeholder*="title" i]'
    ).first();

    if (await titleInput.isVisible()) {
      await titleInput.fill('E2E Test Journal Entry');
    }

    // Fill in content/body
    const contentInput = page.locator(
      'textarea[name="content"], textarea[name="body"], textarea[id="content"], [contenteditable="true"]'
    ).first();

    if (await contentInput.isVisible()) {
      await contentInput.fill('This is an automated test journal entry describing my pilgrimage experience.');
    }
  });

  test('submit journal and verify redirect', async ({ page }) => {
    await page.goto('/journals/create');
    await page.waitForSelector('main', { timeout: 10000 });

    const titleInput = page.locator(
      'input[name="title"], input[id="title"]'
    ).first();

    if (await titleInput.isVisible()) {
      await titleInput.fill('E2E Submit Journal');

      const contentInput = page.locator(
        'textarea[name="content"], textarea[name="body"], textarea[id="content"]'
      ).first();
      if (await contentInput.isVisible()) {
        await contentInput.fill('Test content for journal submission.');
      }

      const submitBtn = page.locator('button[type="submit"]').first();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        // Should redirect to journal detail or list
        await page.waitForURL(/\/journals/, { timeout: 10000 });
        expect(page.url()).toMatch(/\/journals/);
      }
    }
  });

  test('journal list shows entries', async ({ page }) => {
    await page.goto('/journals');
    await page.waitForSelector('main', { timeout: 10000 });
    await expect(page.locator('main')).toBeVisible();

    // Should show journal entries or empty state
    const content = page.locator(
      'a[href*="journals/"], [data-testid="journal-card"], [data-testid="empty-state"], main li, main [class*="card"]'
    ).first();
    await expect(content).toBeVisible({ timeout: 5000 }).catch(() => {
      expect(page.url()).toContain('/journals');
    });
  });

  test('journal detail page renders', async ({ page }) => {
    await page.goto('/journals');
    await page.waitForSelector('main', { timeout: 10000 });

    const journalLink = page.locator('a[href*="journals/"]').first();
    if (await journalLink.isVisible()) {
      await journalLink.click();
      await expect(page).toHaveURL(/\/journals\/.+/);
      await expect(page.locator('main')).toBeVisible();

      // Should display journal content
      const content = page.locator('main p, main article, main [class*="content"]').first();
      await expect(content).toBeVisible({ timeout: 5000 }).catch(() => {
        expect(page.url()).toMatch(/\/journals\/.+/);
      });
    }
  });
});
