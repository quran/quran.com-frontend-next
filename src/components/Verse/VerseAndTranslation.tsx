import { useContext, useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import Reference from '../QuranReader/TranslationView/TranslationText/Reference';

import PlainVerseText from './PlainVerseText';
import styles from './VerseAndTranslation.module.scss';

import Error from '@/components/Error';
import TranslationText from '@/components/QuranReader/TranslationView/TranslationText';
import DataContext from '@/contexts/DataContext';
import Spinner from '@/dls/Spinner/Spinner';
import useVerseAndTranslation from '@/hooks/useVerseAndTranslation';
import { QuranFont } from '@/types/QuranReader';
import { getChapterData } from '@/utils/chapter';
import { isRTLLocale } from '@/utils/locale';
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
  translationIds?: Array<number | string>;
  arabicVerseClassName?: string;
  translationClassName?: string;
  translationTextClassName?: string;
  fixedFontScale?: number; // Optional override for font scales of Quran text and translations
  shouldShowReference?: boolean;
  shouldLinkReference?: boolean;
  loadingFallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

const VerseAndTranslation: React.FC<Props> = (props) => {
  // If fixedFontScale is provided as a prop, use it; otherwise, get from hook (Redux)
  const { lang } = useTranslation();
  const {
    fixedFontScale,
    chapter,
    shouldShowReference: shouldShowReferenceFromProps,
    shouldLinkReference = true,
    loadingFallback,
    errorFallback,
    translationTextClassName,
    ...restProps
  } = props;
  const {
    data,
    error,
    mutate,
    translationFontScale: reduxTranslationFontScale,
    quranTextFontScale: reduxQuranTextFontScale,
  } = useVerseAndTranslation({ ...restProps, chapter });
  const chaptersDataFromContext = useContext(DataContext);
  const resolvedChaptersData = restProps.chaptersData || chaptersDataFromContext;
  const chapterData = useMemo(() => {
    if (!resolvedChaptersData) return null;
    return getChapterData(resolvedChaptersData, chapter?.toString());
  }, [resolvedChaptersData, chapter]);
  const resolvedChapterName = isRTLLocale(lang)
    ? chapterData?.nameArabic || chapterData?.transliteratedName
    : chapterData?.transliteratedName;
  const shouldShowReference = shouldShowReferenceFromProps ?? !!restProps.titleText;

  if (error) {
    if (errorFallback) {
      return <>{errorFallback}</>;
    }

    return <Error error={error} onRetryClicked={mutate} />;
  }

  if (!data) {
    if (loadingFallback) {
      return <>{loadingFallback}</>;
    }

    return <Spinner />;
  }

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
                  chapterName={resolvedChapterName}
                  reference={`${verse.chapterId}:${verse.verseNumber}`}
                  languageId={translation.languageId}
                  translationFontScale={fixedFontScale ?? reduxTranslationFontScale}
                  text={translation.text}
                  className={translationTextClassName}
                  shouldLinkReference={shouldLinkReference}
                />
              </div>
            ))}
            {!verse.translations?.length && shouldShowReference && (
              <div className={styles.referenceContainer}>
                <Reference
                  reference={`${verse.chapterId}:${verse.verseNumber}`}
                  chapterName={resolvedChapterName}
                  lang={lang}
                  isLink={shouldLinkReference}
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VerseAndTranslation;
