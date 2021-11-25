import { useSelector, shallowEqual } from 'react-redux';
import useSWR from 'swr';

import styles from './VersePreview.module.scss';

import Skeleton from 'src/components/dls/Skeleton/Skeleton';
import VerseText from 'src/components/Verse/VerseText';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { buildQCFFontFace, isQCFFont as checkIsQCFFont } from 'src/utils/fontFaceHelper';
import getSampleVerse from 'src/utils/sampleVerse';
import { QuranFont } from 'types/QuranReader';
import Word from 'types/Word';

const SWR_SAMPLE_VERSE_KEY = 'sample-verse';
const VersePreview = () => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const isQCFFont = checkIsQCFFont(quranReaderStyles.quranFont);
  const isTajweed = quranReaderStyles.quranFont === QuranFont.Tajweed;
  const { data: sampleVerse } = useSWR(SWR_SAMPLE_VERSE_KEY, () => getSampleVerse());

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
      {/* Load the the required font face for QCFFont. Similar behavior also implemented in QuranReaderBody  */}
      {isQCFFont && (
        // @ts-ignore
        <style>{buildQCFFontFace([verse], quranReaderStyles.quranFont)}</style>
      )}
      <VerseText words={verse.words as Word[]} />
    </div>
  );
};

export default VersePreview;
