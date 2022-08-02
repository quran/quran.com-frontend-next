import { useMemo } from 'react';

import { useSelector } from 'react-redux';

import { selectLoadedFontFaces } from 'src/redux/slices/QuranReader/font-faces';
import { isQCFFont } from 'src/utils/fontFaceHelper';
import { QuranFont } from 'types/QuranReader';

/**
 * A hook that detects whether a font of a specific page
 * has been loaded or not.
 *
 * @param {number} pageNumber
 * @param {QuranFont} quranFont
 * @returns {boolean}
 */
const useIsFontLoaded = (pageNumber: number, quranFont: QuranFont): boolean => {
  const loadedFonts = useSelector(selectLoadedFontFaces);
  const isFontLoaded = useMemo(() => {
    if (!isQCFFont(quranFont)) {
      return true;
    }
    return loadedFonts.includes(`p${pageNumber}-${quranFont.replace('code_', '')}`);
  }, [loadedFonts, pageNumber, quranFont]);
  return isFontLoaded;
};

export default useIsFontLoaded;
