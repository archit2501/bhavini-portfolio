import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator } from '@playwright/test';

async function box(locator: Locator) {
  const b = await locator.boundingBox();
  if (!b) throw new Error('element is not visible');
  return b;
}

test.describe('desktop pop-up', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('a tile opens the post beside its details, at the post URL', async ({ page }) => {
    await page.goto('/');
    await page.locator('#panel-posts a[data-post="revenue-100k"]').click();
    const dialog = page.getByRole('dialog', { name: '$100K+ in revenue' });
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(/\/p\/revenue-100k\/$/);
    await expect(page).toHaveTitle('$100K+ in revenue · Bhavini Malhotra');
    const media = await box(dialog.locator('.media'));
    const head = await box(dialog.locator('.head'));
    expect(head.x).toBeGreaterThanOrEqual(media.x + media.width - 1);
    expect(head.width).toBeGreaterThanOrEqual(335);
    await expect(dialog.locator('.caption')).toContainText('$100K+ in revenue through 7+ sales');
  });

  test('arrow keys move between posts without adding history', async ({ page }) => {
    await page.goto('/');
    await page.locator('#panel-posts a[data-post="revenue-100k"]').click();
    const dialog = page.locator('#post-modal');
    await expect(dialog.locator('.post-prev')).toBeHidden();
    await page.keyboard.press('ArrowRight');
    await expect(page).toHaveURL(/\/p\/face-of-f1jobs\/$/);
    await expect(dialog).toHaveAccessibleName('The face of F1Jobs.io');
    await page.keyboard.press('ArrowLeft');
    await expect(page).toHaveURL(/\/p\/revenue-100k\/$/);
    await dialog.locator('.post-next').click();
    await expect(page).toHaveURL(/\/p\/face-of-f1jobs\/$/);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/\/$/);
    await expect(page).toHaveTitle('Bhavini Malhotra · Sales & Operations');
    await expect(page.locator('#panel-posts a[data-post="face-of-f1jobs"]')).toBeFocused();
  });

  test('the last post has no next button', async ({ page }) => {
    await page.goto('/');
    await page.locator('#panel-posts a[data-post="nptel-training-of-trainers"]').click();
    await expect(page.locator('#post-modal .post-next')).toBeHidden();
    await expect(page.locator('#post-modal .post-prev')).toBeVisible();
  });

  test('browser Back and the close button both close it', async ({ page }) => {
    await page.goto('/');
    await page.locator('#panel-posts a[data-post="workflow-65"]').click();
    await expect(page.locator('#post-modal')).toBeVisible();
    await page.goBack();
    await expect(page.locator('#post-modal')).toBeHidden();
    await expect(page).toHaveURL(/\/$/);

    await page.goForward();
    await expect(page.locator('#post-modal')).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.locator('#post-modal')).toBeHidden();
    await expect(page).toHaveURL(/\/$/);
  });

  test('carousel: next slide, dots and an announcement', async ({ page }) => {
    await page.goto('/');
    await page.locator('#panel-posts a[data-post="revenue-100k"]').click();
    const view = page.locator('#post-modal .post-view');
    await expect(view.locator('.slide-nav.prev')).toBeHidden();
    await view.getByRole('button', { name: 'Next slide' }).click();
    await expect(view.locator('.slide-status')).toHaveText('Slide 2 of 2');
    await expect(view.locator('.dots span').nth(1)).toHaveClass(/on/);
    await expect(view.getByRole('button', { name: 'Next slide' })).toBeHidden();
    await expect(view.getByRole('button', { name: 'Previous slide' })).toBeVisible();
  });

  test('double-click likes the post with the heart burst', async ({ page }) => {
    await page.goto('/');
    await page.locator('#panel-posts a[data-post="workflow-65"]').click();
    const view = page.locator('#post-modal .post-view');
    await view.locator('.media').dblclick();
    await expect(view.getByRole('button', { name: 'Like' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(view.locator('.burst')).toHaveClass(/play/);
    await view.getByRole('button', { name: 'Like' }).click();
    await expect(view.getByRole('button', { name: 'Like' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  test('with reduced motion, a double-click likes without the animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.locator('#panel-posts a[data-post="workflow-65"]').click();
    const view = page.locator('#post-modal .post-view');
    await view.locator('.media').dblclick();
    await expect(view.getByRole('button', { name: 'Like' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(view.locator('.burst')).not.toHaveClass(/play/);
  });

  test('copy link puts the post URL on the clipboard', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');
    await page.locator('#panel-posts a[data-post="lead-pipeline"]').click();
    await page.getByRole('button', { name: 'Copy link to this post' }).click();
    await expect(page.locator('#post-modal .actions .status')).toHaveText('Link copied');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      'http://localhost:4417/p/lead-pipeline/',
    );
  });

  test('the open pop-up has no serious accessibility issues', async ({ page }) => {
    await page.goto('/');
    await page.locator('#panel-posts a[data-post="revenue-100k"]').click();
    await expect(page.locator('#post-modal')).toBeVisible();
    const { violations } = await new AxeBuilder({ page }).include('#post-modal').analyze();
    const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });
});

test.describe('phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('a tile opens the full post page, not a pop-up', async ({ page }) => {
    await page.goto('/');
    await page.locator('#panel-posts a[data-post="workflow-65"]').click();
    await expect(page).toHaveURL(/\/p\/workflow-65\/$/);
    await expect(page.locator('#post-modal')).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('65% faster workflows');
    const head = await box(page.locator('.post-view .head'));
    const media = await box(page.locator('.post-view .media'));
    expect(media.y).toBeGreaterThan(head.y);
  });
});

test('each post page has its own share card', async ({ page, request }) => {
  await page.goto('/p/workflow-65/');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    'content',
    '65% faster workflows · Bhavini Malhotra',
  );
  const image = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(image).toMatch(/\/og\/p\/workflow-65\.png$/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    'content',
    'summary_large_image',
  );

  const png = await request.get('/og/p/workflow-65.png');
  expect(png.status()).toBe(200);
  expect(png.headers()['content-type']).toBe('image/png');
  const bytes = await png.body();
  expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)]).toEqual([1200, 630]);
});
