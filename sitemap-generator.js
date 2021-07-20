const sitemap = require('nextjs-sitemap-generator');
const range = require('lodash/range');
const chaptersData = require('./data/chapters.json');

const chapters = range(1, 115);

const generateVersesPaths = () => {
  const paths = [];
  range(114).forEach((chapterId) => {
    const chapterNumber = chapterId + 1;
    range(chaptersData[chapterId].versesCount).forEach((verseId) => {
      paths.push(`/${chapterNumber}/${verseId + 1}`);
    });
  });
  return paths;
};

sitemap({
  baseUrl: 'https://quran.com',
  ignoredPaths: ['/[chapterId]', '/[chapterId]/[verseId]'],
  extraPaths: chapters.map((id) => `/${id}`).concat(generateVersesPaths()),
  pagesDirectory: `${__dirname}/src/pages`,
  targetDirectory: 'public/',
  nextConfigPath: `${__dirname}/next.config.js`,
  ignoredExtensions: ['png', 'jpg', 'json'],
  ignoreIndexFiles: true,
});
