import { expect, test } from '@playwright/test';

const LABELS = ['F1Jobs', 'Vastra Kala', 'Clinical', 'Volunteer', 'Christ U', 'Certs', 'Contact'];

test('seven highlights in order, each linking to its stories', async ({ page }) => {
  await page.goto('/');
  const links = page.getByRole('region', { name: 'Highlights' }).getByRole('link');
  await expect(links).toHaveCount(7);
  await expect(links.locator('.label')).toHaveText(LABELS);
  await expect(links.first()).toHaveAccessibleName('Highlight: F1Jobs, 5 stories');
  await expect(links.first()).toHaveAttribute('href', '/stories/f1jobs/');
});

test.describe('desktop', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('77px circles with a neutral 1px ring', async ({ page }) => {
    await page.goto('/');
    const first = page.locator('.highlight').first();
    await expect(first.locator('.cover')).toHaveCSS('width', '77px');
    await expect(first.locator('.ring')).toHaveCSS('border-top-width', '1px');
    await expect(first.locator('.ring')).not.toHaveCSS('background-image', /gradient/);
  });
});

test.describe('phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('64px circles in a row that scrolls sideways with snapping', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.highlight .cover').first()).toHaveCSS('width', '64px');
    const row = page.locator('.highlights ul');
    await expect(row).toHaveCSS('scroll-snap-type', /^x( proximity)?$/);
    const { scrollWidth, clientWidth } = await row.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }));
    expect(scrollWidth).toBeGreaterThan(clientWidth);
  });
});

test('keyboard focus is visible on a highlight', async ({ page }) => {
  await page.goto('/');
  const first = page.locator('.highlight').first();
  await first.focus();
  await expect(first).toBeFocused();
  await expect(first).toHaveCSS('outline-style', 'solid');
});

test('without JavaScript, a highlight opens its stories page', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://localhost:4417/');
  await page.getByRole('link', { name: /Highlight: Clinical/ }).click();
  await expect(page).toHaveURL(/\/stories\/clinical\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Clinical');
  await expect(page.locator('.frame')).toHaveCount(4);
  await expect(page.locator('.frame img')).toHaveCount(0);
  await context.close();
});
