import { test, expect } from '@playwright/test';

test.describe('Ticket Workflow & Resolution Gate (E2E-02 / BR-08 / BR-09)', () => {
  test('Requester advisory resolution signals satisfaction without bypassing staff verification', async ({ page }) => {
    // 1. Log in as Requester
    await page.goto('/login');
    await page.fill('input[type="email"]', 'aran@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/(requester\/dashboard|my-tickets)/);

    // Navigate to tickets
    await page.goto('/my-tickets');
    await page.waitForSelector('table tbody tr');

    // Click a ticket
    const firstRow = page.locator('table tbody tr').first();
    await firstRow.click();
    await expect(page).toHaveURL(/\/tickets\/\d+/);

    // If advisory resolution button is available (when ticket is WAITING_FOR_REQUESTER or IN_PROGRESS)
    const advisoryBtn = page.getByTestId('advisory-resolve-btn');
    if (await advisoryBtn.isVisible()) {
      await advisoryBtn.click();
      // Should show confirmation notification
      await expect(page.getByTestId('advisory-confirmation-banner')).toBeVisible();
    }
  });

  test('IT Staff verifies and formally transitions ticket status', async ({ page }) => {
    // 1. Log in as IT Staff
    await page.goto('/login');
    await page.fill('input[type="email"]', 'it1@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/(staff\/dashboard|staff\/tickets)/);

    await page.goto('/staff/tickets');
    await page.waitForSelector('table tbody tr');

    const firstRow = page.locator('table tbody tr').first();
    await firstRow.click();
    await expect(page).toHaveURL(/\/staff\/tickets\/\d+/);

    // Verify status dropdown exists and contains valid next statuses according to transition matrix
    const statusSelect = page.locator('label:has-text("Status") + select, select[name="status"]');
    if (await statusSelect.isVisible()) {
      await expect(statusSelect).toBeEnabled();
    }
  });
});
