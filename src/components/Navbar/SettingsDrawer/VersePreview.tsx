import { useEffect } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import useSWR from 'swr';

import styles from './VersePreview.module.scss';

import TranslationText from '@/components/QuranReader/TranslationView/TranslationText';
import TajweedFontPalettes from '@/components/Verse/TajweedFontPalettes';
import VerseText from '@/components/Verse/VerseText';
import Skeleton from '@/dls/Skeleton/Skeleton';
import { TooltipType } from '@/dls/Tooltip';
import useThemeDetector from '@/hooks/useThemeDetector';
import { addLoadedFontFace } from '@/redux/slices/QuranReader/font-faces';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { selectTheme } from '@/redux/slices/theme';
import ThemeType from '@/redux/types/ThemeType';
import { QuranFont } from '@/types/QuranReader';
import { getFontFaceNameForPage, getQCFFontFaceSource, isQCFFont } from '@/utils/fontFaceHelper';
import getSampleVerse from '@/utils/sampleVerse';
import Word from 'types/Word';

const SWR_SAMPLE_VERSE_KEY = 'sample-verse';
const VersePreview = () => {
  const { t } = useTranslation('common');
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const settingsTheme: { type: ThemeType } = useSelector(selectTheme, shallowEqual);
  const { themeVariant } = useThemeDetector();
  const { data: sampleVerse } = useSWR(SWR_SAMPLE_VERSE_KEY, () => getSampleVerse());
  const dispatch = useDispatch();

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

  if (!sampleVerse) {
    return (
      <>
        <div className={styles.skeletonContainer}>
          <Skeleton>
            <div className={styles.skeletonPlaceholder} />
          </Skeleton>
        </div>
        <div className={styles.skeletonContainer}>
          <Skeleton>
            <div className={styles.skeletonPlaceholder} />
          </Skeleton>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={styles.previewTitle}>{t('verse-preview-title')}</div>
      <div dir="rtl" className={styles.container}>
        <TajweedFontPalettes
          pageNumber={sampleVerse.pageNumber}
          quranFont={quranReaderStyles.quranFont}
        />
        <VerseText
          words={sampleVerse.words as Word[]}
          tooltipType={TooltipType.SUCCESS}
          isRecitationDisabled={true}
        />
        <TranslationText
          translationFontScale={quranReaderStyles.translationFontScale}
          text={sampleVerse.translations?.[0]?.text}
          languageId={sampleVerse.translations?.[0]?.languageId}
          className={styles.translationText}
        />
      </div>
    </>
  );
};

export default VersePreview;
