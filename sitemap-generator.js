const sitemap = require('nextjs-sitemap-generator');
const range = require('lodash/range');

const chapters = range(1, 115);

sitemap({
  baseUrl: 'https://quran.com',
  ignoredPaths: ['/[chapterId]'],
  extraPaths: chapters.map((id) => `/${id}`),
  pagesDirectory: `${__dirname}/src/pages`,
  targetDirectory: 'public/',
  nextConfigPath: `${__dirname}/next.config.js`,
  ignoredExtensions: ['png', 'jpg', 'json'],
  ignoreIndexFiles: true,
});
