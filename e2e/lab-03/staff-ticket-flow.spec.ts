import { test, expect } from '@playwright/test';

test.describe('Staff Ticket Flow (E2E-03)', () => {
  const uniqueTicketTitle = `E2E Ticket ${Date.now()}`;

  test('staff can view and update ticket', async ({ page }) => {
    // 1. Login as requester and create a ticket
    await page.goto('/login');
    await page.fill('input[type="email"]', 'aran@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/my-tickets/);
    
    // Create new ticket
    await page.click('a:has-text("New Ticket"), button:has-text("New Ticket")');
    await page.getByPlaceholder('Brief description of the issue').fill(uniqueTicketTitle);
    await page.getByPlaceholder('Please describe the issue in detail').fill('Test description');
    // Select first category
    await page.locator('select').first().selectOption({ index: 1 });
    await page.click('button[type="submit"]');

    // Wait for creation
    await expect(page.locator(`text=${uniqueTicketTitle}`)).toBeVisible();
    
    // Logout
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);

    // 2. Login as staff
    await page.fill('input[type="email"]', 'it1@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Go to queue
    await expect(page).toHaveURL(/\/staff\/tickets/);
    
    // Find the ticket in the queue
    await page.fill('input[placeholder*="Search"]', uniqueTicketTitle);
    const ticketRow = page.locator(`tr`, { hasText: uniqueTicketTitle });
    await expect(ticketRow).toBeVisible();

    // Click on the ticket
    await ticketRow.click();
    await expect(page).toHaveURL(/\/tickets\/\d+/);

    // Update status
    await page.locator('label:has-text("Status") + select').selectOption({ value: 'IN_PROGRESS' });
    
    // Update IT Priority
    await page.locator('label:has-text("IT Priority") + select').selectOption({ value: 'HIGH' });
    
    // Save operations
    await page.click('button:has-text("Update Ticket")');

    // Add an internal note
    await page.click('button:has-text("Internal Note")');
    await page.fill('textarea[placeholder*="internal note"]', 'Investigating this issue now.');
    await page.click('button:has-text("Save Note")');
    
    // Verify note is added
    await expect(page.locator('text=Investigating this issue now.')).toBeVisible();

    // Verify status was updated on screen (and persisted in DB)
    await page.reload();
    await expect(page.locator('label:has-text("Status") + select')).toHaveValue('IN_PROGRESS');
    await expect(page.locator('label:has-text("IT Priority") + select')).toHaveValue('HIGH');
  });
});
