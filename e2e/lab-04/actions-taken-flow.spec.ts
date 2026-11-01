import { test, expect } from '@playwright/test';

test.describe('IT Staff Actions Taken Flow (E2E-01 / AC-01 / AC-03)', () => {
  const actionDescription = `E2E Verified network cabling ${Date.now()}`;
  const actionResult = 'Cat6 cable replaced and ping latency < 1ms';

  test('IT Staff can record and view Action Taken on a ticket', async ({ page }) => {
    // 1. Log in as IT Staff
    await page.goto('/login');
    await page.fill('input[type="email"]', 'it1@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Should navigate to dashboard or staff tickets
    await expect(page).toHaveURL(/\/(staff\/dashboard|staff\/tickets)/);

    // Navigate to ticket queue
    await page.goto('/staff/tickets');
    await page.waitForSelector('table tbody tr');

    // Click on the first ticket row
    const firstRow = page.locator('table tbody tr').first();
    await firstRow.click();
    await expect(page).toHaveURL(/\/staff\/tickets\/\d+/);

    // Verify Actions Taken section exists
    await expect(page.locator('h2:has-text("Actions Taken")')).toBeVisible();

    // 2. Open Record Action Taken modal
    const recordBtn = page.getByTestId('record-action-btn');
    await expect(recordBtn).toBeVisible();
    await recordBtn.click();

    // Verify modal is open
    await expect(page.locator('h3:has-text("Record Action Taken")')).toBeVisible();

    // 3. Fill required fields
    await page.fill('#actionDescription', actionDescription);
    await page.fill('#actionResult', actionResult);

    // Submit form
    await page.click('button[data-testid="save-action-btn"]');

    // 4. Verify action appears in Actions Taken table
    await expect(page.locator(`text=${actionDescription}`)).toBeVisible();
    await expect(page.locator(`text=${actionResult}`)).toBeVisible();
  });

  test('Requester has read-only view of Actions Taken', async ({ page }) => {
    // 1. Log in as Requester
    await page.goto('/login');
    await page.fill('input[type="email"]', 'aran@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/(requester\/dashboard|my-tickets)/);

    // Navigate to my-tickets
    await page.goto('/my-tickets');
    await page.waitForSelector('table tbody tr');

    // Click first ticket
    const firstRow = page.locator('table tbody tr').first();
    await firstRow.click();
    await expect(page).toHaveURL(/\/tickets\/\d+/);

    // Verify Actions Taken section is visible
    await expect(page.locator('h2:has-text("Actions Taken")')).toBeVisible();

    // Verify Record Action button is NOT rendered for Requester (AC-03 / BR-05)
    await expect(page.getByTestId('record-action-btn')).not.toBeVisible();
  });
});
