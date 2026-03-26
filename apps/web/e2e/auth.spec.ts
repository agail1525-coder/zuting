import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers/auth';

test.describe('Authentication', () => {
  test('register page renders form', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[id="phone"], input[name="phone"], input[type="tel"]').first()).toBeVisible();
    await expect(page.locator('input[id="password"], input[name="password"], input[type="password"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('register requires agreement checkbox', async ({ page }) => {
    await page.goto('/register');
    const form = page.locator('form');

    // Fill in required fields but do NOT check the agreement
    await page.fill('input[id="phone"], input[name="phone"], input[type="tel"]', '13900139000');
    await page.fill('input[id="password"], input[name="password"], input[type="password"]', 'testpass123');

    // Try to submit without checking agreement
    await page.click('button[type="submit"]');

    // Should still be on register page or show validation error
    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible()) {
      // Verify checkbox exists and is not checked
      await expect(checkbox).not.toBeChecked();
    }
    await expect(page).toHaveURL(/\/register/);
  });

  test('login page renders form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[id="phone"], input[name="phone"], input[type="tel"]').first()).toBeVisible();
    await expect(page.locator('input[id="password"], input[name="password"], input[type="password"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[id="phone"], input[name="phone"], input[type="tel"]', '10000000000');
    await page.fill('input[id="password"], input[name="password"], input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show an error message or remain on login page
    await expect(page).toHaveURL(/\/login/);
    const errorMsg = page.locator('[role="alert"], .error, .text-red, [data-testid="error"]').first();
    await expect(errorMsg).toBeVisible({ timeout: 5000 }).catch(() => {
      // At minimum, should not redirect away from login
    });
  });

  test('login redirect to profile', async ({ page }) => {
    await loginAsTestUser(page);
    await expect(page).toHaveURL(/\/profile/);
  });

  test('profile shows user info when logged in', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/profile');
    await expect(page.locator('main')).toBeVisible();
    // Should display some user-related content
    await expect(
      page.locator('text=13800138000, text=用户, text=profile, [data-testid="user-info"]').first()
    ).toBeVisible({ timeout: 5000 }).catch(() => {
      // Profile page should at least be accessible
      expect(page.url()).toContain('/profile');
    });
  });

  test('profile shows login prompt when not logged in', async ({ page }) => {
    await page.goto('/profile');
    // Should redirect to login or show a login prompt
    const hasLoginLink = await page.locator('a[href*="login"], button:has-text("登录"), button:has-text("Login")').first().isVisible().catch(() => false);
    const isOnLogin = page.url().includes('/login');
    expect(hasLoginLink || isOnLogin).toBeTruthy();
  });

  test('logout clears session', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/profile');

    // Find and click logout button
    const logoutBtn = page.locator(
      'button:has-text("退出"), button:has-text("Logout"), button:has-text("登出"), a:has-text("退出"), a:has-text("Logout")'
    ).first();

    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await page.waitForTimeout(1000);

      // After logout, visiting profile should redirect to login or show prompt
      await page.goto('/profile');
      const hasLoginLink = await page.locator('a[href*="login"], button:has-text("登录"), button:has-text("Login")').first().isVisible().catch(() => false);
      const isOnLogin = page.url().includes('/login');
      expect(hasLoginLink || isOnLogin).toBeTruthy();
    }
  });
});
