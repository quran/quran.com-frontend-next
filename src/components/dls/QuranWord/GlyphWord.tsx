/* eslint-disable react/no-danger */

import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';

import styles from './GlyphWord.module.scss';

import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { CharType } from '@/types/Word';
import { isFirefox } from '@/utils/device-detector';
import { getFontClassName, getFontFaceNameForPage } from '@/utils/fontFaceHelper';
import { FALLBACK_FONT, QuranFont } from 'types/QuranReader';

type UthmaniWordTextProps = {
  qpcUthmaniHafs: string;
  textCodeV1?: string;
  textCodeV2?: string;
  pageNumber: number;
  font: QuranFont;
  isFontLoaded: boolean;
  isHighlighted?: boolean;
  charType?: CharType;
};

/**
 * Get the text of the verse's word. This is used to show textUthmani as a fallback
 * until V1/V2 font faces of the current word's page (e.g. p1-v1 or p50-v2) has finished downloading.
 *
 * @param {string} qpcUthmaniHafs
 * @param {string} textCodeV1
 * @param {string} textCodeV2
 * @param {QuranFont} font
 * @param {boolean} isFontLoaded
 * @returns {string}
 */
const getWordText = (
  qpcUthmaniHafs: string,
  textCodeV1: string,
  textCodeV2: string,
  font: QuranFont,
  isFontLoaded: boolean,
): string => {
  if (!isFontLoaded) {
    return qpcUthmaniHafs;
  }
  return font === QuranFont.MadaniV1 ? textCodeV1 : textCodeV2;
};

const GlyphWord = ({
  qpcUthmaniHafs,
  textCodeV1,
  textCodeV2,
  pageNumber,
  font,
  isFontLoaded,
  isHighlighted,
  charType,
}: UthmaniWordTextProps) => {
  const { quranTextFontScale, mushafLines } = useSelector(selectQuranReaderStyles, shallowEqual);

  // The extra space before the glyph should only be added where the issue occurs,
  // which is in firefox with the Madani V1 Mushaf and the font scale is less than 6
  const addExtraSpace = isFirefox() && font === QuranFont.MadaniV1 && quranTextFontScale < 6;

  return (
    <span
      dangerouslySetInnerHTML={{
        __html: `${addExtraSpace ? ` ` : ``}${getWordText(
          qpcUthmaniHafs,
          textCodeV1,
          textCodeV2,
          font,
          isFontLoaded,
        )}`,
      }}
      data-font-scale={quranTextFontScale}
      data-font={font}
      className={classNames(styles.styledWord, {
        [styles.tajweedTextHighlighted]:
          font === QuranFont.TajweedV4 && charType !== CharType.End && isHighlighted,
        [styles.wordSpacing]: addExtraSpace,
        [styles.fallbackText]: !isFontLoaded,
        [styles[getFontClassName(FALLBACK_FONT, quranTextFontScale, mushafLines, true)]]:
          !isFontLoaded,
      })}
      {...(isFontLoaded && {
        style: { fontFamily: getFontFaceNameForPage(font, pageNumber) },
      })}
    />
  );
};
export default GlyphWord;
