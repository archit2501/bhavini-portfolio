import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const viewer = (page: Page) => page.locator('#story-viewer');
const activeFrame = (page: Page) => viewer(page).locator('.frame.active');

async function openHighlight(page: Page, label: string) {
  await page.goto('/');
  await page.getByRole('link', { name: new RegExp(`^Highlight: ${label},`) }).click();
  await expect(viewer(page)).toBeVisible();
}

async function cardBox(page: Page) {
  const box = await viewer(page).locator('.card').boundingBox();
  if (!box) throw new Error('story card is not visible');
  return box;
}

test.describe('desktop viewer', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('a highlight opens its stories at their own URL, with one bar per story', async ({
    page,
  }) => {
    await openHighlight(page, 'F1Jobs');
    await expect(viewer(page)).toHaveAccessibleName('F1Jobs stories');
    await expect(page).toHaveURL(/\/stories\/f1jobs\/$/);
    await expect(page).toHaveTitle('F1Jobs highlights · Bhavini Malhotra');
    await expect(viewer(page).locator('.progress .bar')).toHaveCount(5);
    await expect(activeFrame(page)).toContainText('Sales & Operations Executive');
    await expect(viewer(page).getByRole('button', { name: 'Pause' })).toBeFocused();
    const box = await cardBox(page);
    expect(Math.round(box.height)).toBe(900 - 32);
    expect(Math.abs(box.width / box.height - 9 / 16)).toBeLessThan(0.01);
    // Centred even on the first highlight, where there is no previous preview.
    expect(Math.abs(box.x + box.width / 2 - 640)).toBeLessThanOrEqual(1);
  });

  test('advances on its own after the frame time', async ({ page }) => {
    await openHighlight(page, 'F1Jobs');
    await expect(activeFrame(page)).toContainText('$100K+', { timeout: 8000 });
    await expect(viewer(page).locator('.fill').first()).toHaveCSS(
      'transform',
      'matrix(1, 0, 0, 1, 0, 0)',
    );
  });

  test('taps: left third goes back, the rest goes forward', async ({ page }) => {
    await openHighlight(page, 'F1Jobs');
    const box = await cardBox(page);
    const y = box.y + box.height / 2;
    await page.mouse.click(box.x + box.width * 0.8, y);
    await expect(activeFrame(page)).toContainText('$100K+');
    await page.mouse.click(box.x + box.width * 0.8, y);
    await expect(activeFrame(page)).toContainText('The pipeline');
    await page.mouse.click(box.x + box.width * 0.2, y);
    await expect(activeFrame(page)).toContainText('$100K+');
    await expect(viewer(page).locator('.story-status')).toHaveText('F1Jobs, story 2 of 5');
  });

  test('holding pauses and hides the chrome; releasing resumes', async ({ page }) => {
    await openHighlight(page, 'F1Jobs');
    const box = await cardBox(page);
    await page.mouse.move(box.x + box.width * 0.7, box.y + box.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(450);
    await expect(viewer(page)).toHaveClass(/chrome-hidden/);
    await expect(viewer(page).locator('.pause')).toHaveAttribute('aria-label', 'Play');
    await page.mouse.up();
    await expect(viewer(page)).not.toHaveClass(/chrome-hidden/);
    await expect(viewer(page).locator('.pause')).toHaveAttribute('aria-label', 'Pause');
    // A hold is not a tap: still on the first story.
    await expect(activeFrame(page)).toContainText('Sales & Operations Executive');
  });

  test('keyboard: arrows move, Space pauses, Esc closes and returns focus', async ({ page }) => {
    await openHighlight(page, 'F1Jobs');
    await page.keyboard.press('ArrowRight');
    await expect(activeFrame(page)).toContainText('$100K+');
    await page.keyboard.press('ArrowLeft');
    await expect(activeFrame(page)).toContainText('Sales & Operations Executive');
    await page.keyboard.press('Space');
    await expect(viewer(page).locator('.pause')).toHaveAttribute('aria-label', 'Play');
    const fill = viewer(page).locator('.fill').first();
    const before = await fill.evaluate((el) => getComputedStyle(el).transform);
    await page.waitForTimeout(600);
    expect(await fill.evaluate((el) => getComputedStyle(el).transform)).toBe(before);
    await page.keyboard.press('Escape');
    await expect(viewer(page)).toBeHidden();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('link', { name: /^Highlight: F1Jobs,/ })).toBeFocused();
  });

  test('the last story of a highlight rolls into the next highlight', async ({ page }) => {
    await openHighlight(page, 'F1Jobs');
    for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowRight');
    await expect(activeFrame(page)).toContainText('65%');
    await page.keyboard.press('ArrowRight');
    await expect(viewer(page).locator('.group-label')).toHaveText('Vastra Kala');
    await expect(page).toHaveURL(/\/stories\/vastra-kala\/$/);
    await expect(viewer(page).locator('.progress .bar')).toHaveCount(4);
  });

  test('moving past the very last story closes the viewer', async ({ page }) => {
    await openHighlight(page, 'Contact');
    await page.keyboard.press('ArrowRight');
    await expect(viewer(page)).toBeHidden();
    await expect(page).toHaveURL(/\/$/);
  });

  test('swipes: sideways between highlights, down to close', async ({ page }) => {
    await openHighlight(page, 'F1Jobs');
    const box = await cardBox(page);
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    await page.mouse.move(cx + 100, cy);
    await page.mouse.down();
    await page.mouse.move(cx - 100, cy, { steps: 5 });
    await page.mouse.up();
    await expect(viewer(page).locator('.group-label')).toHaveText('Vastra Kala');
    await expect(viewer(page).locator('.card')).toHaveAttribute('data-transition', 'cube');

    await page.waitForTimeout(400);
    await page.mouse.move(cx - 100, cy);
    await page.mouse.down();
    await page.mouse.move(cx + 100, cy, { steps: 5 });
    await page.mouse.up();
    await expect(viewer(page).locator('.group-label')).toHaveText('F1Jobs');

    await page.waitForTimeout(400);
    await page.mouse.move(cx, cy - 100);
    await page.mouse.down();
    await page.mouse.move(cx, cy + 150, { steps: 5 });
    await page.mouse.up();
    await expect(viewer(page)).toBeHidden();
  });

  test('with reduced motion, highlights crossfade instead of turning', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openHighlight(page, 'F1Jobs');
    await viewer(page).getByRole('button', { name: 'Next highlight: Vastra Kala' }).click();
    await expect(viewer(page).locator('.group-label')).toHaveText('Vastra Kala');
    await expect(viewer(page).locator('.card')).toHaveAttribute('data-transition', 'fade');
  });

  test('neighbour previews and chevrons', async ({ page }) => {
    await openHighlight(page, 'Vastra Kala');
    await expect(
      viewer(page).getByRole('button', { name: 'Previous highlight: F1Jobs' }),
    ).toBeVisible();
    await expect(
      viewer(page).getByRole('button', { name: 'Next highlight: Clinical' }),
    ).toBeVisible();
    await viewer(page).getByRole('button', { name: 'Next story' }).click();
    await expect(activeFrame(page)).toContainText('Content to dispatch');
    await viewer(page).getByRole('button', { name: 'Previous highlight: F1Jobs' }).click();
    await expect(viewer(page).locator('.group-label')).toHaveText('F1Jobs');
  });

  test('browser Back closes the viewer and Forward reopens it', async ({ page }) => {
    await openHighlight(page, 'Clinical');
    await page.goBack();
    await expect(viewer(page)).toBeHidden();
    await expect(page).toHaveURL(/\/$/);
    await page.goForward();
    await expect(viewer(page)).toBeVisible();
    await expect(viewer(page).locator('.group-label')).toHaveText('Clinical');
  });

  test('the open viewer has no serious accessibility issues', async ({ page }) => {
    await openHighlight(page, 'F1Jobs');
    const { violations } = await new AxeBuilder({ page }).include('#story-viewer').analyze();
    const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });
});

test.describe('phone viewer', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('fills the screen, without chevrons or previews', async ({ page }) => {
    await openHighlight(page, 'F1Jobs');
    const box = await cardBox(page);
    expect(Math.round(box.width)).toBe(390);
    expect(Math.round(box.height)).toBe(844);
    await expect(viewer(page).getByRole('button', { name: 'Next story' })).toBeHidden();
    await expect(viewer(page).locator('.peek-next')).toBeHidden();
  });

  test("touches at the left edge are left to iOS's back-swipe", async ({ page }, testInfo) => {
    test.skip(!testInfo.project.use.hasTouch, 'needs a touch screen');
    await openHighlight(page, 'F1Jobs');
    await page.touchscreen.tap(300, 420);
    await expect(activeFrame(page)).toContainText('$100K+');
    await page.touchscreen.tap(8, 420);
    await page.waitForTimeout(300);
    await expect(activeFrame(page)).toContainText('$100K+');
    await page.touchscreen.tap(60, 420);
    await expect(activeFrame(page)).toContainText('Sales & Operations Executive');
  });
});
