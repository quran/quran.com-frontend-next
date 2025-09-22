import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });

  // Hide the nextjs error overlay to be able to click on elements behind it
  await page.addStyleTag({
    content: `
        nextjs-portal {
            display: none;
        }
        `,
  });
});

test('Search history is preserved', async ({ page }) => {
  // 1. Click on the search bar (#searchQuery)
  const searchBar = page.getByTestId('open-search-drawer');
  // click on the search icon (not the search bar because on mobile the searchbar redirects to the search drawer)
  await searchBar.click();
  await page.waitForTimeout(1500); // wait for a bit to ensure the search input is focused
  // fill the current focused element (the search input)
  await page.keyboard.type('juz 30');

  // 2. In the "search-results" div, we should see the "Juz 30" result
  const bodyContainer = page.getByTestId('search-body-container');

  await expect(bodyContainer.getByText('Juz 30')).toBeVisible();

  // 3. Click on the "Juz 30" result and check that we are navigated to /juz/30
  await Promise.all([bodyContainer.getByText('Juz 30').click(), page.waitForURL('/juz/30')]);

  await page.waitForTimeout(1500); // wait for a bit to ensure the navigation is fully done

  // 4. Redirect back to /
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.addStyleTag({
    content: `
        nextjs-portal {
            display: none;
        }
        `,
  });

  // 5. Click on the search bar again and make sure that we see "Juz 30" in the recent navigations
  await searchBar.click();
  await expect(page.getByTestId('search-body-container').getByText('Juz 30')).toBeVisible();
});
