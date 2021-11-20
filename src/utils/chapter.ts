/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
import Chapter from 'types/Chapter';

const DEFAULT_LANGUAGE = 'en';
const SUPPORTED_CHAPTER_LOCALES = [
  'en',
  'ar',
  'bn',
  'fr',
  'id',
  'it',
  'nl',
  'ru',
  'tr',
  'ur',
  'zh',
];

/**
 * Get chapters data from the json file, by language
 *
 * @param {string} lang
 * @returns {Record<string, Chapter>} chapter
 */
export const getAllChaptersData = (lang: string = DEFAULT_LANGUAGE): Record<string, Chapter> => {
  if (SUPPORTED_CHAPTER_LOCALES.includes(lang)) {
    // eslint-disable-next-line import/no-dynamic-require
    return require(`../../public/data/chapters/${lang}.json`);
  }
  return require('../../public/data/chapters/en.json');
};

/**
 * Get chapter data by id from the json file
 *
 * @param {string} id  chapterId
 * @param {string} lang language
 * @returns {Chapter} chapter
 */
export const getChapterData = (id: string, lang: string = DEFAULT_LANGUAGE): Chapter => {
  const chapters = getAllChaptersData(lang);
  return chapters[id];
};

/**
 * Given a pageId, get chapter ids from a json file
 *
 * @param {string} pageId
 * @returns {Promise<string[]>} chapterIds
 */
export const getChapterIdsForPage = (pageId: string): Promise<string[]> => {
  return new Promise((res) => {
    import(`../../public/data/page-to-chapter-mappings.json`).then((data) => {
      res(data.default[pageId]);
    });
  });
};

/**
 * Given a juzId, get chapters ids from a json file
 *
 * @param {string} juzId
 * @returns {string[]} chapterIds
 */
export const getChapterIdsForJuz = async (juzId: string): Promise<string[]> => {
  const juzsData = await import('../../public/data/juz-to-chapter-mappings.json');
  return juzsData[juzId];
};

type ChapterAndVerseMapping = { [chapter: string]: string };
/**
 * get ChapterAndVerseMapping for all juzs
 *
 * @returns {[juz: string]: ChapterAndVerseMapping}
 */
export const getAllJuzMappings = (): Promise<{ [juz: string]: ChapterAndVerseMapping }> => {
  return import('../../public/data/juz-to-chapter-verse-mappings.json').then(
    (data) => data.default,
  );
};

/**
 * Given a juzId get a chapter + verse mapping for this juz
 *
 * @param {string} juzId
 * @returns {[chapter: string]: string}
 *
 * original data source: https://api.quran.com/api/v4/juzs
 *
 * Example:
 * getChapterAndVerseMappingForJuz("1") // { "1": "1-7", "2" : "1-141"}
 * -> juz "1" contains chapter "1" with verse "1-7" and chapter "2" with verse "1-141"
 *
 */
export const getChapterAndVerseMappingForJuz = async (
  juzId: string,
): Promise<{ [chapter: string]: string }> => {
  const juzVerseMapping = await getAllJuzMappings();
  return juzVerseMapping[juzId];
};

/**
 * Whether the current surah is the first surah.
 *
 * @param {number} surahNumber
 * @returns  {boolean}
 */
export const isFirstSurah = (surahNumber: number): boolean => surahNumber === 1;

/**
 * Whether the current surah is the last surah.
 *
 * @param {number} surahNumber
 * @returns  {boolean}
 */
export const isLastSurah = (surahNumber: number): boolean => surahNumber === 114;

/**
 * Get how much percentage of the chapter has been read.
 *
 * @param {number} currentVerse
 * @param {number} totalNumberOfVerses
 * @returns {number}
 */
export const getChapterReadingProgress = (
  currentVerse: number,
  totalNumberOfVerses: number,
): number => Math.ceil((currentVerse * 100) / totalNumberOfVerses);
