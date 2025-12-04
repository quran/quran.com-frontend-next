import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';
import QuranPage from '@/tests/POM/mushaf-mode';

let homePage: Homepage;
let quranPage: QuranPage;
test.beforeEach(async ({ page, context }) => {
  test.slow();

  homePage = new Homepage(page, context);
  quranPage = new QuranPage(page);
});

test(
  'Basmala is not shown for surahs 1 and 9 in translation mode',
  { tag: ['@fast', '@mushaf', '@basmala'] },
  async ({ page }) => {
    await homePage.goTo('/1');

    await expect(page.getByTestId('bismillah-section')).not.toBeVisible();

    await homePage.goTo('/9');

    await expect(page.getByTestId('bismillah-section')).not.toBeVisible();
  },
);

test(
  'Basmala is shown for other surahs in translation mode',
  { tag: ['@fast', '@mushaf', '@basmala'] },
  async ({ page }) => {
    await homePage.goTo('/2');

    await expect(page.getByTestId('bismillah-section')).toBeVisible();
  },
);

test(
  'Basmala display rules in mushaf mode - shown for every surah except 1 and 9',
  { tag: ['@slow', '@mushaf', '@basmala'] },
  async ({ page, isMobile }) => {
    // Surah 76 - has basmala
    await homePage.goTo('/76');

    // Enable mushaf mode
    await Promise.all([
      quranPage.mushafMode(isMobile),
      page.waitForResponse((response) => response.url().includes('/api/qdc/verses/')),
    ]);

    await expect(page.getByTestId('bismillah-section')).toBeVisible();

    // Surah 1 - no basmala
    await Promise.all([
      homePage.goTo('/1'),
      page.waitForResponse((response) => response.url().includes('/api/qdc/verses/')),
    ]);
    await expect(page.getByTestId('bismillah-section')).not.toBeVisible();

    // Go to Surah 9 - no basmala
    await Promise.all([
      homePage.goTo('/9'),
      page.waitForResponse((response) => response.url().includes('/api/qdc/verses/')),
    ]);
    await expect(page.getByTestId('bismillah-section')).not.toBeVisible();
  },
);
