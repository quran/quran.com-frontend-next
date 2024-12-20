/* eslint-disable no-console */
/* eslint-disable max-lines */
/* eslint-disable jsdoc/require-returns */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const CryptoJS = require('crypto-js');
const range = require('lodash/range');
const fetch = require('node-fetch');

const englishChaptersData = require('./data/chapters/en.json');
const { locales } = require('./i18n.json');

const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
const isDevelopment = process.env.NEXT_PUBLIC_VERCEL_ENV === 'development';
const shouldGenerateAdditionalPaths =
  process.env.NEXT_PUBLIC_GENERATE_SITEMAP_ADDITIONAL_PATHS === 'true';

const BASE_PATH =
  `${isDevelopment ? 'http' : 'https'}://${process.env.NEXT_PUBLIC_VERCEL_URL}` ||
  'https://quran.com';

const { API_GATEWAY_URL } = process.env;
const API_CONTENT_URL = `${API_GATEWAY_URL}/content`;
const API_AUTH_URL = `${API_GATEWAY_URL}/auth`;
const QDC_PREFIX = '/api/qdc';

const chapters = range(1, 115);

const generateSignature = (url) => {
  const currentTimestamp = new Date().getTime().toString();

  const rawString = `${url}.${currentTimestamp}`;
  const signature = CryptoJS.HmacSHA512(rawString, process.env.SIGNATURE_TOKEN);
  const encodedSignature = CryptoJS.enc.Base64.stringify(signature);

  return { signature: encodedSignature, timestamp: currentTimestamp };
};

const getAvailableCourses = async () => {
  const coursesURL = `${API_AUTH_URL}/courses`;
  const { signature, timestamp } = generateSignature(coursesURL);
  const res = await fetch(coursesURL, {
    headers: {
      'x-auth-signature': signature,
      'x-timestamp': timestamp,
      'x-internal-client': process.env.INTERNAL_CLIENT_ID,
    },
  });
  const data = await res.json();
  return data;
};

const getAvailableTafsirs = async () => {
  const tafsirsURL = `${API_CONTENT_URL}${QDC_PREFIX}/resources/tafsirs`;
  const { signature, timestamp } = generateSignature(tafsirsURL);
  const res = await fetch(tafsirsURL, {
    headers: {
      'x-auth-signature': signature,
      'x-timestamp': timestamp,
      'x-internal-client': process.env.INTERNAL_CLIENT_ID,
    },
  });
  const data = await res.json();
  return data;
};

const getAvailableReciters = async () => {
  const recitersURL = `${API_CONTENT_URL}${QDC_PREFIX}/audio/reciters`;
  const { signature, timestamp } = generateSignature(recitersURL);
  const res = await fetch(recitersURL, {
    headers: {
      'x-auth-signature': signature,
      'x-timestamp': timestamp,
      'x-internal-client': process.env.INTERNAL_CLIENT_ID,
    },
  });
  const data = await res.json();
  return data;
};

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
      const localeChaptersData = require(`./data/chapters/${locale}.json`);
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
  sitemapSize: 20000,
  generateRobotsTxt: isProduction,
  exclude: [
    ...locales.map((locale) => `/${locale}`),
    '/*/product-updates*',
    '/*/search',
    '/*my-learning-plans',
  ],
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
  additionalPaths: shouldGenerateAdditionalPaths
    ? async (config) => {
        const result = [];
        let tafsirSlugs = [];
        let reciterIds = [];
        await getAvailableTafsirs().then((response) => {
          tafsirSlugs = response.tafsirs.map((tafsir) => tafsir.slug);
        });
        await getAvailableReciters().then((response) => {
          reciterIds = response.reciters.map((reciter) => reciter.id);
        });
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

          // 3. /reciters/[reciterId]/[chapterSlug]
          reciterIds.forEach((reciterId) => {
            const location = `/reciters/${reciterId}/${englishChapterSlug}`;
            result.push({
              loc: location,
              alternateRefs: getAlternateRefs(chapterId, false, '', location),
            });
          });

          // 4. generate the verses for each of the chapters in each locale as well
          range(englishChaptersData[chapterId].versesCount).forEach((verseId) => {
            const verseNumber = verseId + 1;
            const verseIdValue = verseNumber;
            const verseKey = `${chapterId}:${verseIdValue}`;
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
            // 5. add /[chapterId]/[verseId]/tafsirs route
            result.push({
              loc: `/${englishChapterSlug}/${verseIdValue}/tafsirs`,
              alternateRefs: getAlternateRefs(chapterId, true, '', `${verseIdValue}/tafsirs`),
            });
            // 6. /[verseKey]/tafsirs/[tafsirSlug]
            tafsirSlugs.forEach((tafsirSlug) => {
              const location = `${verseKey}/tafsirs/${tafsirSlug}`;
              result.push({
                loc: location,
                alternateRefs: getAlternateRefs(chapterId, false, '', location),
              });
            });
            // 7. /[verseKey]/reflections
            const reflectionsLocation = `${verseKey}/reflections`;
            result.push({
              loc: reflectionsLocation,
              alternateRefs: getAlternateRefs(chapterId, false, '', reflectionsLocation),
            });
          });
        });
        // 7. /juz/[juzId]
        range(1, 31).forEach(async (juzId) => {
          result.push(await config.transform(config, `/juz/${juzId}`));
        });
        // 8. /hizb/[hizbId]
        range(1, 61).forEach(async (hizbId) => {
          result.push(await config.transform(config, `/hizb/${hizbId}`));
        });
        // 9. /rub/[rubId]
        range(1, 241).forEach(async (rubId) => {
          result.push(await config.transform(config, `/rub/${rubId}`));
        });
        // 10. /page/[pageId]
        range(1, 605).forEach(async (pageId) => {
          result.push(await config.transform(config, `/page/${pageId}`));
        });
        // 11. /reciters/[reciterId]
        reciterIds.forEach((reciterId) => {
          const location = `/reciters/${reciterId}`;
          result.push({
            loc: location,
            alternateRefs: getAlternateRefs('', false, '', location),
          });
        });

        // 12. /learning-plans/[learningPlanSlug]
        const learningPlans = await getAvailableCourses();
        // TODO: handle pagination in the future when we have more than 10 learning plans
        learningPlans.data.forEach((learningPlan) => {
          const location = `/learning-plans/${learningPlan.slug}`;
          // TODO: handle per language learning plans e.g. Arabic learning plan should only show under /ar/[learning-plan-slug]
          result.push({
            loc: location,
            alternateRefs: getAlternateRefs('', false, '', location),
          });
        });

        return result;
      }
    : async () => {
        console.log('Skipping additional paths generation...');
        return Promise.resolve([]);
      },
};
