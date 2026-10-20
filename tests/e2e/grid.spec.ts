import { expect, test, type Locator } from '@playwright/test';

async function box(locator: Locator) {
  const b = await locator.boundingBox();
  if (!b) throw new Error('element is not visible');
  return b;
}

const PINNED = ['revenue-100k', 'face-of-f1jobs', 'workflow-65'];

test('posts tab: 12 tiles, the 3 pinned posts first with a pin badge', async ({ page }) => {
  await page.goto('/');
  const tiles = page.locator('#panel-posts .tile a');
  await expect(tiles).toHaveCount(12);
  for (const [i, slug] of PINNED.entries()) {
    await expect(tiles.nth(i)).toHaveAttribute('href', `/p/${slug}/`);
    await expect(tiles.nth(i)).toHaveAccessibleName(/^Pinned post\./);
    await expect(tiles.nth(i).locator('.badges svg').first()).toBeVisible();
  }
  await expect(tiles.nth(3)).not.toHaveAccessibleName(/Pinned/);
  await expect(tiles.first()).toHaveAccessibleName(
    'Pinned post. Carousel, 2 slides. $100K+ in revenue',
  );
});

for (const [width, gap] of [
  [1280, 4],
  [390, 2],
] as const) {
  test(`${width}px: 3 columns of 3:4 tiles with ${gap}px gaps`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const tiles = page.locator('#panel-posts .tile a');
    const [a, b, c, d] = await Promise.all([0, 1, 2, 3].map((i) => box(tiles.nth(i))));
    expect(Math.round(a.y)).toBe(Math.round(b.y));
    expect(Math.round(b.y)).toBe(Math.round(c.y));
    expect(d.y).toBeGreaterThan(a.y);
    expect(Math.abs(a.height / a.width - 4 / 3)).toBeLessThan(0.02);
    expect(Math.round(b.x - (a.x + a.width))).toBe(gap);
  });
}

test('tabs follow the ARIA tabs pattern and switch in place', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  const tablist = page.getByRole('tablist', { name: 'Profile sections' });
  const posts = tablist.getByRole('tab', { name: 'Posts' });
  const reels = tablist.getByRole('tab', { name: 'Reels' });
  await expect(posts).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel', { name: 'Posts' })).toBeVisible();
  await expect(page.locator('#panel-reels')).toBeHidden();

  await posts.focus();
  await page.keyboard.press('ArrowRight');
  await expect(reels).toBeFocused();
  await expect(reels).toHaveAttribute('aria-selected', 'true');
  await expect(page).toHaveURL(/\/reels\/$/);
  await expect(page).toHaveTitle('Reels · Bhavini Malhotra');
  await expect(page.locator('#panel-reels')).toBeVisible();
  await expect(page.locator('#panel-posts')).toBeHidden();
  await expect(
    page.locator('nav.side-nav').getByRole('link', { name: 'Reels', exact: true }),
  ).toHaveAttribute('aria-current', 'page');

  await page.goBack();
  await expect(posts).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#panel-posts')).toBeVisible();
});

test('/reels/ opens with the Reels tab selected', async ({ page }) => {
  await page.goto('/reels/');
  await expect(page.getByRole('tab', { name: 'Reels' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#panel-reels .reel')).toHaveCount(3);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bhavini Malhotra');
});

test('on a phone, a tile opens its post page with the caption', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('#panel-posts .tile a').nth(4).click();
  await expect(page).toHaveURL(/\/p\/vastra-kala-export\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Content to dispatch, 5+ regions',
  );
  await expect(page.locator('.post-view .caption')).toContainText('across 5+ global regions');
  await expect(page.locator('.comment .meta').first()).toHaveText('Vastra Kala');
  await expect(page.locator('.post-view .date')).toHaveText('August 2025');
});
