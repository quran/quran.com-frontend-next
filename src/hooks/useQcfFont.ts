import { useCallback, useEffect, useRef } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import useThemeDetector from './useThemeDetector';

import { addLoadedFontFace, selectLoadedFontFaces } from '@/redux/slices/QuranReader/font-faces';
import { removeItemFromArray } from '@/utils/array';
import {
  getFontFaceNameForPage,
  getPagesByVerses,
  getQCFFontFaceSource,
  isQCFFont,
} from '@/utils/fontFaceHelper';
import { QuranFont } from 'types/QuranReader';
import Verse from 'types/Verse';

/**
 * This hook manually request the browser to download the font for each page
 * of QCF's V1 and V2 Mushafs. After each resource has been downloaded, we
 * store it in redux so that VerseText can use it to determine whether the fallback
 * text and font should be font or not.
 *
 * Notes, loaded font is reset every time the user switch the font
 * see src/components/Navbar/SettingsDrawer/QuranFontSection.tsx
 *
 * @param {QuranFont} quranFont
 * @param {Verse[]} verses
 */
const useQcfFont = (quranFont: QuranFont, verses: Verse[]) => {
  const currentlyFetchingFonts = useRef([]);
  const dispatch = useDispatch();
  const isFontQCF = isQCFFont(quranFont);
  const loadedFonts = useSelector(selectLoadedFontFaces);
  const { themeVariant } = useThemeDetector();

  const onFontLoaded = useCallback(
    (fontFace: string) => {
      dispatch(addLoadedFontFace(fontFace));
    },
    [dispatch],
  );

  // listen to changes in verses (this is due to infinite scrolling fetching more verses).
  useEffect(() => {
    if (isFontQCF && verses.length > 0) {
      // loop through unique page numbers of the current verses
      getPagesByVerses(verses).forEach((pageNumber) => {
        const fontFaceName = getFontFaceNameForPage(quranFont, pageNumber);
        const fontFace = new FontFace(
          fontFaceName,
          getQCFFontFaceSource(quranFont, pageNumber, themeVariant),
        );
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
  }, [
    quranFont,
    verses,
    loadedFonts,
    isFontQCF,
    currentlyFetchingFonts,
    onFontLoaded,
    themeVariant,
  ]);
};

export default useQcfFont;
