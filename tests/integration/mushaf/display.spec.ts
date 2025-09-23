import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, isMobile }) => {
  await page.goto('/page/3', { waitUntil: 'networkidle' });

  // Click on the reading button to switch to the mushaf view
  if (isMobile) {
    // scroll down a little to make the tab visible (bypassing a render issue)
    // FIXME: Remove this workaround when the underlying issue is fixed
    await page.keyboard.press('ArrowDown', { delay: 100 });
    await page.keyboard.press('ArrowDown', { delay: 100 });
    await page.keyboard.press('ArrowDown', { delay: 100 });
    await page.keyboard.press('ArrowUp', { delay: 100 });

    await page.locator('#reading-tab').click();
  } else {
    await page.getByTestId('reading-button').click();
  }
});

test("the Qur'an text is displayed in 15 lines", async ({ page }) => {
  const pageContainer = page.locator('#page-3');
  await expect(pageContainer).toBeVisible();

  // Verify it has 15 lines that all start with an id `Page3-LineN`
  for (let i = 1; i <= 15; i += 1) {
    const line = pageContainer.locator(`#Page3-Line${i}`);
    // eslint-disable-next-line no-await-in-loop
    await expect(line).toBeVisible();
  }
});

test('selected mushaf view persists', async ({ page, isMobile }) => {
  await page.waitForTimeout(1500); // wait for a bit to ensure the navigation is fully done

  // refresh the page
  await page.reload({ waitUntil: 'networkidle' });

  // Verify we are still in the mushaf view
  if (isMobile) {
    // FIXME: Remove this workaround when the underlying issue is fixed
    await page.keyboard.press('ArrowDown', { delay: 100 });
    await page.keyboard.press('ArrowDown', { delay: 100 });
    await page.keyboard.press('ArrowDown', { delay: 100 });
    await page.keyboard.press('ArrowUp', { delay: 100 });

    await expect(page.locator('#reading-tab')).toHaveAttribute('data-is-selected', 'true');
  } else {
    await expect(page.getByTestId('reading-button')).toHaveAttribute('data-is-selected', 'true');
  }
});
