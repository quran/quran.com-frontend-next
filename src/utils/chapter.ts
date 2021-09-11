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

export const getChapterIdsForPage = (pageId: string) => {
  const pagesData = require('../../public/data/juzs.json');
  return Object.keys(pagesData[pageId].verseMapping);
};

export const getChapterIdsForJuz = (juzId: string) => {
  const juzsData = require('../../public/data/juzs.json');
  return Object.keys(juzsData[juzId].verseMapping);
};
