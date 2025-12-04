import { test, expect } from '@playwright/test';

import Homepage from '@/tests/POM/home-page';

let homePage: Homepage;

test.beforeEach(async ({ page, context }) => {
  test.slow();

  homePage = new Homepage(page, context);
});

test('Page /S should load Surah S', { tag: ['@url', '@smoke'] }, async ({ page }) => {
  await homePage.goTo('/75');
  await expect(page.getByText('Al-Qiyamah').first()).toBeVisible();
  expect(await page.title()).toContain('Al-Qiyamah');
});

test(
  'Page /S/V should load Ayah V of Surah S',
  { tag: ['@url', '@reader', '@verse', '@smoke'] },
  async ({ page }) => {
    await homePage.goTo('/2/255');
    await expect(
      page.getByText('Allah! There is no god ˹worthy of worship˺ except Him'),
    ).toBeVisible();
    expect(await page.title()).toContain('Al-Baqarah - 255');
  },
);

test(
  'Page /2:255 should have special title for Ayatul Kursi',
  { tag: ['@url', '@reader', '@verse'] },
  async ({ page }) => {
    await homePage.goTo('/2:255');
    expect(await page.title()).toContain('Al-Baqarah - Ayatul Kursi');
  },
);

test(
  'Page /ayatul-kursi should load Ayatul Kursi',
  { tag: ['@url', '@verse'] },
  async ({ page }) => {
    await homePage.goTo('/ayatul-kursi');
    await expect(
      page.getByText('Allah! There is no god ˹worthy of worship˺ except Him'),
    ).toBeVisible();
    expect(await page.title()).toContain('Al-Baqarah - Ayatul Kursi');
  },
);

test(
  'Page /S:V should load Ayah V of Surah S with correct title',
  { tag: ['@url', '@reader', '@verse'] },
  async ({ page }) => {
    await homePage.goTo('/6:4');
    await expect(
      page.getByText('Whenever a sign comes to them from their Lord, they turn away from it.'),
    ).toBeVisible();
    expect(await page.title()).toContain("Al-An'am - 4");
  },
);

test(
  'Page /S/V1-V2 should load Ayahs V1 to V2 of Surah S with correct title',
  { tag: ['@url', '@reader', '@verse', '@smoke'] },
  async ({ page }) => {
    await homePage.goTo('/36/1-3');
    await expect(page.getByText('Yâ-Sĩn')).toBeVisible();
    await expect(page.getByText('By the Quran, rich in wisdom!')).toBeVisible();
    await expect(page.getByText('You ˹O Prophet˺ are truly one of the messengers')).toBeVisible();
    expect(await page.title()).toContain('Ya-Sin - 1-3');
  },
);

test(
  'Page /{surah name} should load Surah {surah name}',
  { tag: ['@url', '@surah', '@reader', '@smoke'] },
  async ({ page }) => {
    await homePage.goTo('/al-qalam');
    await expect(page.getByText('Al-Qalam').first()).toBeVisible();
    expect(await page.title()).toContain('Al-Qalam');
  },
);

test(
  'Page /{surah name}/V should load Ayah V of Surah {surah name}',
  { tag: ['@url', '@verse'] },
  async ({ page }) => {
    await homePage.goTo('/an-nasr/3');
    await expect(
      page.getByText('then glorify the praises of your Lord and seek His forgiveness'),
    ).toBeVisible();
    expect(await page.title()).toContain('An-Nasr - 3');
  },
);

test(
  'Page /{surah name}/V1-V2 should load Ayahs V1 to V2 of Surah {surah name}',
  { tag: ['@url', '@verse'] },
  async ({ page }) => {
    await homePage.goTo('/al-masad/1-3');
    await expect(
      page.getByText('May the hands of Abu Lahab perish, and he ˹himself˺ perish!'),
    ).toBeVisible();
    await expect(page.getByText('He will burn in a flaming Fire,')).toBeVisible();
    expect(await page.title()).toContain('Al-Masad - 1-3');
  },
);

test(
  'Page /juz/N should load Juz N with correct title',
  { tag: ['@url', '@juz', '@reader', '@smoke'] },
  async ({ page, isMobile }) => {
    test.skip(isMobile, 'On mobile it requires to scroll down to load the header');

    await homePage.goTo('/juz/30');

    await expect(page.getByText('Juz 30')).toBeVisible();
    await expect(page.getByText('An-Naba').first()).toBeVisible();
    expect(await page.title()).toContain('Juz 30');
  },
);

test(
  'Page /page/N should load Page N with correct title',
  { tag: ['@url', '@page', '@reader', '@smoke'] },
  async ({ page }) => {
    await homePage.goTo('/page/200');
    await expect(page.getByText('9:80')).toBeVisible();
    expect(await page.title()).toContain('Page 200');
  },
);

test('Page /hizb/N should load Hizb N', { tag: ['@url', '@hizb', '@reader'] }, async ({ page }) => {
  await homePage.goTo('/hizb/45');
  await expect(page.getByText('36:28')).toBeVisible();
  expect(await page.title()).toContain('Hizb 45');
});

test('Page /rub/N should load Rub N', { tag: ['@url', '@rub', '@reader'] }, async ({ page }) => {
  await homePage.goTo('/rub/150');
  await expect(page.getByText('26:181')).toBeVisible();
  expect(await page.title()).toContain('Rub el Hizb 150');
});

test(
  'Page /S:V/tafsirs/en-tafisr-ibn-kathir should load the tafsir page',
  { tag: ['@url', '@tafsir', '@smoke'] },
  async ({ page }) => {
    await homePage.goTo('/2:255/tafsirs/en-tafisr-ibn-kathir');
    await expect(page.getByText('Ibn Kathir')).toBeVisible();
    await expect(page.getByText('The Virtue of Ayat Al-Kursi')).toBeVisible();
    expect(await page.title()).toContain('Tafsir Surah Al-Baqarah - 255');
  },
);

test(
  'Unknown path should load the "Sorry, something went wrong" page',
  { tag: ['@url', '@error'] },
  async ({ page }) => {
    await homePage.goTo('/this/path/does/not/exist');
    await expect(page.getByText('Sorry, something went wrong')).toBeVisible();
  },
);
