import { expect, test } from '@playwright/test';

test('home page renders with her title and a main landmark', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Bhavini Malhotra · Sales & Operations');
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bhavini Malhotra');
});

test('first Tab lands on the skip link', async ({ page, browserName }) => {
  await page.goto('/');
  // WebKit's Tab skips links unless full keyboard access is on; Option+Tab is the Safari way.
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
});
