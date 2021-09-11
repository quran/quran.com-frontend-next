import Chapter from 'types/Chapter';

/* eslint-disable global-require */
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
