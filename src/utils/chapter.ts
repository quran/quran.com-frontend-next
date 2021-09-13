import Chapter from 'types/Chapter';

/* eslint-disable global-require */
const DEFAULT_LANGUAGE = 'en';

export const getChaptersData = (lang = DEFAULT_LANGUAGE): Record<string, Chapter> => {
  switch (lang) {
    case 'en':
      return require('../../public/data/chapters/en.json');
    default:
      return require('../../public/data/chapters/en.json');
  }
};

export const getChapterDataById = (id: string, lang = DEFAULT_LANGUAGE): Chapter => {
  const chapters = getChaptersData(lang);
  return chapters[id];
};

/**
 * Whether the current surah is the first surah.
 *
 * @param {Number} chapterNumber
 * @returns  {Boolean}
 */
export const isFirstSurah = (surahNumber: number): boolean => surahNumber === 1;

/**
 * Whether the current surah is the last surah.
 *
 * @param {Number} chapterNumber
 * @returns  {Boolean}
 */
export const isLastSurah = (surahNumber: number): boolean => surahNumber === 114;
