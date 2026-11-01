import { test, expect } from '@playwright/test';

test.describe('Role-Based Dashboards (E2E-03 / E2E-04 / UI-04 / UI-05)', () => {
  test('IT Staff Dashboard displays metrics and drill-down links (E2E-03)', async ({ page }) => {
    // 1. Log in as IT Staff
    await page.goto('/login');
    await page.fill('input[type="email"]', 'it1@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Go to staff dashboard
    await page.goto('/staff/dashboard');
    await expect(page).toHaveURL(/\/staff\/dashboard/);

    // Verify greeting and metric grid
    await expect(page.locator('h1')).toContainText('Welcome');
    await expect(page.getByTestId('metric-cards-grid')).toBeVisible();

    // Verify the 5 operational metric cards
    await expect(page.getByTestId('metric-card-unassigned')).toBeVisible();
    await expect(page.getByTestId('metric-card-open')).toBeVisible();
    await expect(page.getByTestId('metric-card-in-progress')).toBeVisible();
    await expect(page.getByTestId('metric-card-waiting')).toBeVisible();
    await expect(page.getByTestId('metric-card-assigned-to-me')).toBeVisible();

    // Test drill-down link for Unassigned
    await page.click('[data-testid="drilldown-unassigned"]');
    await expect(page).toHaveURL(/\/staff\/tickets\?assigned=unassigned/);
  });

  test('Requester Dashboard displays personalized metrics and quick actions (E2E-04)', async ({ page }) => {
    // 1. Log in as Requester
    await page.goto('/login');
    await page.fill('input[type="email"]', 'aran@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Go to requester dashboard
    await page.goto('/requester/dashboard');
    await expect(page).toHaveURL(/\/requester\/dashboard/);

    // Verify personalized greeting and metric grid
    await expect(page.locator('h1')).toContainText('Welcome');
    await expect(page.getByTestId('requester-metric-cards-grid')).toBeVisible();

    // Verify metric cards
    await expect(page.getByTestId('metric-card-my-open')).toBeVisible();
    await expect(page.getByTestId('metric-card-in-progress')).toBeVisible();
    await expect(page.getByTestId('metric-card-waiting-on-me')).toBeVisible();
    await expect(page.getByTestId('metric-card-resolved')).toBeVisible();

    // Test drill-down link
    await page.click('[data-testid="drilldown-my-open"]');
    await expect(page).toHaveURL(/\/my-tickets/);
  });
});
