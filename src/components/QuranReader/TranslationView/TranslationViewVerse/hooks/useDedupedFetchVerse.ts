import { useContext, useEffect, useMemo } from 'react';

import { useSelector as useXstateSelector } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import { getTranslationViewRequestKey, verseFetcher } from '@/components/QuranReader/api';
import { getTranslationsInitialState } from '@/redux/defaultSettings/util';
import { selectIsUsingDefaultWordByWordLocale } from '@/redux/slices/QuranReader/readingPreferences';
import { selectIsUsingDefaultFont } from '@/redux/slices/QuranReader/styles';
import { selectIsUsingDefaultTranslations } from '@/redux/slices/QuranReader/translations';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { VersesResponse } from '@/types/ApiResponses';
import { Mushaf, QuranReaderDataType } from '@/types/QuranReader';
import Verse from '@/types/Verse';
import { areArraysEqual } from '@/utils/array';
import { makeBookmarksRangeUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { getPageNumberFromIndexAndPerPage } from '@/utils/number';
import { selectIsUsingDefaultReciter } from 'src/xstate/actors/audioPlayer/selectors';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

interface QuranReaderParams {
  quranReaderDataType: QuranReaderDataType;
  wordByWordLocale: string;
  reciterId: number;
  resourceId: number | string;
  initialData: VersesResponse;
  quranReaderStyles: QuranReaderStyles;
  mushafId: Mushaf;
  selectedTranslations: number[];
  setApiPageToVersesMap: (data: Record<number, Verse[]>) => void;
  verseIdx: number;
}

interface UseDedupedFetchVerseResult {
  verse: Verse | null;
  firstVerseInPage: Verse | null;
  bookmarksRangeUrl: string | null;
}

/**
 * This hook fetches the verse of the given `verseIdx` and dedupes the data based on their page number.
 *
 * For an example, passing `verseIdx` of `0 | 1 | 2 | 3 | 4` should only trigger one API request because they are all in the same page.
 *
 * @param {QuranReaderParams} params
 * @returns {UseDedupedFetchVerseResult}
 */
const useDedupedFetchVerse = ({
  quranReaderDataType,
  quranReaderStyles,
  wordByWordLocale,
  reciterId,
  resourceId,
  selectedTranslations,
  initialData,
  setApiPageToVersesMap,
  mushafId,
  verseIdx,
}: QuranReaderParams): UseDedupedFetchVerseResult => {
  const router = useRouter();

  const { lang } = useTranslation();

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

  const pageNumber = getPageNumberFromIndexAndPerPage(verseIdx, initialData.pagination.perPage);

  const idxInPage = verseIdx % initialData.pagination.perPage;

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
      fallbackData: shouldUseInitialData ? initialData.verses : undefined,
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

  const bookmarksRangeUrl =
    verses && verses.length && isLoggedIn()
      ? makeBookmarksRangeUrl(
          mushafId,
          Number(verses?.[0].chapterId),
          Number(verses?.[0].verseNumber),
          initialData.pagination.perPage,
        )
      : null;

  return {
    verse: verses ? verses[idxInPage] : null,
    firstVerseInPage: verses ? verses[0] : null,
    bookmarksRangeUrl,
  };
};

export default useDedupedFetchVerse;
