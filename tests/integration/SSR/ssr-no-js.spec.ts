/* eslint-disable react-func/max-lines-per-function */
import { test, expect } from '@playwright/test';

test.describe('SSR (JS disabled)', () => {
  test.use({ javaScriptEnabled: false, locale: 'en-US' });

  test('Home page renders key content without JS', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText(/Al-Fatiha/).first()).toBeVisible();
    await expect(page.getByText(/The Opener/).first()).toBeVisible();
    await expect(page.getByText(/An-Nas/).first()).toBeVisible();
    await expect(page.getByText(/Mankind/).first()).toBeVisible();

    const learningPlansSection = page.getByTestId('learning-plans-section');
    const learningPlansChildren = await learningPlansSection.locator(':scope > *').count();
    expect(learningPlansChildren).toBeGreaterThan(0);
  });

  test('About the Quran page renders without JS', async ({ page }) => {
    await page.goto('/about-the-quran');

    await expect(page.getByText(/What is the Quran\?/).first()).toBeVisible();
  });

  test('What is Ramadan page renders without JS', async ({ page }) => {
    await page.goto('/what-is-ramadan');

    await expect(page.getByText(/What is Ramadan\?/).first()).toBeVisible();
  });

  test('Surah 1 page renders verses without JS', async ({ page }) => {
    await page.goto('/1');

    await expect(page.getByText(/Al-Fatihah/).first()).toBeVisible();
    await expect(page.getByText(/The Opener/).first()).toBeVisible();
    await expect(
      page.getByText(/إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ٥/).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/You ˹alone˺ we worship and You ˹alone˺ we ask for help./).first(),
    ).toBeVisible();
  });

  test('Juz 30 page renders verses without JS', async ({ page }) => {
    await page.goto('/juz/30');

    await expect(page.getByText(/كَلَّا سَيَعْلَمُونَ ٤/).first()).toBeVisible();
    await expect(page.getByText(/But no! They will come to know./).first()).toBeVisible();
    await expect(page.getByText(/An-Naba/)).toBeVisible();
  });

  test('Rub 20 page renders verses without JS', async ({ page }) => {
    await page.goto('/rub/20');

    await expect(
      page.getByText(/لِّلَّهِ مَا فِى ٱلسَّمَـٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ/).first(),
    ).toBeVisible();
    await expect(
      page
        .getByText(
          /To Allah ˹alone˺ belongs whatever is in the heavens and whatever is on the earth./,
        )
        .first(),
    ).toBeVisible();
  });

  test('Page 300 renders verses without JS', async ({ page }) => {
    await page.goto('/page/300');

    await expect(
      page
        .getByText(
          /وَلَقَدْ صَرَّفْنَا فِى هَـٰذَا ٱلْقُرْءَانِ لِلنَّاسِ مِن كُلِّ مَثَلٍۢ ۚ وَكَانَ ٱلْإِنسَـٰنُ أَكْثَرَ شَىْءٍۢ جَدَلًۭا ٥٤/,
        )
        .first(),
    ).toBeVisible();
    await expect(
      page
        .getByText(
          /We have surely set forth in this Quran every ˹kind of˺ lesson for people, but humankind is the most argumentative of all beings./,
        )
        .first(),
    ).toBeVisible();
  });

  test('Hizb 8 page renders verses without JS', async ({ page }) => {
    await page.goto('/hizb/8');

    await expect(
      page
        .getByText(
          /۞ يَسْتَبْشِرُونَ بِنِعْمَةٍۢ مِّنَ ٱللَّهِ وَفَضْلٍۢ وَأَنَّ ٱللَّهَ لَا يُضِيعُ أَجْرَ ٱلْمُؤْمِنِينَ ١٧١/,
        )
        .first(),
    ).toBeVisible();
    await expect(
      page
        .getByText(
          /They are joyful for receiving Allah’s grace and bounty, and that Allah does not deny the reward of the believers./,
        )
        .first(),
    ).toBeVisible();
  });

  test('Ayah 1:4 page renders verse without JS', async ({ page }) => {
    await page.goto('/1:4');

    await expect(page.getByText(/مَـٰلِكِ يَوْمِ ٱلدِّينِ ٤/).first()).toBeVisible();
    await expect(page.getByText(/Master of the Day of Judgment./).first()).toBeVisible();
  });

  test('Maarif-ul-Quran tafsir page renders without JS', async ({ page }) => {
    await page.goto('/1:4/tafsirs/en-tafsir-maarif-ul-quran');

    await expect(
      page
        .getByText(
          /Now, we come to the second question. It should be obvious, on a little reflection/,
        )
        .first(),
    ).toBeVisible();
  });

  test('Ibn Kathir tafsir page renders without JS', async ({ page }) => {
    await page.goto('/1:4/tafsirs/en-tafisr-ibn-kathir');

    await expect(
      page.getByText(/Allah mentioned His sovereignty of the Day of Resurrection/).first(),
    ).toBeVisible();
  });

  test('Swahili tafsir page renders without JS', async ({ page }) => {
    await page.goto('/1:4/tafsirs/dr-abdullah-muhammad-abu-bakr-and-sheikh-nasir-khamis');

    await expect(page.getByText(/Na Yeye, kutakasika ni Kwake/).first()).toBeVisible();
  });

  test('Reflections page renders without JS', async ({ page }) => {
    await page.goto('/1:2/reflections');

    await expect(page.getByText(/note in English/).first()).toBeVisible();
    await expect(page.getByText(/hebaddy adminddy/).first()).toBeVisible();
  });

  // Skipped because there's no more lessons on testing env
  test.skip('Lessons page renders without JS', async ({ page }) => {
    await page.goto('/1:2/lessons');

    await expect(page.getByText(/Osama Sayed/).first()).toBeVisible();
    await expect(page.getByText(/ٱلۡحَمۡدُ... عظمة الحمد، وحب الله/).first()).toBeVisible();
  });

  test('Answers page renders without JS', async ({ page }) => {
    await page.goto('/1:1/answers');

    await expect(
      page.getByText(/What is the etymology of the name "Allah"\?/).first(),
    ).toBeVisible();
  });

  test('Surah info page renders content without JS', async ({ page }) => {
    await page.goto('/surah/1/info');

    await expect(
      page.getByText(/This Surah is named Al-Fatihah because of its subject matter/),
    ).toBeVisible();
    await expect(
      page.getByText(
        /This Surah is in fact a prayer that Allah has taught to all those who want to make a study of His book/,
      ),
    ).toBeVisible();
  });
});
