/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
import Chapter from 'types/Chapter';

const DEFAULT_LANGUAGE = 'en';

/**
 * Get chapters data from json file, by language
 * @param {string} lang
 * @returns {Chapter} chapter
 */
export const getChaptersData = (lang = DEFAULT_LANGUAGE): Record<string, Chapter> => {
  switch (lang) {
    case 'en':
      return require('../../public/data/chapters/en.json');
    default:
      return require('../../public/data/chapters/en.json');
  }
};

/**
 * Get chapter data by id from json file
 * @param {string} id  chapterId
 * @param {string} lang language
 * @returns {Chapter} chapter
 */
export const getChapterDataById = (id: string, lang = DEFAULT_LANGUAGE): Chapter => {
  const chapters = getChaptersData(lang);
  return chapters[id];
};

/**
 * Given a pageId, get chapter ids from a json file
 * @param {string} pageId
 * @returns {string[]} chapterIds
 */
export const getChapterIdsForPage = (pageId: string): string[] => {
  const pagesData = require('../../public/data/juzs.json');
  return Object.keys(pagesData[pageId].verseMapping);
};

/**
 * Given a juzId, get chapters ids from a json file
 * @param {string} juzId
 * @returns {string[]} chapterIds
 */
export const getChapterIdsForJuz = (juzId: string): string[] => {
  const juzsData = require('../../public/data/juzs.json');
  return Object.keys(juzsData[juzId].verseMapping);
};
