/* eslint-disable react-func/max-lines-per-function */
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

/**
 * V4 Fonts Update Script
 *
 * Copies V4 font files from a source directory into the project and only
 * replaces the files present in that source package.
 *
 * Usage: node scripts/v4-fonts-update.js <source-directory>
 *
 * Source directory can be either:
 *   - Flat per theme:
 *     - COLRv1/
 *     - OT-SVG DARK/
 *     - OT-SVG LIGHT/
 *     - OT-SVG SEPIA/
 *   - Or grouped by format within each theme:
 *     - COLRv1/{TTF,WOFF,WOFF2}/
 *     - OT-SVG DARK/{TTF,WOFF,WOFF2}/
 *     - OT-SVG LIGHT/{TTF,WOFF,WOFF2}/
 *     - OT-SVG SEPIA/{TTF,WOFF,WOFF2}/
 *
 * Source files must already be renamed to pXXX.ext format before running
 * this script.
 */

const DIRECTORY_MAPPINGS = [
  {
    label: 'COLRv1',
    sourceAliases: ['COLRv1'],
    destination: 'public/fonts/quran/hafs/v4/colrv1',
  },
  {
    label: 'OT-SVG DARK',
    sourceAliases: ['OT-SVG DARK', 'OT-SVG- DARK'],
    destination: 'public/fonts/quran/hafs/v4/ot-svg/dark',
  },
  {
    label: 'OT-SVG LIGHT',
    sourceAliases: ['OT-SVG LIGHT', 'OT-SVG- LIGHT'],
    destination: 'public/fonts/quran/hafs/v4/ot-svg/light',
  },
  {
    label: 'OT-SVG SEPIA',
    sourceAliases: ['OT-SVG SEPIA', 'OT-SVG- SEPIA'],
    destination: 'public/fonts/quran/hafs/v4/ot-svg/sepia',
  },
];

const FORMAT_MAPPINGS = [
  { sourceDir: 'TTF', destDir: 'ttf' },
  { sourceDir: 'WOFF', destDir: 'woff' },
  { sourceDir: 'WOFF2', destDir: 'woff2' },
];

const PROJECT_ROOT = path.join(__dirname, '..');

function resolveSourceDirPath(sourceBaseDir, aliases) {
  return aliases
    .map((dirName) => path.join(sourceBaseDir, dirName))
    .find((fullPath) => fs.existsSync(fullPath));
}

/**
 * Collect all source font files for a single format, supporting either a flat
 * theme directory or TTF/WOFF/WOFF2 subdirectories.
 * @param {string} sourceDirPath - The theme source directory path
 * @param {string} sourceFormatDir - The format subdirectory name
 * @param {string} extension - The expected file extension
 * @returns {string[]} The source files to copy
 */
function collectSourceFiles(sourceDirPath, sourceFormatDir, extension) {
  const nestedDirPath = path.join(sourceDirPath, sourceFormatDir);
  const directoriesToRead = fs.existsSync(nestedDirPath) ? [nestedDirPath] : [sourceDirPath];

  return directoriesToRead.flatMap((dirPath) =>
    fs
      .readdirSync(dirPath)
      .filter((f) => !f.startsWith('.') && new RegExp(`^p\\d+\\.${extension}$`).test(f))
      .map((file) => path.join(dirPath, file)),
  );
}

/**
 * Copy all font files from source to destination
 * @param {string[]} sourceFiles - The source font files
 * @param {string} destPath - The destination directory path
 * @returns {{copied: number, overwritten: number}} The copy results
 */
function copyFontFiles(sourceFiles, destPath) {
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath, { recursive: true });
  }

  let copied = 0;
  let overwritten = 0;

  sourceFiles.forEach((sourceFile) => {
    const file = path.basename(sourceFile);
    const destFile = path.join(destPath, file);

    if (fs.existsSync(destFile)) {
      overwritten += 1;
    } else {
      copied += 1;
    }

    fs.copyFileSync(sourceFile, destFile);
  });

  return { copied, overwritten };
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

  let totalCopied = 0;
  let totalOverwritten = 0;

  DIRECTORY_MAPPINGS.forEach((mapping) => {
    const sourceDirPath = resolveSourceDirPath(sourceBaseDir, mapping.sourceAliases);

    if (!sourceDirPath) {
      console.log(`\n${mapping.label}: NOT FOUND - skipping`);
      return;
    }

    console.log(`\n${mapping.label} → ${mapping.destination}`);
    console.log(`  source: ${path.basename(sourceDirPath)}`);
    console.log('-'.repeat(50));

    FORMAT_MAPPINGS.forEach((format) => {
      const destPath = path.join(PROJECT_ROOT, mapping.destination, format.destDir);
      const sourceFiles = collectSourceFiles(sourceDirPath, format.sourceDir, format.destDir);

      if (!sourceFiles.length) {
        console.log(`  ${format.destDir}: no source files found - skipping`);
        return;
      }

      const result = copyFontFiles(sourceFiles, destPath);
      totalCopied += result.copied;
      totalOverwritten += result.overwritten;

      console.log(
        `  ${format.destDir}: copied ${result.copied}, overwritten ${result.overwritten}`,
      );
    });
  });

  console.log('');
  console.log('='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  console.log(`Total files copied: ${totalCopied}`);
  console.log(`Total files overwritten: ${totalOverwritten}`);
  console.log('');
  console.log('Done!');
}

main();
