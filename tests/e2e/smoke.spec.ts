import { expect, test } from '@playwright/test';

test('home page renders with her title and a main landmark', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Bhavini Malhotra · Sales & Operations');
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bhavini Malhotra');
});

test('first Tab lands on the skip link', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
});
