import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homepage: Homepage;

test.beforeEach(async ({ page, context }) => {
  homepage = new Homepage(page, context);
  await homepage.goTo('/75');
});

test(
  'Clicking tafsir bottom action button opens the tafsir modal',
  { tag: ['@tafsir', '@smoke'] },
  async ({ page }) => {
    const firstVerse = page.getByTestId('verse-75:1');
    const tafsirTabButton = firstVerse.getByTestId('bottom-action-tab-tafsir');

    const tafsirModal = page.getByTestId('modal-content');

    await expect(tafsirModal).toBeHidden();
    await expect(tafsirTabButton).toBeVisible();

    await tafsirTabButton.click();

    await expect(tafsirModal).toBeVisible();

    // Quick check that it is the right content
    await expect(tafsirModal.getByText('The Oath about the Final Return')).toBeVisible();
  },
);

test(
  'Changing the selected tafsir updates the tafsir content',
  { tag: ['@tafsir'] },
  async ({ page }) => {
    const firstVerse = page.getByTestId('verse-75:1');
    const tafsirTabButton = firstVerse.getByTestId('bottom-action-tab-tafsir');

    const tafsirModal = page.getByTestId('modal-content');

    await tafsirTabButton.click();
    await expect(tafsirModal).toBeVisible();

    // Check that the default tafsir is selected
    const ibnKathirButton = page.getByTestId('tafsir-selection-en-tafisr-ibn-kathir');
    await expect(ibnKathirButton).toHaveAttribute('data-selected', 'true');

    // Select a different tafsir
    const maarifAlQuranButton = tafsirModal.getByTestId(
      'tafsir-selection-en-tafsir-maarif-ul-quran',
    );
    await maarifAlQuranButton.click();

    // Check that the selected tafsir button is updated
    await expect(maarifAlQuranButton).toHaveAttribute('data-selected', 'true');
    await expect(ibnKathirButton).toHaveAttribute('data-selected', 'false');

    // Quick check that the content has updated
    await expect(
      tafsirModal.getByText("The negative particle la 'nay' prefixed to the oath"),
    ).toBeVisible();
  },
);

test(
  'Changing tafsir language updates available tafsirs',
  { tag: ['@tafsir'] },
  async ({ page }) => {
    const firstVerse = page.getByTestId('verse-75:1');
    const tafsirTabButton = firstVerse.getByTestId('bottom-action-tab-tafsir');

    const tafsirModal = page.getByTestId('modal-content');

    await tafsirTabButton.click();
    await expect(tafsirModal).toBeVisible();

    // Change language to Arabic
    const languageSelect = tafsirModal.getByTestId('lang-selection');
    await languageSelect.selectOption('arabic');

    // Check that the new tafsir is available
    const arabicTafsirButton = tafsirModal.getByTestId('tafsir-selection-ar-tafsir-jalalayn');
    await expect(arabicTafsirButton).toBeVisible();
    const alQurtubiButton = tafsirModal.getByTestId('tafsir-selection-ar-tafseer-al-qurtubi');
    await expect(alQurtubiButton).toBeVisible();

    // Check that an English tafsir is no longer available
    const ibnKathirButton = tafsirModal.getByTestId('tafsir-selection-en-tafisr-ibn-kathir');
    await expect(ibnKathirButton).toBeHidden();
  },
);

test(
  'Changing the ayah in the tafsir modal updates the content',
  { tag: ['@tafsir'] },
  async ({ page }) => {
    const firstVerse = page.getByTestId('verse-75:1');
    const tafsirTabButton = firstVerse.getByTestId('bottom-action-tab-tafsir');

    const tafsirModal = page.getByTestId('modal-content');

    await tafsirTabButton.click();
    await expect(tafsirModal).toBeVisible();

    // Check that the content is for verse 1
    await expect(tafsirModal.getByText('The Oath about the Final Return')).toBeVisible();

    // Change to verse 2
    const ayahSelect = tafsirModal.getByTestId('ayah-selection');
    await ayahSelect.selectOption('20');

    // Check that the content has updated
    await expect(
      tafsirModal.getByText(
        'This is Allah teaching His Messenger how to receive the revelation from the angel.',
      ),
    ).toBeVisible();
  },
);
