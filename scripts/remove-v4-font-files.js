/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const DESTINATION_DIRECTORIES = [
  'public/fonts/quran/hafs/v4/colrv1/ttf',
  'public/fonts/quran/hafs/v4/colrv1/woff',
  'public/fonts/quran/hafs/v4/colrv1/woff2',
  'public/fonts/quran/hafs/v4/ot-svg/dark/ttf',
  'public/fonts/quran/hafs/v4/ot-svg/dark/woff',
  'public/fonts/quran/hafs/v4/ot-svg/dark/woff2',
  'public/fonts/quran/hafs/v4/ot-svg/light/ttf',
  'public/fonts/quran/hafs/v4/ot-svg/light/woff',
  'public/fonts/quran/hafs/v4/ot-svg/light/woff2',
  'public/fonts/quran/hafs/v4/ot-svg/sepia/ttf',
  'public/fonts/quran/hafs/v4/ot-svg/sepia/woff',
  'public/fonts/quran/hafs/v4/ot-svg/sepia/woff2',
];

function collectPageNumbers(sourceBaseDir) {
  const pageNumbers = new Set();

  function walk(currentPath) {
    if (!fs.existsSync(currentPath)) {
      return;
    }

    fs.readdirSync(currentPath)
      .filter((entry) => !entry.startsWith('.'))
      .forEach((entry) => {
        const fullPath = path.join(currentPath, entry);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
          walk(fullPath);
          return;
        }

        const renamedMatch = entry.match(/^p(\d+)\.\w+$/);
        if (renamedMatch) {
          pageNumbers.add(Number(renamedMatch[1]));
          return;
        }

        const sourceMatch = entry.match(/^QCF4(\d+).*?\.\w+$/);
        if (sourceMatch) {
          pageNumbers.add(Number(sourceMatch[1]));
        }
      });
  }

  walk(sourceBaseDir);
  return [...pageNumbers].sort((a, b) => a - b);
}

function main() {
  const sourceBaseDir = process.argv[2];

  if (!sourceBaseDir) {
    console.error('Error: Please provide the source directory path as an argument.');
    console.error('');
    console.error('Usage: node scripts/remove-v4-font-files.js <source-directory>');
    process.exit(1);
  }

  if (!fs.existsSync(sourceBaseDir)) {
    console.error(`Error: Source directory not found: ${sourceBaseDir}`);
    process.exit(1);
  }

  const pageNumbers = collectPageNumbers(sourceBaseDir);
  if (!pageNumbers.length) {
    console.error(`Error: No V4 font files found in ${sourceBaseDir}`);
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('Remove V4 Font Files Script');
  console.log('='.repeat(60));
  console.log(`Source: ${sourceBaseDir}`);
  console.log(`Pages: ${pageNumbers.join(', ')}`);
  console.log('');

  let removed = 0;
  let missing = 0;

  DESTINATION_DIRECTORIES.forEach((relativeDir) => {
    const dirPath = path.join(PROJECT_ROOT, relativeDir);
    const extension =
      path.extname(`x.${path.basename(relativeDir)}`).slice(1) || path.basename(relativeDir);

    pageNumbers.forEach((pageNumber) => {
      const filePath = path.join(dirPath, `p${pageNumber}.${extension}`);
      if (!fs.existsSync(filePath)) {
        missing += 1;
        return;
      }

      fs.unlinkSync(filePath);
      removed += 1;
    });
  });

  console.log(`Removed files: ${removed}`);
  console.log(`Missing files: ${missing}`);
  console.log('');
  console.log('Done!');
}

main();
