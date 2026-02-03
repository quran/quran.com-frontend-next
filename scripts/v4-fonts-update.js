/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

/**
 * V4 Fonts Update Script
 *
 * Copies all V4 font files from source directory to the project.
 * Removes old files first, then copies new ones.
 *
 * Usage: node scripts/v4-fonts-update.js <source-directory>
 *
 * Source directory should contain (with files already renamed to pXXX.ext format):
 *   - COLRv1/{TTF,WOFF,WOFF2}/
 *   - OT-SVG DARK/{TTF,WOFF,WOFF2}/
 *   - OT-SVG LIGHT/{TTF,WOFF,WOFF2}/
 *   - OT-SVG SEPIA/{TTF,WOFF,WOFF2}/
 *
 * Files will be placed in:
 *   - public/fonts/quran/hafs/v4/colrv1/{ttf,woff,woff2}/
 *   - public/fonts/quran/hafs/v4/ot-svg/dark/{ttf,woff,woff2}/
 *   - public/fonts/quran/hafs/v4/ot-svg/light/{ttf,woff,woff2}/
 *   - public/fonts/quran/hafs/v4/ot-svg/sepia/{ttf,woff,woff2}/
 */

const DIRECTORY_MAPPINGS = [
  { source: 'COLRv1', destination: 'public/fonts/quran/hafs/v4/colrv1' },
  { source: 'OT-SVG DARK', destination: 'public/fonts/quran/hafs/v4/ot-svg/dark' },
  { source: 'OT-SVG LIGHT', destination: 'public/fonts/quran/hafs/v4/ot-svg/light' },
  { source: 'OT-SVG SEPIA', destination: 'public/fonts/quran/hafs/v4/ot-svg/sepia' },
];

const FORMAT_MAPPINGS = [
  { sourceDir: 'TTF', destDir: 'ttf' },
  { sourceDir: 'WOFF', destDir: 'woff' },
  { sourceDir: 'WOFF2', destDir: 'woff2' },
];

const PROJECT_ROOT = path.join(__dirname, '..');

/**
 * Remove all font files from a directory (keeps the directory)
 * @param {string} dirPath - The directory path to clear
 * @returns {number} The number of files removed
 */
function clearDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return 0;
  }

  const files = fs.readdirSync(dirPath).filter((f) => !f.startsWith('.'));
  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isFile()) {
      fs.unlinkSync(filePath);
    }
  });

  return files.length;
}

/**
 * Copy all font files from source to destination
 * @param {string} sourcePath - The source directory path
 * @param {string} destPath - The destination directory path
 * @returns {{copied: number, skipped: number, notFound: boolean}} The copy results
 */
function copyFontFiles(sourcePath, destPath) {
  if (!fs.existsSync(sourcePath)) {
    return { copied: 0, skipped: 0, notFound: true };
  }

  // Ensure destination directory exists
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath, { recursive: true });
  }

  const files = fs.readdirSync(sourcePath).filter((f) => {
    // Only copy font files (p*.ext format), skip any other files
    return !f.startsWith('.') && /^p\d+\.\w+$/.test(f);
  });

  let copied = 0;
  let skipped = 0;

  files.forEach((file) => {
    const sourceFile = path.join(sourcePath, file);
    const destFile = path.join(destPath, file);

    if (fs.statSync(sourceFile).isFile()) {
      fs.copyFileSync(sourceFile, destFile);
      copied += 1;
    } else {
      skipped += 1;
    }
  });

  return { copied, skipped, notFound: false };
}

function main() {
  const sourceBaseDir = process.argv[2];

  if (!sourceBaseDir) {
    console.error('Error: Please provide the source directory path as an argument.');
    console.error('');
    console.error('Usage: node scripts/v4-fonts-update.js <source-directory>');
    console.error('');
    console.error('Make sure to run v4-fonts-rename.js first to rename the files.');
    process.exit(1);
  }

  if (!fs.existsSync(sourceBaseDir)) {
    console.error(`Error: Source directory not found: ${sourceBaseDir}`);
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('V4 Fonts Update Script');
  console.log('='.repeat(60));
  console.log(`Source: ${sourceBaseDir}`);
  console.log(`Destination: ${PROJECT_ROOT}/public/fonts/quran/hafs/v4/`);
  console.log('');

  let totalRemoved = 0;
  let totalCopied = 0;

  DIRECTORY_MAPPINGS.forEach((mapping) => {
    const sourceDirPath = path.join(sourceBaseDir, mapping.source);

    if (!fs.existsSync(sourceDirPath)) {
      console.log(`\n${mapping.source}: NOT FOUND - skipping`);
      return;
    }

    console.log(`\n${mapping.source} → ${mapping.destination}`);
    console.log('-'.repeat(50));

    FORMAT_MAPPINGS.forEach((format) => {
      const sourcePath = path.join(sourceDirPath, format.sourceDir);
      const destPath = path.join(PROJECT_ROOT, mapping.destination, format.destDir);

      // Clear existing files
      const removed = clearDirectory(destPath);
      totalRemoved += removed;

      // Copy new files
      const result = copyFontFiles(sourcePath, destPath);
      totalCopied += result.copied;

      if (result.notFound) {
        console.log(`  ${format.destDir}: source not found`);
      } else {
        console.log(`  ${format.destDir}: removed ${removed}, copied ${result.copied}`);
      }
    });
  });

  console.log('');
  console.log('='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  console.log(`Total files removed: ${totalRemoved}`);
  console.log(`Total files copied: ${totalCopied}`);
  console.log('');
  console.log('Done!');
}

main();
