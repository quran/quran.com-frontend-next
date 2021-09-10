/* eslint-disable global-require */
const DEFAULT_LANGUAGE = 'en';

export const getChaptersData = (lang = DEFAULT_LANGUAGE) => {
  switch (lang) {
    case 'en':
      return require('../../public/data/chapters/en.json');
    default:
      return require('../../public/data/chapters/en.json');
  }
};

export const getChapterDataById = (id: string, lang = DEFAULT_LANGUAGE) => {
  const chapters = getChaptersData(lang);
  return chapters[id];
};
