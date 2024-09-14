import { useMemo } from 'react';

import { useSelector } from 'react-redux';

import { selectLoadedFontFaces } from '@/redux/slices/QuranReader/font-faces';
import { QuranFont } from '@/types/QuranReader';
import { isQCFFont } from '@/utils/fontFaceHelper';

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
