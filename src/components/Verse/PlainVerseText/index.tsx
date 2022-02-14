import React from 'react';

import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';

import styles from '../VerseText.module.scss';

import PlainVerseTextWord from './PlainVerseTextWord';

import GlyphWord from 'src/components/dls/QuranWord/GlyphWord';
import TajweedWord from 'src/components/dls/QuranWord/TajweedWordImage';
import TextWord from 'src/components/dls/QuranWord/TextWord';
import { selectLoadedFontFaces } from 'src/redux/slices/QuranReader/font-faces';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { getFontClassName, isQCFFont } from 'src/utils/fontFaceHelper';
import { QuranFont } from 'types/QuranReader';
import Word from 'types/Word';

type Props = {
  words: Word[];
  shouldShowWordByWordTranslation?: boolean;
  shouldShowWordByWordTransliteration?: boolean;
};

/**
 * A component to only show the verse text without extra functionalities such as ayah
 * highlighting when audio is playing or showing a tooltip when
 * hovering over a verse or showing the word by word translation/transliteration.
 *
 * @param {Props} param0
 * @returns {JSX.Element}
 */
const PlainVerseText: React.FC<Props> = ({
  words,
  shouldShowWordByWordTranslation = false,
  shouldShowWordByWordTransliteration = false,
}: Props): JSX.Element => {
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
              <PlainVerseTextWord
                key={word.location}
                word={word}
                shouldShowWordByWordTranslation={shouldShowWordByWordTranslation}
                shouldShowWordByWordTransliteration={shouldShowWordByWordTransliteration}
              >
                <GlyphWord
                  font={quranFont}
                  qpcUthmaniHafs={word.qpcUthmaniHafs}
                  pageNumber={word.pageNumber}
                  textCodeV1={word.codeV1}
                  textCodeV2={word.codeV2}
                  isFontLoaded={isFontLoaded}
                />
              </PlainVerseTextWord>
            );
          }
          if (quranFont === QuranFont.Tajweed) {
            return (
              <PlainVerseTextWord
                key={word.location}
                word={word}
                shouldShowWordByWordTranslation={shouldShowWordByWordTranslation}
                shouldShowWordByWordTransliteration={shouldShowWordByWordTransliteration}
              >
                <TajweedWord key={word.location} path={word.text} alt={word.textUthmani} />
              </PlainVerseTextWord>
            );
          }
          return (
            <PlainVerseTextWord
              key={word.location}
              word={word}
              shouldShowWordByWordTranslation={shouldShowWordByWordTranslation}
              shouldShowWordByWordTransliteration={shouldShowWordByWordTransliteration}
            >
              <TextWord font={quranFont} text={word.text} charType={word.charTypeName} />
            </PlainVerseTextWord>
          );
        })}
      </div>
    </div>
  );
};

export default PlainVerseText;
