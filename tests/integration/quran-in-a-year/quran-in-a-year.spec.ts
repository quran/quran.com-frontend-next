import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';
import { TestId } from '@/tests/test-ids';

let homepage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homepage = new Homepage(page, context);
});

test.describe('@quran-in-a-year', () => {
  test(
    'Home page Quran in a year section copies spaced Arabic text',
    { tag: ['@quran-in-a-year'] },
    async ({ page }) => {
      await homepage.goTo('/');

      const section = page.getByTestId(TestId.QURAN_IN_A_YEAR_SECTION);
      await expect(section).toBeVisible();

      // Wait for the first word element to be loaded and have text content
      const firstWordElement = section.locator('[data-word-index]').first();
      await expect(firstWordElement).toBeVisible();
      await expect(firstWordElement).not.toBeEmpty();

      // Wait a bit for all components to fully render and event handlers to be attached
      await page.waitForTimeout(500);

      const copiedText = await page.evaluate(async (sectionTestId: string) => {
        const sectionElement = document.querySelector(`[data-testid="${sectionTestId}"]`);
        if (!sectionElement) {
          return null;
        }

        // Wait for elements to be ready
        await new Promise((resolve) => {
          setTimeout(() => resolve(undefined), 100);
        });

        const wordElement = sectionElement.querySelector('[data-word-index]');
        if (!wordElement || !wordElement.parentElement) {
          return null;
        }

        const verseContainer = wordElement.parentElement;
        const selection = window.getSelection();
        if (!selection) {
          return null;
        }

        // Clear any existing selection
        selection.removeAllRanges();

        // Wait for DOM to be ready
        await new Promise((resolve) => {
          requestAnimationFrame(() => resolve(undefined));
        });

        const range = document.createRange();
        range.selectNodeContents(verseContainer);
        selection.addRange(range);

        // Verify selection was created successfully
        if (selection.toString().trim() === '') {
          return null;
        }

        // Mock clipboard to capture the copied text
        let capturedText: string | null = null;
        const originalWriteText = navigator.clipboard?.writeText;

        if (navigator.clipboard) {
          navigator.clipboard.writeText = (text: string) => {
            capturedText = text;
            return Promise.resolve();
          };
        }

        // Trigger copy event on the verse container
        const copyEvent = new ClipboardEvent('copy', {
          bubbles: true,
          cancelable: true,
        });

        verseContainer.dispatchEvent(copyEvent);

        // Wait for copy event to be processed
        await new Promise((resolve) => {
          setTimeout(() => resolve(undefined), 200);
        });

        // Restore original clipboard function if it existed
        if (navigator.clipboard && originalWriteText) {
          navigator.clipboard.writeText = originalWriteText;
        }

        return capturedText;
      }, TestId.QURAN_IN_A_YEAR_SECTION);

      expect(copiedText).not.toBeNull();
      expect(typeof copiedText).toBe('string');
      expect(copiedText!.trim().length).toBeGreaterThan(0);
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
