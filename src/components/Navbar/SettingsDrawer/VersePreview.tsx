import { useEffect } from 'react';

import classNames from 'classnames';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import useSWR from 'swr';

import styles from './VersePreview.module.scss';
import VersePreviewSkeleton from './VersePreviewSkeleton';
import VersePreviewWord from './VersePreviewWord';

import useIsFontLoaded from '@/components/QuranReader/hooks/useIsFontLoaded';
import SeoTextForVerse from '@/components/Verse/SeoTextForVerse';
import TajweedFontPalettes from '@/components/Verse/TajweedFontPalettes';
import verseTextStyles from '@/components/Verse/VerseText.module.scss';
import GlyphWord from '@/dls/QuranWord/GlyphWord';
import TextWord from '@/dls/QuranWord/TextWord';
import useThemeDetector from '@/hooks/useThemeDetector';
import { addLoadedFontFace } from '@/redux/slices/QuranReader/font-faces';
import { selectInlineDisplayWordByWordPreferences } from '@/redux/slices/QuranReader/readingPreferences';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { selectTheme } from '@/redux/slices/theme';
import ThemeType from '@/redux/types/ThemeType';
import { QuranFont } from '@/types/QuranReader';
import {
  getFontClassName,
  getFontFaceNameForPage,
  getQCFFontFaceSource,
  isQCFFont,
} from '@/utils/fontFaceHelper';
import getSampleVerse from '@/utils/sampleVerse';
import Word from 'types/Word';

const SWR_SAMPLE_VERSE_KEY = 'sample-verse';
const VersePreview = () => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const settingsTheme: { type: ThemeType } = useSelector(selectTheme, shallowEqual);
  const { themeVariant } = useThemeDetector();
  const { data: sampleVerse } = useSWR(SWR_SAMPLE_VERSE_KEY, () => getSampleVerse());
  const dispatch = useDispatch();
  const { showWordByWordTranslation, showWordByWordTransliteration } = useSelector(
    selectInlineDisplayWordByWordPreferences,
    shallowEqual,
  );

  useEffect(() => {
    if (isQCFFont(quranReaderStyles.quranFont) && sampleVerse) {
      const fontFaceName = getFontFaceNameForPage(
        quranReaderStyles.quranFont as QuranFont,
        sampleVerse.pageNumber,
      );
      const fontFace = new FontFace(
        fontFaceName,
        getQCFFontFaceSource(
          quranReaderStyles.quranFont as QuranFont,
          sampleVerse.pageNumber,
          themeVariant,
        ),
      );
      document.fonts.add(fontFace);
      fontFace.load().then(() => {
        dispatch(addLoadedFontFace(fontFaceName));
      });
    }
  }, [dispatch, quranReaderStyles.quranFont, sampleVerse, settingsTheme, themeVariant]);

  const pageNumberForFont = sampleVerse?.pageNumber;
  const isFontLoaded = useIsFontLoaded(pageNumberForFont, quranReaderStyles.quranFont);
  const isQcfFont = isQCFFont(quranReaderStyles.quranFont);

  if (!sampleVerse) {
    return <VersePreviewSkeleton />;
  }
  const translation = sampleVerse?.translations?.[0];
  const words = sampleVerse?.words as Word[];

  return (
    <div className={styles.previewContainer}>
      <div dir="rtl">
        <SeoTextForVerse words={words} />
        <TajweedFontPalettes
          pageNumber={sampleVerse.pageNumber}
          quranFont={quranReaderStyles.quranFont}
        />
        <div
          className={classNames(
            verseTextStyles.verseTextContainer,
            verseTextStyles.tafsirOrTranslationMode,
            verseTextStyles[
              getFontClassName(
                quranReaderStyles.quranFont,
                quranReaderStyles.quranTextFontScale,
                quranReaderStyles.mushafLines,
              )
            ],
          )}
        >
          <div
            className={classNames(verseTextStyles.verseText, verseTextStyles.verseTextWrap)}
            translate="no"
          >
            {words?.map((word) => {
              if (isQcfFont) {
                return (
                  <VersePreviewWord
                    key={word.location}
                    word={word}
                    shouldShowInlineTranslation={showWordByWordTranslation}
                    shouldShowInlineTransliteration={showWordByWordTransliteration}
                    shouldShowTooltip
                  >
                    <GlyphWord
                      font={quranReaderStyles.quranFont}
                      qpcUthmaniHafs={word.qpcUthmaniHafs}
                      pageNumber={word.pageNumber}
                      textCodeV1={word.codeV1}
                      textCodeV2={word.codeV2}
                      isFontLoaded={isFontLoaded}
                    />
                  </VersePreviewWord>
                );
              }
              return (
                <VersePreviewWord
                  key={word.location}
                  word={word}
                  shouldShowInlineTranslation={showWordByWordTranslation}
                  shouldShowInlineTransliteration={showWordByWordTransliteration}
                  shouldShowTooltip
                >
                  <TextWord
                    font={quranReaderStyles.quranFont}
                    text={word.text}
                    charType={word.charTypeName}
                  />
                </VersePreviewWord>
              );
            })}
          </div>
        </div>
      </div>
      {translation && (
        <div className={styles.translationText} dir="ltr">
          {translation.text}
        </div>
      )}
    </div>
  );
};

export default VersePreview;
