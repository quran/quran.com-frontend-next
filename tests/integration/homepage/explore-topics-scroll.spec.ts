import { test, expect, Page, Locator } from '@playwright/test';

async function setupMobileHome(page: Page, localePath: string): Promise<void> {
  // Use a narrower viewport to force overflow when possible
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto(localePath);
}

async function getExploreContainer(page: Page): Promise<Locator> {
  // Find the container by looking for a known topic link, then walk up to find scrollable parent
  const link = page.locator('a[href*="/about-the-quran"]').first();
  await link.waitFor({ state: 'visible' });

  // Walk up to find the scrollable container
  await link.evaluate((node) => {
    let current = node as HTMLElement | null;
    let found = false;
    while (current && current !== document.body) {
      const style = window.getComputedStyle(current);
      const isScrollableX =
        (style.overflowX === 'auto' || style.overflowX === 'scroll') &&
        current.scrollWidth > current.clientWidth;
      if (isScrollableX) {
        current.setAttribute('data-test-scrollable', 'topics');
        found = true;
        break;
      }
      current = current.parentElement;
    }
    if (!found) {
      throw new Error('No horizontally scrollable container found');
    }
  });

  const container = page.locator('[data-test-scrollable="topics"]').first();
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
      const metrics = await getMetrics(container);

      expect(metrics.clientWidth).toBeGreaterThan(0);
      expect(metrics.scrollWidth).toBeGreaterThan(metrics.clientWidth);
      expect(['scroll', 'auto']).toContain(metrics.overflowX);
      expect(['hidden', 'clip', 'visible']).toContain(metrics.overflowY);

      // Test horizontal scrolling (handles both LTR and RTL automatically)
      await scrollByAndWait(container, metrics.scrollLeft);
    });
  });
});
