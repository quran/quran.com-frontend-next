import { test, expect } from '@playwright/test';

import Homepage from '../../POM/home-page';

import { TestId } from '@/tests/test-ids';

let homepage: Homepage;
const MOCKED_CTA_URL = 'https://example.com/banner-target';

const mockUiSectionBanner = async (page) => {
  await page.route(
    '**/api/proxy/content/api/qdc/ui_sections/navbar_announcement**',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          uiSection: {
            key: 'navbar_announcement',
            url: MOCKED_CTA_URL,
            ctaText: 'Learn more',
            cacheTtlSeconds: 3600,
            metadata: {},
            content: {
              format: 'plain_text',
              value: 'Support Quran.com',
            },
            language: 'en',
          },
        }),
      });
    },
  );
};

test.beforeEach(async ({ page, context }) => {
  await mockUiSectionBanner(page);
  homepage = new Homepage(page, context);
  await homepage.goTo('/');
});

test.describe('Banner Test', () => {
  test('should render dynamic CTA and open its URL in a new tab when user is not logged in', async ({
    page,
    context,
  }) => {
    homepage.closeNextjsErrorDialog();

    const banner = page.locator(`[data-testid="${TestId.BANNER}"]:visible`).first();
    const cta = banner.getByRole('link', { name: 'Learn more' });

    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', MOCKED_CTA_URL);

    const [newPage] = await Promise.all([context.waitForEvent('page'), cta.click({ force: true })]);

    await newPage.waitForLoadState('domcontentloaded');
    expect(newPage.url()).toContain(MOCKED_CTA_URL);
  });
});
