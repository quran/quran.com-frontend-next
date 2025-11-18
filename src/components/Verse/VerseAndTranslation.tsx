import { useMemo } from 'react';

import classNames from 'classnames';

import PlainVerseText from './PlainVerseText';
import styles from './VerseAndTranslation.module.scss';

import Error from '@/components/Error';
import TranslationText from '@/components/QuranReader/TranslationView/TranslationText';
import Spinner from '@/dls/Spinner/Spinner';
import useVerseAndTranslation from '@/hooks/useVerseAndTranslation';
import { QuranFont } from '@/types/QuranReader';
import { getChapterData } from '@/utils/chapter';
import { getVerseWords } from '@/utils/verse';
import ChaptersData from 'types/ChaptersData';

/**
 * React component that fetches and displays Quranic verses with their translations.
 *
 * This component is designed for client-side dynamic fetching of verse data (not SSR).
 * It fetches both verse content and chapter information, then renders them with
 * customizable styling and font scaling options.
 *
 * Primary use cases:
 * - Reflection feature verse references
 * - Dynamic verse displays that require client-side data fetching
 * - Components that need verse data with translations on demand
 *
 * @param {object} props - Component properties
 * @param {number} props.chapter - Chapter number (1-114)
 * @param {number} props.from - Starting verse number (inclusive)
 * @param {number} props.to - Ending verse number (inclusive)
 * @param {QuranFont} [props.quranFont] - Optional Quran font type override
 * @param {number} [props.translationsLimit] - Optional limit on number of translations to display
 * @param {string} [props.arabicVerseClassName] - Optional CSS class for Arabic verse container
 * @param {string} [props.translationClassName] - Optional CSS class for translation container
 * @param {number} [props.fixedFontScale] - Optional override for font scales (overrides Redux values)
 *
 * @example
 * ```tsx
 * <VerseAndTranslation
 *   chapter={1}
 *   from={1}
 *   to={7}
 *   quranFont={QuranFont.MadaniV1}
 *   translationsLimit={3}
 * />
 * ```
 */
interface Props {
  chaptersData?: ChaptersData;
  chapter: number;
  from: number;
  to: number;
  titleText?: string;
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
  const chapterData = useMemo(() => {
    if (!restProps.chaptersData) return null;
    return getChapterData(restProps.chaptersData, chapter?.toString());
  }, [restProps.chaptersData, chapter]);
  const shouldShowReference = !!restProps.titleText;

  if (error) {
    return <Error error={error} onRetryClicked={mutate} />;
  }

  if (!data) return <Spinner />;

  return (
    <div className={styles.container}>
      {data?.verses?.map((verse) => (
        <div key={verse.verseKey} className={styles.verseContainer}>
          <div className={classNames(styles.arabicVerseContainer, restProps.arabicVerseClassName)}>
            <PlainVerseText
              titleText={restProps.titleText}
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
                  shouldShowReference={shouldShowReference}
                  chapterName={chapterData?.transliteratedName}
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
