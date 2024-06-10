/* eslint-disable no-param-reassign */
const fs = require('fs');
const path = require('path');

const listDir = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      fileList = listDir(path.join(dir, file), fileList);
    } else {
      const fileDetails = file.split('.');
      const currentFileNameWithoutExtension = fileDetails[0];
      const fileExtension = fileDetails[1];
      // e.g. QCF4001_COLOR-Regular will be converted to [ '4001' ]
      const matchesArray = /^QCF(\d+).+/g.exec(currentFileNameWithoutExtension);
      if (!matchesArray) {
        return;
      }
      // since first page starts from 4001, subtracting 4000 will give us the actual number 4001 -> 1
      const pageNumber = Number(matchesArray[1]) - 4000;
      // e.g. p1.woff, p1.ttf, p1.woff2
      const name = `p${pageNumber}.${fileExtension}`;
      const src = path.join(dir, file);
      const newSrc = path.join(dir, name);
      fileList.push({
        oldSrc: src,
        newSrc,
      });
    }
  });

  return fileList;
};

const foundFiles = listDir('public/fonts/quran/hafs/v4');
foundFiles.forEach((f) => {
  fs.renameSync(f.oldSrc, f.newSrc);
});
