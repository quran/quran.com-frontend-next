/* eslint-disable react-func/max-lines-per-function */
import { test, expect } from '@playwright/test';

test.describe('SSR (JS disabled)', () => {
  test.use({ javaScriptEnabled: false });

  test('Home page renders key content without JS', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Al-Fatiha').first()).toBeVisible();
    await expect(page.getByText('The Opener').first()).toBeVisible();
    await expect(page.getByText('An-Nas').first()).toBeVisible();
    await expect(page.getByText('Mankind').first()).toBeVisible();

    const learningPlansSection = page.getByTestId('learning-plans-section');
    const learningPlansChildren = await learningPlansSection.locator(':scope > *').count();
    expect(learningPlansChildren).toBeGreaterThan(0);
  });

  test('About the Quran page renders without JS', async ({ page }) => {
    await page.goto('/about-the-quran');

    await expect(page.getByText('What is the Quran?').first()).toBeVisible();
  });

  test('What is Ramadan page renders without JS', async ({ page }) => {
    await page.goto('/what-is-ramadan');

    await expect(page.getByText('What is Ramadan?').first()).toBeVisible();
  });

  test('Surah 1 page renders verses without JS', async ({ page }) => {
    await page.goto('/1');

    await expect(page.getByText('Al-Fatihah').first()).toBeVisible();
    await expect(page.getByText('The Opener').first()).toBeVisible();
    await expect(
      page.getByText('إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ٥').first(),
    ).toBeVisible();
    await expect(
      page.getByText('You ˹alone˺ we worship and You ˹alone˺ we ask for help.').first(),
    ).toBeVisible();
  });

  test('Juz 30 page renders verses without JS', async ({ page }) => {
    await page.goto('/juz/30');

    await expect(
      page.getByText('كَلَّآ إِنَّ كِتَـٰبَ ٱلْأَبْرَارِ لَفِى عِلِّيِّينَ ١٨').first(),
    ).toBeVisible();
    await expect(
      page
        .getByText('But no! The virtuous are certainly bound for ’Illiyûn1 ˹in elevated Gardens˺—')
        .first(),
    ).toBeVisible();
    await expect(page.getByText('Al-Ghashiyah')).toBeVisible();
  });

  test('Rub 20 page renders verses without JS', async ({ page }) => {
    await page.goto('/rub/20');

    await expect(
      page
        .getByText(
          'قُل لِّلَّذِينَ كَفَرُوا۟ سَتُغْلَبُونَ وَتُحْشَرُونَ إِلَىٰ جَهَنَّمَ ۚ وَبِئْسَ ٱلْمِهَادُ ١٢',
        )
        .first(),
    ).toBeVisible();
    await expect(
      page
        .getByText(
          '˹O Prophet!˺ Tell the disbelievers, “Soon you will be overpowered and driven to Hell—what an evil place to rest!”',
        )
        .first(),
    ).toBeVisible();
  });

  test('Page 300 renders verses without JS', async ({ page }) => {
    await page.goto('/page/300');

    await expect(
      page
        .getByText(
          'وَتِلْكَ ٱلْقُرَىٰٓ أَهْلَكْنَـٰهُمْ لَمَّا ظَلَمُوا۟ وَجَعَلْنَا لِمَهْلِكِهِم مَّوْعِدًۭا ٥٩',
        )
        .first(),
    ).toBeVisible();
    await expect(
      page
        .getByText(
          'Those ˹are the˺ societies We destroyed when they persisted in wrong,1 and We had set a time for their destruction.',
        )
        .first(),
    ).toBeVisible();
  });

  test('Hizb 8 page renders verses without JS', async ({ page }) => {
    await page.goto('/hizb/8');

    await expect(
      page
        .getByText(
          'فَٱنقَلَبُوا۟ بِنِعْمَةٍۢ مِّنَ ٱللَّهِ وَفَضْلٍۢ لَّمْ يَمْسَسْهُمْ سُوٓءٌۭ وَٱتَّبَعُوا۟ رِضْوَٰنَ ٱللَّهِ ۗ وَٱللَّهُ ذُو فَضْلٍ عَظِيمٍ ١٧٤',
        )
        .first(),
    ).toBeVisible();
    await expect(
      page.getByText('Would you ˹still˺ take it unjustly and very sinfully?').first(),
    ).toBeVisible();
  });

  test('Ayah 1:4 page renders verse without JS', async ({ page }) => {
    await page.goto('/1:4');

    await expect(page.getByText('مَـٰلِكِ يَوْمِ ٱلدِّينِ ٤').first()).toBeVisible();
    await expect(page.getByText('Master of the Day of Judgment.').first()).toBeVisible();
  });

  test('Maarif-ul-Quran tafsir page renders without JS', async ({ page }) => {
    await page.goto('/1:4/tafsirs/en-tafsir-maarif-ul-quran');

    await expect(
      page
        .getByText(
          'Now, we come to the second question. It should be obvious, on a little reflection',
        )
        .first(),
    ).toBeVisible();
  });

  test('Ibn Kathir tafsir page renders without JS', async ({ page }) => {
    await page.goto('/1:4/tafsirs/en-tafisr-ibn-kathir');

    await expect(
      page.getByText('Allah mentioned His sovereignty of the Day of Resurrection').first(),
    ).toBeVisible();
  });

  test('Swahili tafsir page renders without JS', async ({ page }) => {
    await page.goto('/1:4/tafsirs/dr-abdullah-muhammad-abu-bakr-and-sheikh-nasir-khamis');

    await expect(page.getByText('Na Yeye, kutakasika ni Kwake').first()).toBeVisible();
  });

  test('Reflections page renders without JS', async ({ page }) => {
    await page.goto('/1:2/reflections');

    await expect(page.getByText('note in English').first()).toBeVisible();
    await expect(page.getByText('hebaddy adminddy').first()).toBeVisible();
  });

  test('Lessons page renders without JS', async ({ page }) => {
    await page.goto('/1:2/lessons');

    await expect(page.getByText('Osama Sayed').first()).toBeVisible();
    await expect(page.getByText('ٱلۡحَمۡدُ... عظمة الحمد، وحب الله').first()).toBeVisible();
  });

  test('Answers page renders without JS', async ({ page }) => {
    await page.goto('/1:1/answers');

    await expect(
      page.getByText('What is the etymology of the name "Allah"?').first(),
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
