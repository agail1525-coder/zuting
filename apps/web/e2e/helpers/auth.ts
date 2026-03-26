import { Page } from '@playwright/test';

export async function loginAsTestUser(page: Page) {
  await page.goto('/login');
  await page.fill('input[id="phone"]', '13800138000');
  await page.fill('input[id="password"]', 'testpass123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/profile');
}
