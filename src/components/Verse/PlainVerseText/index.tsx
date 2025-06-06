import React from 'react';

import classNames from 'classnames';
import { shallowEqual, useSelector } from 'react-redux';

import SeoTextForVerse from '../SeoTextForVerse';
import TajweedFontPalettes from '../TajweedFontPalettes';
import styles from '../VerseText.module.scss';

import PlainVerseTextWord from './PlainVerseTextWord';

import useIsFontLoaded from '@/components/QuranReader/hooks/useIsFontLoaded';
import GlyphWord from '@/dls/QuranWord/GlyphWord';
import TextWord from '@/dls/QuranWord/TextWord';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { QuranFont } from '@/types/QuranReader';
import { getFontClassName, isQCFFont } from '@/utils/fontFaceHelper';
import Word from 'types/Word';

type Props = {
  words: Word[];
  shouldShowWordByWordTranslation?: boolean;
  shouldShowWordByWordTransliteration?: boolean;
  fontScale?: number;
  quranFont?: QuranFont;
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
  fontScale,
  quranFont: quranFontFromProps,
}: Props): JSX.Element => {
  const {
    quranFont: quranFontFromStore,
    quranTextFontScale,
    mushafLines,
  } = useSelector(selectQuranReaderStyles, shallowEqual);
  const quranFont = quranFontFromProps || quranFontFromStore;
  const isQcfFont = isQCFFont(quranFont);
  const { pageNumber } = words[0];
  const isFontLoaded = useIsFontLoaded(pageNumber, quranFont);
  return (
    <>
      <SeoTextForVerse words={words} />
      <TajweedFontPalettes pageNumber={pageNumber} quranFont={quranFont} />
      <div
        className={classNames(
          styles.verseTextContainer,
          styles.tafsirOrTranslationMode,
          styles[getFontClassName(quranFont, fontScale || quranTextFontScale, mushafLines)],
        )}
      >
        <div className={classNames(styles.verseText, styles.verseTextWrap)} translate="no">
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
    </>
  );
};

export default PlainVerseText;
