import classNames from 'classnames';

import PlainVerseText from './PlainVerseText';
import styles from './VerseAndTranslation.module.scss';

import Error from '@/components/Error';
import TranslationText from '@/components/QuranReader/TranslationView/TranslationText';
import Spinner from '@/dls/Spinner/Spinner';
import useChapter from '@/hooks/useChapter';
import useVerseAndTranslation from '@/hooks/useVerseAndTranslation';
import { QuranFont } from '@/types/QuranReader';
import { getVerseWords } from '@/utils/verse';

/**
 * Given a verse range
 * - Fetch the verse + translations data
 * - and return it
 *
 * The use case of this component is mainly for Verse and Translation that needs to be fetched on client
 * dynamically (not SSR). For example, for the reflection's feature verse reference
 *
 */
interface Props {
  chapter: number;
  from: number;
  to: number;
  quranFont?: QuranFont;
  translationsLimit?: number;
  arabicVerseClassName?: string;
  translationClassName?: string;
  fixedFontScale?: number; // Optional override for font scales of Quran text and translations
}

const VerseAndTranslation: React.FC<Props> = (props) => {
  // If fixedFontScale is provided as a prop, use it; otherwise, get from hook (Redux)
  const { fixedFontScale, chapter, ...restProps } = props;
  const {
    data,
    error,
    mutate,
    translationFontScale: reduxTranslationFontScale,
    quranTextFontScale: reduxQuranTextFontScale,
  } = useVerseAndTranslation({ ...restProps, chapter });

  const {
    data: chapterData,
    error: chapterError,
    chapter: chapterObject,
  } = useChapter({
    chapterIdOrSlug: chapter.toString(),
  });

  if (error || chapterError) return <Error error={error || chapterError} onRetryClicked={mutate} />;

  if (!data || !chapterData) return <Spinner />;

  return (
    <div className={styles.container}>
      {data?.verses?.map((verse) => (
        <div key={verse.verseKey} className={styles.verseContainer}>
          <div className={classNames(styles.arabicVerseContainer, restProps.arabicVerseClassName)}>
            <PlainVerseText
              quranFont={restProps.quranFont}
              words={getVerseWords(verse)}
              fontScale={fixedFontScale ?? reduxQuranTextFontScale}
            />
          </div>
          <div
            className={classNames(styles.translationsListContainer, restProps.translationClassName)}
          >
            {verse.translations?.map((translation) => (
              <div key={translation.id} className={styles.translationContainer}>
                <TranslationText
                  chapterName={chapterObject.nameComplex}
                  reference={`${verse.chapterId}:${verse.verseNumber}`}
                  languageId={translation.languageId}
                  translationFontScale={fixedFontScale ?? reduxTranslationFontScale}
                  text={translation.text}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VerseAndTranslation;
