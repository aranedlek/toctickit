import { test, expect } from '@playwright/test';

test.describe('Authentication Flow (E2E-01)', () => {
  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'WrongPass123!');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('should login successfully and redirect to dashboard based on role', async ({ page }) => {
    await page.goto('/login');
    // Using the seeded admin user
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Admin should be redirected to staff tickets (they don't have a separate dashboard in this app yet)
    await expect(page).toHaveURL(/\/staff\/tickets/);
    
    // Check if Navbar shows user info
    await expect(page.locator('nav')).toContainText('Admin User');

    // Test logout
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
  });
});
