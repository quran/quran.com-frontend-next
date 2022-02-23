import { useEffect } from 'react';

import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import useSWR from 'swr';

import styles from './VersePreview.module.scss';

import Skeleton from 'src/components/dls/Skeleton/Skeleton';
import PlainVerseText from 'src/components/Verse/PlainVerseText';
import { addLoadedFontFace } from 'src/redux/slices/QuranReader/font-faces';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import {
  getFontFaceNameForPage,
  getV1OrV2FontFaceSource,
  isQCFFont,
} from 'src/utils/fontFaceHelper';
import getSampleVerse from 'src/utils/sampleVerse';
import { QuranFont } from 'types/QuranReader';
import Word from 'types/Word';

const SWR_SAMPLE_VERSE_KEY = 'sample-verse';
const VersePreview = () => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const isTajweed = quranReaderStyles.quranFont === QuranFont.Tajweed;
  const { data: sampleVerse } = useSWR(SWR_SAMPLE_VERSE_KEY, () => getSampleVerse());
  const dispatch = useDispatch();
  useEffect(() => {
    if (isQCFFont(quranReaderStyles.quranFont) && sampleVerse) {
      const isV1 = quranReaderStyles.quranFont === QuranFont.MadaniV1;
      // eslint-disable-next-line i18next/no-literal-string
      const fontFaceName = getFontFaceNameForPage(isV1, sampleVerse.pageNumber);
      const fontFace = new FontFace(
        fontFaceName,
        getV1OrV2FontFaceSource(isV1, sampleVerse.pageNumber),
      );
      document.fonts.add(fontFace);
      fontFace.load().then(() => {
        dispatch(addLoadedFontFace(fontFaceName));
      });
    }
  }, [dispatch, quranReaderStyles.quranFont, sampleVerse]);

  if (!sampleVerse)
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

  // BE return the path to the png image of each word, instead of returning the text. So we're mocking the same behavior here
  let verse;
  if (isTajweed)
    verse = {
      ...sampleVerse,
      words: sampleVerse.words.map((word) => ({ ...word, text: word.textImage })),
    };
  else verse = sampleVerse;

  return (
    <div dir="rtl">
      <PlainVerseText words={verse.words as Word[]} isReadingMode />
    </div>
  );
};

export default VersePreview;
