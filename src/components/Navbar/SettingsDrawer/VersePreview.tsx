import { useEffect } from 'react';

import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import useSWR from 'swr';

import styles from './VersePreview.module.scss';

import PlainVerseText from '@/components/Verse/PlainVerseText';
import TajweedFontPalettes from '@/components/Verse/TajweedFontPalettes';
import Skeleton from '@/dls/Skeleton/Skeleton';
import useThemeDetector from '@/hooks/useThemeDetector';
import { addLoadedFontFace } from '@/redux/slices/QuranReader/font-faces';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { selectTheme } from '@/redux/slices/theme';
import ThemeType from '@/redux/types/ThemeType';
import { getFontFaceNameForPage, getQCFFontFaceSource, isQCFFont } from '@/utils/fontFaceHelper';
import getSampleVerse from '@/utils/sampleVerse';
import { QuranFont } from 'types/QuranReader';
import Word from 'types/Word';

const SWR_SAMPLE_VERSE_KEY = 'sample-verse';
const VersePreview = () => {
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
    <div dir="rtl">
      <TajweedFontPalettes
        pageNumber={sampleVerse.pageNumber}
        quranFont={quranReaderStyles.quranFont}
      />
      <PlainVerseText words={sampleVerse.words as Word[]} />
    </div>
  );
};

export default VersePreview;
