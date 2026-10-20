import { expect, test, type Page } from '@playwright/test';

const viewer = (page: Page) => page.locator('#story-viewer');
const GROUPS = [
  { open: /^View Bhavini Malhotra's intro story/, frames: 5 },
  { open: /^Highlight: F1Jobs,/, frames: 5 },
  { open: /^Highlight: Vastra Kala,/, frames: 4 },
  { open: /^Highlight: Clinical,/, frames: 4 },
  { open: /^Highlight: Volunteer,/, frames: 3 },
  { open: /^Highlight: Christ U,/, frames: 4 },
  { open: /^Highlight: Certs,/, frames: 2 },
  { open: /^Highlight: Contact,/, frames: 1 },
];

test('the avatar ring opens the intro story, which is not in the highlights row', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('region', { name: 'Highlights' }).getByRole('link')).toHaveCount(7);
  await page.getByRole('link', { name: "View Bhavini Malhotra's intro story, 5 stories" }).click();
  await expect(viewer(page)).toHaveAccessibleName('Intro stories');
  await expect(page).toHaveURL(/\/stories\/intro\/$/);
  await expect(viewer(page).locator('.frame.active')).toContainText("Hi, I'm Bhavini");
});

test('after the intro is seen, the ring turns grey and stays grey', async ({ page }) => {
  await page.goto('/');
  const ring = page.locator('.avatar-link .avatar').first();
  await expect(ring).not.toHaveClass(/seen/);
  await page.locator('a.avatar-link').click();
  await page.keyboard.press('Escape');
  await expect(ring).toHaveClass(/seen/);
  // Closing goes back to "/" asynchronously; reload only once it has.
  await expect(page).toHaveURL(/\/$/);
  await page.reload();
  await expect(ring).toHaveClass(/seen/);
});

test.describe('on a 390px phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('every story frame fits on screen without zooming or scrolling', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/');
    for (const group of GROUPS) {
      await page.getByRole('link', { name: group.open }).click();
      await expect(viewer(page)).toBeVisible();
      await expect(viewer(page).locator('.progress .bar')).toHaveCount(group.frames);
      for (let i = 0; i < group.frames; i++) {
        const frame = viewer(page).locator('.frame.active');
        await expect(frame).toHaveAttribute('aria-label', `${i + 1} of ${group.frames}`);
        const fit = await frame.evaluate((el) => {
          const content = el.querySelector('.text-frame') ?? el;
          const card = el.closest('.card')!.getBoundingClientRect();
          const box = content.getBoundingClientRect();
          return {
            vertical: content.scrollHeight <= content.clientHeight + 1,
            horizontal: content.scrollWidth <= content.clientWidth + 1,
            inside: box.left >= card.left - 1 && box.right <= card.right + 1,
            fontSize: parseFloat(getComputedStyle(el.querySelector('.frame-body') ?? el).fontSize),
          };
        });
        expect(fit, `${group.open} frame ${i + 1}`).toEqual({
          vertical: true,
          horizontal: true,
          inside: true,
          fontSize: expect.any(Number),
        });
        expect(fit.fontSize).toBeGreaterThanOrEqual(16);
        if (i < group.frames - 1) await page.keyboard.press('ArrowRight');
      }
      await page.keyboard.press('Escape');
      await expect(viewer(page)).toBeHidden();
    }
  });
});

test('the Clinical stories never show a photo', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /^Highlight: Clinical,/ }).click();
  await expect(viewer(page).locator('.frame')).toHaveCount(4);
  await expect(viewer(page).locator('.frame img')).toHaveCount(0);
});

test('text stories rotate through the three colour fields', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /^Highlight: F1Jobs,/ }).click();
  const frames = viewer(page).locator('.frame');
  await expect(frames.nth(0)).toHaveClass(/tone-1/);
  await expect(frames.nth(1)).toHaveClass(/tone-2/);
  await expect(frames.nth(2)).toHaveClass(/tone-3/);
  await expect(frames.nth(3)).toHaveClass(/tone-1/);
});

test('without JavaScript, the avatar ring links to the intro page', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://localhost:4417/');
  await page.locator('a.avatar-link').click();
  await expect(page).toHaveURL(/\/stories\/intro\/$/);
  await expect(page.locator('.frame')).toHaveCount(5);
  await context.close();
});
