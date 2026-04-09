import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the app title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Flight Tracker Spain' })).toBeVisible();
  });

  test('should display airport selector', async ({ page }) => {
    await expect(page.getByLabel('Select Airport')).toBeVisible();
  });

  test('should display flight type toggle', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Departures' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Arrivals' })).toBeVisible();
  });

  test('should display search input', async ({ page }) => {
    await expect(page.getByPlaceholder(/Search flight/i)).toBeVisible();
  });
});

test.describe('Airport Selector', () => {
  test('should open airport dropdown when clicked', async ({ page }) => {
    await page.getByLabel('Select Airport').click();
    await expect(page.getByRole('listbox')).toBeVisible();
  });

  test('should filter airports when typing', async ({ page }) => {
    await page.getByLabel('Select Airport').click();
    await page.getByLabel('Search airports').fill('Madrid');
    await expect(page.getByText('Adolfo Suárez Madrid-Barajas')).toBeVisible();
  });

  test('should select airport and close dropdown', async ({ page }) => {
    await page.getByLabel('Select Airport').click();
    await page.getByLabel('Search airports').fill('Barcelona');
    await page.getByText('Barcelona').closest('button')?.click();
    await expect(page.getByText('BCN')).toBeVisible();
  });
});

test.describe('Flight Type Toggle', () => {
  test('should switch to departures by default', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Departures' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('should switch to arrivals when clicked', async ({ page }) => {
    await page.getByRole('button', { name: 'Arrivals' }).click();
    await expect(page.getByRole('button', { name: 'Arrivals' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('Arrivals')).toBeVisible();
  });
});

test.describe('Flight Search', () => {
  test('should have search input', async ({ page }) => {
    await expect(page.getByPlaceholder(/Search flight/i)).toBeVisible();
  });

  test('should convert input to uppercase', async ({ page }) => {
    const input = page.getByPlaceholder(/Search flight/i);
    await input.fill('ibe1234');
    await expect(input).toHaveValue('IBE1234');
  });
});

test.describe('Delay Information', () => {
  test('should display delay information section', async ({ page }) => {
    await expect(page.getByText('About Delay Predictions')).toBeVisible();
  });

  test('should show risk level indicators', async ({ page }) => {
    await expect(page.getByText('Low Risk')).toBeVisible();
    await expect(page.getByText('Medium Risk')).toBeVisible();
    await expect(page.getByText('High Risk')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have skip links or proper heading structure', async ({ page }) => {
    const h1 = await page.locator('h1').first();
    await expect(h1).toHaveText('Flight Tracker Spain');
  });

  test('should have proper aria labels on interactive elements', async ({ page }) => {
    await expect(page.getByLabel('Select Airport')).toBeVisible();
    await expect(page.getByLabel('Search airports')).toBeVisible();
    await expect(page.getByLabel('Refresh flights')).toBeVisible();
  });
});
