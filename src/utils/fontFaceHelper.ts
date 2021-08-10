import Verse from 'types/Verse';
import { QuranFont } from 'src/components/QuranReader/types';
import { range } from 'lodash';

const QCFFontCodes = [QuranFont.MadaniV1, QuranFont.MadaniV2];

export const isQCFFont = (font: QuranFont) => QCFFontCodes.includes(font);

const getPages = (verses: Verse[]) => {
  const firstPage = verses[0].pageNumber;
  const lastPage = verses[verses.length - 1].pageNumber;

  return range(firstPage, lastPage + 1);
};

const buildV1FontFace = (pageNumber: string | number) => `@font-face {
        font-family: 'p${pageNumber}-v1';
        src: local(QCF_P${String(pageNumber).padStart(3, '0')}),
        url('/fonts/v1/woff2/p${pageNumber}.woff2') format('woff2'),
        url('/fonts/v1/woff/p${pageNumber}.woff') format('woff'),
        url('/fonts/v1/ttf/p${pageNumber}.ttf') format('truetype');
        font-display: swap;
    }`;

const buildV2FontFace = (pageNumber: string | number) => `@font-face {
    font-family: 'p${pageNumber}-v2';
    src: local(QCF2${String(pageNumber).padStart(3, '0')}),
    url('/fonts/v2/woff2/p${pageNumber}.woff2') format('woff2'),
    url('/fonts/v2/woff/p${pageNumber}.woff') format('woff');
    font-display: swap;
 }`;

export const buildQCFFontFace = (verses: Verse[], fontType: QuranFont) => {
  const pageNumbers = getPages(verses);
  let fontFaces;

  if (fontType === QuranFont.MadaniV1) {
    fontFaces = pageNumbers.map((page) => buildV1FontFace(page));
  } else {
    fontFaces = pageNumbers.map((page) => buildV2FontFace(page));
  }

  return fontFaces.join(' ');
};
