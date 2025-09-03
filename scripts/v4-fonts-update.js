const fs = require('fs');
const path = require('path');

const directories = [
  { name: 'COLRv1', destination: 'public/fonts/quran/hafs/v4/colrv1' },
  { name: 'OT-SVG DARK', destination: 'public/fonts/quran/hafs/v4/ot-svg/dark' },
  { name: 'OT-SVG LIGHT', destination: 'public/fonts/quran/hafs/v4/ot-svg/light' },
  { name: 'OT-SVG SEPIA', destination: 'public/fonts/quran/hafs/v4/ot-svg/sepia' },
];

const baseDir = process.argv[2];

if (!baseDir) {
  // eslint-disable-next-line no-console
  console.error(
    'Please provide the base directory of the fonts as an argument; which contains [COLRv1, OT-SVG DARK, OT-SVG LIGHT, OT-SVG SEPIA] dirs.',
  );
  process.exit(1);
}

directories.forEach((dir) => {
  const sourceDir = path.join(baseDir, dir.name);
  const files = fs.readdirSync(sourceDir);
  // eslint-disable-next-line no-console
  console.log(`Processing directory: ${dir.name}`, files, sourceDir);
  files.forEach((file) => {
    const ext = path.extname(file);
    const num = file.match(/\d+/)[0].slice(1);
    const newFileName = `p${+num}${ext}`;

    const destDir = path.join(__dirname, '..', dir.destination, ext.slice(1));
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(destDir, newFileName);
    fs.renameSync(sourcePath, destPath);
  });
});
