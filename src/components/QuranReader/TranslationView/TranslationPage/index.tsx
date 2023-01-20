/* eslint-disable max-lines */
import React, { useContext, useEffect, useMemo } from 'react';

import { useSelector as useXstateSelector } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import styles from '../TranslationView.module.scss';

import ChapterHeader from '@/components/chapters/ChapterHeader';
import { getTranslationViewRequestKey, verseFetcher } from '@/components/QuranReader/api';
import TranslationViewCell from '@/components/QuranReader/TranslationView/TranslationViewCell';
import TranslationViewSkeleton from '@/components/QuranReader/TranslationView/TranslationViewSkeleton';
import { getTranslationsInitialState } from '@/redux/defaultSettings/util';
import { selectIsUsingDefaultWordByWordLocale } from '@/redux/slices/QuranReader/readingPreferences';
import { selectIsUsingDefaultFont } from '@/redux/slices/QuranReader/styles';
import { selectIsUsingDefaultTranslations } from '@/redux/slices/QuranReader/translations';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { getMushafId } from '@/utils/api';
import { areArraysEqual } from '@/utils/array';
import { getPageBookmarks } from '@/utils/auth/api';
import { makeBookmarksRangeUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { toLocalizedNumber } from '@/utils/locale';
import { selectIsUsingDefaultReciter } from 'src/xstate/actors/audioPlayer/selectors';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';
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
  const router = useRouter();
  const defaultTranslations = getTranslationsInitialState(lang).selectedTranslations;
  const translationParams = useMemo(
    () =>
      (router.query.translations as string)?.split(',')?.map((translation) => Number(translation)),
    [router.query.translations],
  );

  const audioService = useContext(AudioPlayerMachineContext);

  const isUsingDefaultReciter = useXstateSelector(audioService, (state) =>
    selectIsUsingDefaultReciter(state),
  );
  const isUsingDefaultWordByWordLocale = useSelector(selectIsUsingDefaultWordByWordLocale);
  const isUsingDefaultTranslations = useSelector(selectIsUsingDefaultTranslations);
  const isUsingDefaultFont = useSelector(selectIsUsingDefaultFont);
  const shouldUseInitialData =
    pageNumber === 1 &&
    isUsingDefaultFont &&
    isUsingDefaultReciter &&
    isUsingDefaultWordByWordLocale &&
    isUsingDefaultTranslations &&
    (!translationParams || areArraysEqual(defaultTranslations, translationParams));

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

  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;
  const bookmarksRangeUrl =
    verses && verses.length && isLoggedIn()
      ? makeBookmarksRangeUrl(
          mushafId,
          Number(verses?.[0].chapterId),
          Number(verses?.[0].verseNumber),
          initialData.pagination.perPage,
        )
      : null;
  const { data: pageBookmarks } = useSWRImmutable(bookmarksRangeUrl, async () => {
    const response = await getPageBookmarks(
      mushafId,
      Number(verses[0].chapterId),
      Number(verses[0].verseNumber),
      initialData.pagination.perPage,
    );
    return response;
  });

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
    if (translations?.length === 2) {
      translationName = t('settings.value-and-other', {
        value: translations?.[0].resourceName,
        othersCount: toLocalizedNumber(translations.length - 1, lang),
      });
    }
    if (translations?.length > 2) {
      translationName = t('settings.value-and-others', {
        value: translations?.[0].resourceName,
        othersCount: toLocalizedNumber(translations.length - 1, lang),
      });
    }

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
              pageBookmarks={pageBookmarks}
              bookmarksRangeUrl={bookmarksRangeUrl}
            />
          </div>
        );
      })}
    </div>
  );
};

export default TranslationPage;
