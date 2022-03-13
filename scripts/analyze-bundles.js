const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const bundle = require('../.next/build-manifest.json');

const prefix = '.next';
const outDir = path.join(process.cwd(), prefix, 'analyze');
const outFile = path.join(outDir, 'bundle-comparison.txt');

function formatBytes(bytes, signed = false) {
  // eslint-disable-next-line no-nested-ternary
  const sign = signed ? (bytes < 0 ? '-' : '+') : '';
  if (bytes === 0) return `${sign}0B`;

  const k = 1024;
  const dm = 2;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));

  return `${sign}${parseFloat(Math.abs(bytes / k ** i).toFixed(dm))}${sizes[i]}`;
}

const pageSizes = Object.keys(bundle.pages).map((p) => {
  const files = bundle.pages[p];
  const size = files
    .map((filename) => {
      const fn = path.join(process.cwd(), prefix, filename);
      const bytes = fs.readFileSync(fn);
      const gzipped = zlib.gzipSync(bytes);
      return gzipped.byteLength;
    })
    .reduce((s, b) => s + b, 0);

  return { path: p, size };
});

// Produce a Markdown table with each page & its size
const sizes = pageSizes
  .map(({ path: pagePath, size }) => `| \`${pagePath}\` | ${formatBytes(size)} |`)
  .join('\n');

const output = `# Bundle Size
| Route | Size (gzipped) |
| --- | --- |
${sizes}
<!-- GH BOT -->`;

try {
  fs.mkdirSync(outDir);
} catch (e) {
  // may already exist
}

fs.writeFileSync(outFile, output);
