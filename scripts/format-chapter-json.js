/* eslint-disable no-console */
const fs = require('fs');

const path = `./public/data/chapters/${process.argv[2]}.json`;
const fileContentJson = JSON.parse(fs.readFileSync(path, 'utf-8'));
const chaptersData = fileContentJson.chapters;
const newFileContent = {};
chaptersData.forEach((chapterData) => {
  const newChapterData = {};
  newChapterData.revelationPlace = chapterData.revelation_place;
  newChapterData.nameSimple = chapterData.name_simple;
  newChapterData.versesCount = chapterData.verses_count;
  newChapterData.translatedName = chapterData.translated_name.name;
  newFileContent[chapterData.id] = newChapterData;
});

fs.writeFile(path, JSON.stringify(newFileContent), (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log('Executed successfully');
});
