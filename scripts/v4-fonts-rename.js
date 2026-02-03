/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

/**
 * V4 Fonts Rename Script
 *
 * Renames all font files in the source directory from
 * QCF4XXX_COLOR-Regular.ext to pXXX.ext format (in place).
 *
 * Usage: node scripts/v4-fonts-rename.js <source-directory>
 *
 * Source directory should contain:
 *   - COLRv1/{TTF,WOFF,WOFF2}/
 *   - COLRv1-Dark Mode Firefox/{TTF,WOFF,WOFF2}/
 *   - OT-SVG DARK/{TTF,WOFF,WOFF2}/
 *   - OT-SVG LIGHT/{TTF,WOFF,WOFF2}/
 *   - OT-SVG SEPIA/{TTF,WOFF,WOFF2}/
 */

const FONT_DIRECTORIES = [
  'COLRv1',
  'COLRv1-Dark Mode Firefox',
  'OT-SVG DARK',
  'OT-SVG LIGHT',
  'OT-SVG SEPIA',
];

const FORMAT_SUBDIRS = ['TTF', 'WOFF', 'WOFF2'];

/**
 * Extract page number from filename like QCF4001_COLOR-Regular.woff2
 * Returns the number without leading zeros (e.g., 1 from QCF4001)
 * @param {string} filename - The filename to extract page number from
 * @returns {number | null} The page number or null if not found
 */
function extractPageNumber(filename) {
  const match = filename.match(/QCF4(\d+)/);
  if (!match) return null;
  return parseInt(match[1], 10);
}

/**
 * Get file extension in lowercase
 * @param {string} filename - The filename to extract extension from
 * @returns {string} The file extension in lowercase
 */
function getExtension(filename) {
  return path.extname(filename).toLowerCase();
}

/**
 * Rename all font files in a directory
 * @param {string} dirPath - The directory path to rename files in
 * @returns {{renamed: number, skipped: number, notFound: boolean}} The rename results
 */
function renameFilesInDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return { renamed: 0, skipped: 0, notFound: true };
  }

  const files = fs.readdirSync(dirPath).filter((f) => !f.startsWith('.'));
  let renamed = 0;
  let skipped = 0;

  files.forEach((file) => {
    // Skip if already renamed (starts with 'p' and has only numbers)
    if (/^p\d+\.\w+$/.test(file)) {
      skipped += 1;
      return;
    }

    const pageNum = extractPageNumber(file);
    if (pageNum === null) {
      console.log(`    Skipping: ${file} (unexpected format)`);
      skipped += 1;
      return;
    }

    const ext = getExtension(file);
    const newFileName = `p${pageNum}${ext}`;
    const oldPath = path.join(dirPath, file);
    const newPath = path.join(dirPath, newFileName);

    fs.renameSync(oldPath, newPath);
    renamed += 1;
  });

  return { renamed, skipped, notFound: false };
}

function main() {
  const sourceBaseDir = process.argv[2];

  if (!sourceBaseDir) {
    console.error('Error: Please provide the source directory path as an argument.');
    console.error('');
    console.error('Usage: node scripts/v4-fonts-rename.js <source-directory>');
    process.exit(1);
  }

  if (!fs.existsSync(sourceBaseDir)) {
    console.error(`Error: Source directory not found: ${sourceBaseDir}`);
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('V4 Fonts Rename Script');
  console.log('='.repeat(60));
  console.log(`Directory: ${sourceBaseDir}`);
  console.log('');
  console.log('Renaming files from QCF4XXX_COLOR-Regular.ext to pXXX.ext');
  console.log('');

  let totalRenamed = 0;
  let totalSkipped = 0;

  FONT_DIRECTORIES.forEach((fontDir) => {
    const fontDirPath = path.join(sourceBaseDir, fontDir);

    if (!fs.existsSync(fontDirPath)) {
      console.log(`\n${fontDir}: not found, skipping`);
      return;
    }

    console.log(`\n${fontDir}:`);

    FORMAT_SUBDIRS.forEach((formatDir) => {
      const fullPath = path.join(fontDirPath, formatDir);
      const result = renameFilesInDirectory(fullPath);

      if (result.notFound) {
        console.log(`  ${formatDir}: not found`);
      } else {
        console.log(`  ${formatDir}: renamed ${result.renamed}, skipped ${result.skipped}`);
        totalRenamed += result.renamed;
        totalSkipped += result.skipped;
      }
    });
  });

  console.log('');
  console.log('='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  console.log(`Total files renamed: ${totalRenamed}`);
  console.log(`Total files skipped: ${totalSkipped}`);
  console.log('');
  console.log('Done!');
}

main();
