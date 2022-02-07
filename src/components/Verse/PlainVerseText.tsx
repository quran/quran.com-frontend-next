import React from 'react';

import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';

import GlyphWord from '../dls/QuranWord/GlyphWord';
import TajweedWord from '../dls/QuranWord/TajweedWordImage';
import TextWord from '../dls/QuranWord/TextWord';

import styles from './VerseText.module.scss';

import { selectLoadedFontFaces } from 'src/redux/slices/QuranReader/font-faces';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { getFontClassName, isQCFFont } from 'src/utils/fontFaceHelper';
import { QuranFont } from 'types/QuranReader';
import Word from 'types/Word';

type Props = {
  words: Word[];
};

/**
 * A component to only show the verse text without extra functionalities such as ayah
 * highlighting when audio is playing or showing a tooltip when
 * hovering over a verse or showing the word by word translation/transliteration.
 *
 * @param {Props} param0
 * @returns {JSX.Element}
 */
const PlainVerseText: React.FC<Props> = ({ words }: Props): JSX.Element => {
  const loadedFonts = useSelector(selectLoadedFontFaces);
  const { quranFont, quranTextFontScale, mushafLines } = useSelector(
    selectQuranReaderStyles,
    shallowEqual,
  );
  const isQcfFont = isQCFFont(quranFont);
  const isFontLoaded =
    !isQcfFont || loadedFonts.includes(`p${words[0].pageNumber}-${quranFont.replace('code_', '')}`);
  return (
    <div
      className={classNames(styles.verseTextContainer, styles.tafsirOrTranslationMode, {
        [styles[getFontClassName(quranFont, quranTextFontScale, mushafLines)]]:
          quranFont !== QuranFont.Tajweed,
      })}
    >
      <div className={classNames(styles.verseText, styles.verseTextWrap)}>
        {words?.map((word) => {
          if (isQcfFont) {
            return (
              <GlyphWord
                key={word.location}
                font={quranFont}
                qpcUthmaniHafs={word.qpcUthmaniHafs}
                pageNumber={word.pageNumber}
                textCodeV1={word.codeV1}
                textCodeV2={word.codeV2}
                isFontLoaded={isFontLoaded}
              />
            );
          }
          if (quranFont === QuranFont.Tajweed) {
            return <TajweedWord key={word.location} path={word.text} alt={word.textUthmani} />;
          }
          return (
            <TextWord
              key={word.location}
              font={quranFont}
              text={word.text}
              charType={word.charTypeName}
            />
          );
        })}
      </div>
    </div>
  );
};

export default PlainVerseText;
