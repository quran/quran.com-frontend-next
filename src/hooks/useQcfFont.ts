import { useEffect, useCallback, useRef } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import {
  resetLoadedFontFaces,
  selectLoadedFontFaces,
  addLoadedFontFace,
} from 'src/redux/slices/QuranReader/font-faces';
import { removeItemFromArray } from 'src/utils/array';
import {
  getFontFaceName,
  getFontFaceSource,
  getVersesPages,
  isQCFFont,
} from 'src/utils/fontFaceHelper';
import { QuranFont } from 'types/QuranReader';
import Verse from 'types/Verse';

/**
 * This hook manually request the browser to download the font for each page
 * of QCF's V1 and V2 Mushafs. After each resource has been downloaded, we
 * store it in redux so that VerseText can use it to determine whether the fallback
 * text and font should be font or not.
 *
 * @param {QuranFont} quranFont
 * @param {Verse[]} verses
 */
const useQcfFont = (quranFont: QuranFont, verses: Verse[]) => {
  const currentlyFetchingFonts = useRef([]);
  const dispatch = useDispatch();
  const isFontQCF = isQCFFont(quranFont);
  const loadedFonts = useSelector(selectLoadedFontFaces);
  const onFontLoaded = useCallback(
    (fontFace: string) => {
      dispatch(addLoadedFontFace(fontFace));
    },
    [dispatch],
  );

  useEffect(() => {
    // reset the loaded Fonts when we switch the font
    dispatch(resetLoadedFontFaces());
  }, [dispatch, quranFont]);

  // listen to changes in verses (this is due to infinite scrolling fetching more verses).
  useEffect(() => {
    if (isFontQCF) {
      // loop through unique page numbers of the current verses
      getVersesPages(verses).forEach((pageNumber) => {
        const isV1 = quranFont === QuranFont.MadaniV1;
        const fontFaceName = getFontFaceName(isV1, pageNumber);
        const fontFace = new FontFace(fontFaceName, getFontFaceSource(isV1, pageNumber));
        // we only want to load fonts that were not loaded and also are not currently being loaded
        if (
          !currentlyFetchingFonts.current.includes(fontFaceName) &&
          !loadedFonts.includes(fontFaceName)
        ) {
          currentlyFetchingFonts.current = [...currentlyFetchingFonts.current, fontFaceName];
          fontFace.display = 'block';
          document.fonts.add(fontFace);
          // load the font-face programmatically
          fontFace
            .load()
            .then(() => {
              // store the font face in Redux slice
              onFontLoaded(fontFaceName);
            })
            .finally(() => {
              // whether we failed or succeeded to fetch the fontFace, we remove it from currently fetching array
              currentlyFetchingFonts.current = removeItemFromArray(
                fontFaceName,
                currentlyFetchingFonts.current,
              );
            });
        }
      });
    }
  }, [quranFont, verses, loadedFonts, isFontQCF, currentlyFetchingFonts, onFontLoaded]);
};

export default useQcfFont;
