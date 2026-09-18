import { test, expect } from '@playwright/test';

test.describe('User Administration Flow (E2E-04)', () => {
  const testEmail = `newadminuser_${Date.now()}@toktick.it`;

  test('admin can create a user and update their role', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Go to User Management
    await page.getByRole('link', { name: 'User Management' }).click();
    await expect(page).toHaveURL(/\/admin\/users/);

    // Click Add User
    await page.click('button:has-text("+ Add New User")');
    
    // Fill out the form
    await page.locator('input[required]').first().fill('New Admin User');
    await page.locator('input[type="email"]').fill(testEmail);
    await page.locator('select').nth(1).selectOption('REQUESTER');
    await page.locator('input[placeholder="TempPassword123!"]').fill('Password123!');
    // Save
    await page.click('button:has-text("Save User")');
    await expect(page.locator('text=Create New User')).toBeHidden();

    // Wait for the modal to close and table to refresh
    await expect(page.locator('button:has-text("+ Add New User")')).toBeVisible();

    // Verify user appears in the list
    await page.fill('input[placeholder*="Search"]', testEmail);
    const userRow = page.locator(`tr`, { hasText: testEmail });
    await expect(userRow).toBeVisible();

    // Edit the user's role to IT_STAFF
    await userRow.locator('button[title="Edit User"], button:has-text("Edit")').click();
    
    await expect(page.locator('select').nth(1)).toBeVisible();
    await page.locator('select').nth(1).selectOption('IT_STAFF');
    await page.click('button:has-text("Save User")');
    await expect(page.locator('text=Create New User')).toBeHidden();

    // Verify role was updated in the table
    // The role column should say IT STAFF
    await expect(userRow).toContainText('IT STAFF');
  });
});
