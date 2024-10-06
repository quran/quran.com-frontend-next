import React from 'react';

import { QuranFont } from '@/types/QuranReader';
import { getFontFaceNameForPage } from '@/utils/fontFaceHelper';

type Props = {
  quranFont: QuranFont;
  pageNumber: number;
};

const TajweedFontPalettes: React.FC<Props> = ({ quranFont, pageNumber }) => {
  // don't load if it's not V4 font
  if (quranFont !== QuranFont.TajweedV4) {
    return <></>;
  }
  const fontFamily = getFontFaceNameForPage(quranFont, pageNumber);
  // The base palettes 0, 1, 2 are the embedded pallettes inside the font files for sepia, dark, and light modes.
  return (
    <style>
      {`
@font-palette-values --Sepia {
  font-family: '${fontFamily}';
    base-palette: 2;
}

@font-palette-values --Dark {
    font-family: '${fontFamily}';
    base-palette: 1;
}

@font-palette-values --Light {
    font-family: '${fontFamily}';
    base-palette: 0;
}
        `}
    </style>
  );
};

export default TajweedFontPalettes;
