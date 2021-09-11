const sitemap = require('nextjs-sitemap-generator');
const range = require('lodash/range');
const chaptersData = require('./public/data/chapters/en.json');

const chapters = range(1, 115);

const generateVersesPaths = () => {
  const paths = [];
  chapters.forEach((chapterId) => {
    range(chaptersData[chapterId].versesCount).forEach((verseId) => {
      paths.push(`/${chapterId}/${verseId + 1}`);
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
