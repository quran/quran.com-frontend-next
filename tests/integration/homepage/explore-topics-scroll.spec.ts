/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { test, expect, Page, Locator } from '@playwright/test';

const VIEWPORT_HEIGHT = 844;
const VIEWPORT_WIDTHS = [320, 280, 240, 200];

async function setupMobileHome(page: Page, localePath: string): Promise<void> {
  await page.setViewportSize({ width: VIEWPORT_WIDTHS[0], height: VIEWPORT_HEIGHT });
  await page.goto(localePath, { waitUntil: 'networkidle' });
}

async function getExploreContainer(page: Page): Promise<Locator> {
  const container = page.getByTestId('explore-topics-container');
  await expect(container).toBeVisible();
  await container.scrollIntoViewIfNeeded();
  return container;
}

interface OverflowMetrics {
  scrollWidth: number;
  clientWidth: number;
  overflowX: string;
  overflowY: string;
  scrollLeft: number;
}

async function getMetrics(container: Locator): Promise<OverflowMetrics> {
  return container.evaluate((el) => {
    const style = window.getComputedStyle(el as HTMLElement);
    return {
      scrollWidth: (el as HTMLElement).scrollWidth,
      clientWidth: (el as HTMLElement).clientWidth,
      overflowX: style.overflowX,
      overflowY: style.overflowY,
      scrollLeft: (el as HTMLElement).scrollLeft,
    } as OverflowMetrics;
  });
}

async function ensureScrollableMetrics(
  page: Page,
  container: Locator,
): Promise<OverflowMetrics | null> {
  for (const width of VIEWPORT_WIDTHS) {
    await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
    await container.scrollIntoViewIfNeeded();
    await page.waitForTimeout(50);
    const metrics = await getMetrics(container);
    if (metrics.scrollWidth > metrics.clientWidth) {
      return metrics;
    }
  }
  return null;
}

/**
 * Scrolls horizontally and waits for scroll position change.
 * Tries forward scroll (+200px) first, then falls back to reverse scroll (-200px)
 * if no change is detected. This handles both LTR and RTL layouts robustly.
 */
async function scrollByAndWait(container: Locator, initialLeft: number): Promise<void> {
  // Try forward scroll first
  await container.evaluate((node) => {
    const element = node as HTMLElement;
    element.scrollBy({ left: 200, top: 0, behavior: 'auto' });
  });

  try {
    await expect
      .poll(
        async () => {
          const after = await container.evaluate((el) => (el as HTMLElement).scrollLeft);
          return Math.abs(after - initialLeft);
        },
        { timeout: 2000 },
      )
      .toBeGreaterThan(0);
  } catch (e) {
    // Fallback to reverse scroll if forward didn't work
    await container.evaluate((node) => {
      const element = node as HTMLElement;
      element.scrollBy({ left: -200, top: 0, behavior: 'auto' });
    });

    await expect
      .poll(
        async () => {
          const after = await container.evaluate((el) => (el as HTMLElement).scrollLeft);
          return Math.abs(after - initialLeft);
        },
        { timeout: 2000 },
      )
      .toBeGreaterThan(0);
  }
}

test.describe('ExploreTopicsSection - horizontal scroll', () => {
  const locales = ['/', '/ar', '/ur', '/fa'];
  locales.forEach((localePath) => {
    test(`scrolls horizontally in locale: ${localePath}`, async ({ page }) => {
      await setupMobileHome(page, localePath);
      const container = await getExploreContainer(page);
      const metrics = await ensureScrollableMetrics(page, container);
      if (!metrics) {
        test.skip(true, `Locale ${localePath} content fits within smallest viewport tested.`);
        return;
      }

      expect(metrics.clientWidth).toBeGreaterThan(0);
      expect(metrics.scrollWidth).toBeGreaterThan(metrics.clientWidth);
      expect(['scroll', 'auto']).toContain(metrics.overflowX);
      expect(['hidden', 'clip', 'visible']).toContain(metrics.overflowY);

      // Test horizontal scrolling (handles both LTR and RTL automatically)
      await scrollByAndWait(container, metrics.scrollLeft);
    });
  });
});
