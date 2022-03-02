import React, { useEffect } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import styles from '../TranslationView.module.scss';

import ChapterHeader from 'src/components/chapters/ChapterHeader';
import { getTranslationViewRequestKey, verseFetcher } from 'src/components/QuranReader/api';
import TranslationViewCell from 'src/components/QuranReader/TranslationView/TranslationViewCell';
import TranslationViewSkeleton from 'src/components/QuranReader/TranslationView/TranslationViewSkeleton';
import { selectIsUsingDefaultReciter } from 'src/redux/slices/AudioPlayer/state';
import { selectIsUsingDefaultWordByWordLocale } from 'src/redux/slices/QuranReader/readingPreferences';
import { selectIsUsingDefaultFont } from 'src/redux/slices/QuranReader/styles';
import { selectIsUsingDefaultTranslations } from 'src/redux/slices/QuranReader/translations';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { toLocalizedNumber } from 'src/utils/locale';
import { VersesResponse } from 'types/ApiResponses';
import { QuranReaderDataType } from 'types/QuranReader';
import Translation from 'types/Translation';
import Verse from 'types/Verse';

interface Props {
  pageNumber: number;
  quranReaderDataType: QuranReaderDataType;
  quranReaderStyles: QuranReaderStyles;
  setApiPageToVersesMap: (data: Record<number, Verse[]>) => void;
  selectedTranslations: number[];
  wordByWordLocale: string;
  reciterId: number;
  initialData: VersesResponse;
  resourceId: number | string;
}

const TranslationPage: React.FC<Props> = ({
  pageNumber,
  quranReaderDataType,
  quranReaderStyles,
  selectedTranslations,
  wordByWordLocale,
  reciterId,
  initialData,
  resourceId,
  setApiPageToVersesMap,
}) => {
  const { lang, t } = useTranslation('common');
  const isUsingDefaultReciter = useSelector(selectIsUsingDefaultReciter);
  const isUsingDefaultWordByWordLocale = useSelector(selectIsUsingDefaultWordByWordLocale);
  const isUsingDefaultTranslations = useSelector(selectIsUsingDefaultTranslations);
  const isUsingDefaultFont = useSelector(selectIsUsingDefaultFont);
  const shouldUseInitialData =
    pageNumber === 1 &&
    isUsingDefaultFont &&
    isUsingDefaultReciter &&
    isUsingDefaultWordByWordLocale &&
    isUsingDefaultTranslations;
  const { data: verses } = useSWRImmutable(
    getTranslationViewRequestKey({
      quranReaderDataType,
      pageNumber,
      initialData,
      quranReaderStyles,
      selectedTranslations,
      isVerseData: quranReaderDataType === QuranReaderDataType.Verse,
      id: resourceId,
      reciter: reciterId,
      locale: lang,
      wordByWordLocale,
    }),
    verseFetcher,
    {
      fallbackData: shouldUseInitialData ? initialData.verses : null,
      revalidateOnMount: !shouldUseInitialData,
    },
  );

  useEffect(() => {
    if (verses) {
      // @ts-ignore
      setApiPageToVersesMap((prevMushafPageToVersesMap: Record<number, Verse[]>) => ({
        ...prevMushafPageToVersesMap,
        [pageNumber]: verses,
      }));
    }
  }, [pageNumber, setApiPageToVersesMap, verses]);

  if (!verses) {
    return <TranslationViewSkeleton numberOfSkeletons={initialData.pagination.perPage} />;
  }

  const getTranslationNameString = (translations?: Translation[]) => {
    let translationName = t('settings.no-translation-selected');
    if (translations?.length === 1) translationName = translations?.[0].resourceName;
    if (translations?.length === 2)
      translationName = t('settings.value-and-other', {
        value: translations?.[0].resourceName,
        othersCount: toLocalizedNumber(translations.length - 1, lang),
      });
    if (translations?.length > 2)
      translationName = t('settings.value-and-others', {
        value: translations?.[0].resourceName,
        othersCount: toLocalizedNumber(translations.length - 1, lang),
      });

    return translationName;
  };

  return (
    <div className={styles.container}>
      {verses.map((verse, index) => {
        const currentVerseIndex =
          pageNumber === 1 ? index : index + (pageNumber - 1) * initialData.pagination.perPage;
        return (
          <div key={currentVerseIndex}>
            {verse.verseNumber === 1 && (
              <ChapterHeader
                translationName={getTranslationNameString(verse.translations)}
                chapterId={String(verse.chapterId)}
                pageNumber={verse.pageNumber}
                hizbNumber={verse.hizbNumber}
                isTranslationSelected={selectedTranslations?.length > 0}
              />
            )}
            <TranslationViewCell
              verseIndex={currentVerseIndex}
              verse={verse}
              key={verse.id}
              quranReaderStyles={quranReaderStyles}
            />
          </div>
        );
      })}
    </div>
  );
};

export default TranslationPage;
