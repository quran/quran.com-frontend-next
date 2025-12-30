/* eslint-disable max-lines, no-await-in-loop, no-restricted-syntax, react-func/max-lines-per-function */

import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';
import { getVerseTestId } from '@/tests/test-ids';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  test.slow();

  homePage = new Homepage(page, context);
});

test.describe('Verse Range URL Redirects', () => {
  const redirectTestCases = [
    // Pattern 1: /:surah/:from\\::to → /:surah/:from-:to
    {
      input: '/1/2:3',
      expected: '/1/2-3',
      verseToCheck: '1:2',
      description: 'surah/verse:verse format',
    },
    {
      input: '/2/10:15',
      expected: '/2/10-15',
      verseToCheck: '2:10',
      description: 'surah/verse:verse with different surah',
    },
    {
      input: '/18/50:60',
      expected: '/18/50-60',
      verseToCheck: '18:50',
      description: 'surah/verse:verse with higher numbers',
    },

    // Pattern 2: /:surah\\::from\\::to → /:surah/:from-:to
    {
      input: '/1:2:3',
      expected: '/1/2-3',
      verseToCheck: '1:2',
      description: 'surah:verse:verse format',
    },
    {
      input: '/2:10:15',
      expected: '/2/10-15',
      verseToCheck: '2:10',
      description: 'surah:verse:verse with different surah',
    },
    {
      input: '/18:50:60',
      expected: '/18/50-60',
      verseToCheck: '18:50',
      description: 'surah:verse:verse with higher numbers',
    },

    // Pattern 3: /:surah-:from\\::to → /:surah/:from-:to
    {
      input: '/1-2:3',
      expected: '/1/2-3',
      verseToCheck: '1:2',
      description: 'surah-verse:verse format',
    },
    {
      input: '/2-10:15',
      expected: '/2/10-15',
      verseToCheck: '2:10',
      description: 'surah-verse:verse with different surah',
    },
    {
      input: '/18-50:60',
      expected: '/18/50-60',
      verseToCheck: '18:50',
      description: 'surah-verse:verse with higher numbers',
    },

    // Pattern 4: /:surah-:from-:to → /:surah/:from-:to
    {
      input: '/1-2-3',
      expected: '/1/2-3',
      verseToCheck: '1:2',
      description: 'surah-verse-verse format',
    },
    {
      input: '/2-10-15',
      expected: '/2/10-15',
      verseToCheck: '2:10',
      description: 'surah-verse-verse with different surah',
    },
    {
      input: '/18-50-60',
      expected: '/18/50-60',
      verseToCheck: '18:50',
      description: 'surah-verse-verse with higher numbers',
    },

    // Pattern 5: /:surah\\::from-:to → /:surah/:from-:to
    {
      input: '/1:2-3',
      expected: '/1/2-3',
      verseToCheck: '1:2',
      description: 'surah:verse-verse format',
    },
    {
      input: '/2:10-15',
      expected: '/2/10-15',
      verseToCheck: '2:10',
      description: 'surah:verse-verse with different surah',
    },
    {
      input: '/18:50-60',
      expected: '/18/50-60',
      verseToCheck: '18:50',
      description: 'surah:verse-verse with higher numbers',
    },

    // Single verse cases (from === to)
    { input: '/1/5:5', expected: '/1/5-5', verseToCheck: '1:5', description: 'single verse range' },
    {
      input: '/2:7:7',
      expected: '/2/7-7',
      verseToCheck: '2:7',
      description: 'single verse range with different surah',
    },
    {
      input: '/18-25-25',
      expected: '/18/25-25',
      verseToCheck: '18:25',
      description: 'single verse range with higher numbers',
    },

    // Multi-digit verse numbers
    {
      input: '/2/100:150',
      expected: '/2/100-150',
      verseToCheck: '2:100',
      description: 'multi-digit verse numbers',
    },
    {
      input: '/36:28:35',
      expected: '/36/28-35',
      verseToCheck: '36:28',
      description: 'multi-digit verse numbers with different surah',
    },
  ];

  redirectTestCases.forEach(({ input, expected, verseToCheck, description }) => {
    test(
      `should redirect ${input} to ${expected} (${description})`,
      { tag: ['@url', '@redirect', '@verse-range'] },
      async ({ page }) => {
        // Navigate to the old URL format
        await homePage.goTo(input);

        // Should be redirected to the new URL format
        await expect(page).toHaveURL(expected);

        // Verify the first verse is displayed (virtualization means only first few are visible)
        await expect(page.getByTestId(getVerseTestId(verseToCheck))).toBeVisible();
      },
    );
  });

  test(
    'should handle complex multi-digit combinations',
    { tag: ['@url', '@redirect', '@verse-range', '@smoke'] },
    async ({ page }) => {
      // Test with a complex example that covers multiple patterns
      const testCases = [
        { input: '/36/21:28', expected: '/36/21-28', verseToCheck: '36:21' },
        { input: '/114:1:6', expected: '/114/1-6', verseToCheck: '114:1' },
        { input: '/67-25:29', expected: '/67/25-29', verseToCheck: '67:25' },
      ];

      for (const { input, expected, verseToCheck } of testCases) {
        await homePage.goTo(input);
        await expect(page).toHaveURL(expected);
        await expect(page.getByTestId(getVerseTestId(verseToCheck))).toBeVisible();
      }
    },
  );
});
