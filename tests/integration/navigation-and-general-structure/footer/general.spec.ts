import { expect, test } from '@playwright/test';

import footerLinks from '@/tests/mocks/footer';
import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homePage = new Homepage(page, context);
  await homePage.goTo('/');
});

test('Copyright year is current', { tag: ['@fast', '@footer'] }, async ({ page }) => {
  const footer = page.locator('footer');
  const currentYear = new Date().getFullYear().toString();
  await expect(footer).toContainText(`© ${currentYear} Quran.com`);
});

test(
  'Functional navigation links and legal links in the footer',
  { tag: ['@fast', '@footer'] },
  async ({ page }) => {
    // Check that the links in the footer are working
    const footer = page.locator('footer');

    const allLinks = footer.locator('a');

    await Promise.all(
      (
        await allLinks.all()
      ).map(async (link) => {
        const text = (await link.textContent())?.trim() || '';
        const href = (await link.getAttribute('href')) || '';
        const target = (await link.getAttribute('target')) || '';

        const expectedLink = footerLinks.find((l) => l.text === text);

        if (expectedLink) {
          // I did not put the links to the app stores in the footerLinks mock because they may change
          if (expectedLink.href) {
            expect(href, `Link with text "${text}" should have href "${expectedLink?.href}"`).toBe(
              expectedLink.href,
            );
          }
          expect(
            target,
            `Link with text "${text}" should have target "${expectedLink?.target}"`,
          ).toBe(expectedLink.target);
        }
      }),
    );
  },
);

test(
  'Android and iOS app links are correct (the links should open the application store pages)',
  { tag: ['@slow', '@footer'] },
  async ({ page, isMobile }) => {
    test.skip(
      isMobile,
      'This test is skipped on mobile due to a playwright bug when opening a playstore link.',
    );

    const footer = page.locator('footer');
    const androidLink = await footer
      .getByRole('link', { name: 'Quran For Android' })
      .getAttribute('href');
    const iosLink = await footer.getByRole('link', { name: 'Quran iOS' }).getAttribute('href');

    await page.goto(androidLink || '');
    await expect(page.getByText('Quran for Android').first()).toBeVisible();

    await page.goto(iosLink || '');
    await expect(page.getByText('Quran - by Quran.com').first()).toBeVisible();
  },
);
