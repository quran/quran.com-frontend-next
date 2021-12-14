/* eslint-disable jsdoc/require-returns */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const range = require('lodash/range');

const { locales } = require('./i18n.json');
const englishChaptersData = require('./public/data/chapters/en.json');

const isDevelopment = process.env.NEXT_PUBLIC_VERCEL_ENV === 'development';
const isPreview = process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';

const BASE_PATH =
  `${isDevelopment ? 'http' : 'https'}://${process.env.NEXT_PUBLIC_VERCEL_URL}` ||
  'https://quran.com';

const chapters = range(1, 115);

/**
 * Get the alternate ref objects for a path. We append "-remove-from-here" because
 * next-sitemap library appends the alternate ref to the beginning
 * of the url of the English version rather than replacing it completely.
 * e.g. for english the url is /surah/al-fatihah/info
 * but for Arabic it becomes /ar/surah/سورة-الفاتحة/info/surah/al-fatihah/info
 * although we don't want "surah/al-fatihah/info" part at the end of the path.
 * so appending "-remove-from-here" indicator would make it easier for us to manually
 * process the .xml file and remove the characters starting from "-remove-from-here".
 * e.g. /ar/سورة-الفاتحة/1-remove-from-here/al-fatihah/1
 *
 * @param {number} chapterId
 * @param {boolean} appendSlug
 * @param {string} prefix
 * @param {string} suffix
 */
const getAlternateRefs = (chapterId = null, appendSlug = true, prefix = '', suffix = '') => {
  return locales.map((locale) => {
    let href = `${BASE_PATH}/${locale}`;
    if (prefix) {
      href = `${href}/${prefix}`;
    }
    if (appendSlug) {
      const localeChaptersData = require(`./public/data/chapters/${locale}.json`);
      href = `${href}/${localeChaptersData[chapterId].slug}`;
    }
    if (suffix) {
      href = `${href}/${suffix}`;
    }

    return {
      href: `${href}-remove-from-here`,
      hreflang: locale,
    };
  });
};

module.exports = {
  siteUrl: BASE_PATH,
  sitemapSize: 30000,
  generateRobotsTxt: isDevelopment || isPreview, // TODO: allow this once we are live
  exclude: [...locales.map((locale) => `/${locale}`), '/*/product-updates*', '/*/search'],
  alternateRefs: locales.map((locale) => ({
    href: `${BASE_PATH}/${locale}`,
    hreflang: locale,
  })),
  transform: async (config, path) => {
    return {
      loc: path,
      lastmod: new Date().toISOString(),
      alternateRefs: config.alternateRefs ?? [],
    };
  },
  additionalPaths: async (config) => {
    const result = [];
    chapters.forEach((chapterId) => {
      // 1. add the chapter slugs in English along with the localized slugs in every locale
      const englishChapterSlug = englishChaptersData[chapterId].slug;
      result.push({
        loc: `/${englishChapterSlug}`,
        alternateRefs: getAlternateRefs(chapterId),
      });
      // 2. add slugged /surah/[chapterSlug]/info in English along with the localized slugs in every locale
      result.push({
        loc: `/surah/${englishChapterSlug}/info`,
        alternateRefs: getAlternateRefs(chapterId, true, 'surah', 'info'),
      });

      // 3. generate the verses for each of the chapters in each locale as well
      range(englishChaptersData[chapterId].versesCount).forEach((verseId) => {
        const verseNumber = verseId + 1;
        const verseIdValue = verseNumber;
        const isAyatulKursi = chapterId === 2 && verseNumber === 255;
        if (isAyatulKursi) {
          // instead of /al-baqarah/255, we push /ayatul-kursi
          result.push({
            loc: `/ayatul-kursi`,
            alternateRefs: getAlternateRefs(null, false, '', 'ayatul-kursi'),
          });
        } else {
          result.push({
            loc: `/${englishChapterSlug}/${verseIdValue}`,
            alternateRefs: getAlternateRefs(chapterId, true, '', verseIdValue),
          });
        }
        // 4. add /[chapterId]/[verseId]/tafsirs route
        result.push({
          loc: `/${englishChapterSlug}/${verseIdValue}/tafsirs`,
          alternateRefs: getAlternateRefs(chapterId, true, '', `${verseIdValue}/tafsirs`),
        });
      });
    });
    // 5. /juz/[juzId]
    range(1, 31).forEach(async (juzId) => {
      result.push(await config.transform(config, `/juz/${juzId}`));
    });
    // 6. /page/[pageId]
    range(1, 605).forEach(async (pageId) => {
      result.push(await config.transform(config, `/page/${pageId}`));
    });

    return result;
  },
};
