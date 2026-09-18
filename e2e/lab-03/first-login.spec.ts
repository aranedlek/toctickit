import { test, expect } from '@playwright/test';

test.describe('First Login Flow (E2E-02)', () => {
  const testUserEmail = `firstlogin_${Date.now()}@toktick.it`;
  const initialPassword = 'InitialPassword123!';
  const newPassword = 'NewPassword123!';

  test('should force password change on first login', async ({ page, request }) => {
    // 1. Create a user via Admin API
    // Login as Admin to get token
    const adminLogin = await request.post('/api/auth/login', {
      data: { email: 'admin@example.com', password: 'Password123!' }
    });
    const { token } = await adminLogin.json();

    // Create the user
    await request.post('/api/users', {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: 'First Login Test',
        email: testUserEmail,
        role: 'REQUESTER',
        initialPassword
      }
    });

    // 2. Perform the test
    await page.goto('/login');
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', initialPassword);
    await page.click('button[type="submit"]');

    // Should be redirected to change password page
    await expect(page).toHaveURL(/\/change-password/);
    await expect(page.locator('text=Change Password')).toBeVisible();

    // Complete password change
    await page.fill('input[id="currentPassword"]', initialPassword);
    await page.fill('input[id="newPassword"]', newPassword);
    await page.fill('input[id="confirmPassword"]', newPassword);
    await page.click('button[type="submit"]');

    // Should see success message or be redirected
    await expect(page).toHaveURL(/\/dashboard|tickets/);
    
    // Logout and try logging in with new password
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', newPassword);
    await page.click('button[type="submit"]');

    // Should login successfully
    await expect(page).toHaveURL(/\/dashboard|tickets/);
  });
});
