/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
const fs = require('fs');

const replace = require('replace-in-file');

const dirCont = fs.readdirSync('././public');
// 1. scan the public directory for any sitemap xml files (can be multiple if they were split due to size).
const sitemapFiles = dirCont
  .filter((elm) => {
    return elm.match(/.*sitemap.*.xml/gi);
  })
  .map((file) => `././public/${file}`);

// 2. replace any character starting from -remove-from-here until the first " character which is the end of the alternate link
replace({
  files: sitemapFiles,
  // Replacement to make (string or regex)
  from: /-remove-from-here.*?"/g,
  to: '"',
})
  .then((changedFiles) => {
    console.log('Modified files:', changedFiles.map((changedFile) => changedFile.file).join(', '));
  })
  .catch((error) => {
    console.error('Error occurred:', error);
  });
