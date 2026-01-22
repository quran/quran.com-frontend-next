import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';
import { TestId } from '@/tests/test-ids';

let homepage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homepage = new Homepage(page, context);
});

test.describe('@quran-in-a-year', () => {
  // TODO: Unskip when QF-2769 is merged (can copy arabic text with spaces)
  test.skip(
    'Home page Quran in a year section copies spaced Arabic text',
    { tag: ['@quran-in-a-year'] },
    async ({ page }) => {
      await homepage.goTo('/');

      const section = page.getByTestId(TestId.QURAN_IN_A_YEAR_SECTION);
      await expect(section).toBeVisible();

      const copiedText = await page.evaluate(async (sectionTestId: string) => {
        const sectionElement = document.querySelector(`[data-testid="${sectionTestId}"]`);
        if (!sectionElement) {
          return null;
        }
        const firstWordElement = sectionElement.querySelector('[data-word-index]');
        if (!firstWordElement || !firstWordElement.parentElement) {
          return null;
        }

        const verseContainer = firstWordElement.parentElement;
        const selection = window.getSelection();
        if (!selection) {
          return null;
        }

        selection.removeAllRanges();
        const range = document.createRange();
        range.selectNodeContents(verseContainer);
        selection.addRange(range);

        if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
          return null;
        }

        const originalWriteText = navigator.clipboard.writeText.bind(navigator.clipboard);
        let capturedText: string | null = null;

        navigator.clipboard.writeText = (text: string) => {
          capturedText = text;
          return Promise.resolve();
        };

        document.execCommand('copy');

        return new Promise<string | null>((resolve) => {
          setTimeout(() => {
            navigator.clipboard.writeText = originalWriteText;
            resolve(capturedText);
          }, 50);
        });
      }, TestId.QURAN_IN_A_YEAR_SECTION);

      expect(copiedText).not.toBeNull();
      // Should contain at least one space between words
      expect(copiedText?.includes(' ')).toBe(true);
    },
  );

  test(
    'Selecting a week should scroll to the top of the page',
    { tag: ['@quran-in-a-year'] },
    async ({ page }) => {
      await homepage.goTo('/calendar');

      // Ensure week button exists and is visible
      const weekButton = page.getByLabel('Week 1 of Shawwal');
      await expect(weekButton).toBeVisible();

      // Scroll to the bottom of the page
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      // Verify we're actually at the bottom
      const scrolledToBottom = await page.evaluate(() => {
        return window.scrollY + window.innerHeight >= document.body.scrollHeight - 100;
      });
      expect(scrolledToBottom).toBe(true);

      // Click on a week button
      await weekButton.click();

      await expect
        .poll(async () => page.evaluate(() => window.scrollY), {
          timeout: 5000,
        })
        .toBeLessThan(100);
    },
  );
});
