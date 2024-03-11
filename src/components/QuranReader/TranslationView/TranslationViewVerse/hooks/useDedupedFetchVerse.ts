import { useEffect, useMemo } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import useSWRImmutable from 'swr/immutable';

import { getTranslationViewRequestKey, verseFetcher } from '@/components/QuranReader/api';
import useIsUsingDefaultSettings from '@/hooks/useIsUsingDefaultSettings';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { VersesResponse } from '@/types/ApiResponses';
import { Mushaf, QuranReaderDataType } from '@/types/QuranReader';
import Verse from '@/types/Verse';
import { makeBookmarksRangeUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { getPageNumberFromIndexAndPerPage } from '@/utils/number';

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
  notesRange: {
    from: string;
    to: string;
  } | null;
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

  const translationParams = useMemo(
    () =>
      (router.query.translations as string)?.split(',')?.map((translation) => Number(translation)),
    [router.query.translations],
  );

  const pageNumber = getPageNumberFromIndexAndPerPage(verseIdx, initialData.pagination.perPage);

  const idxInPage = verseIdx % initialData.pagination.perPage;

  const isUsingDefaultSettings = useIsUsingDefaultSettings({
    translationParams,
    selectedTranslations,
  });
  const shouldUseInitialData = pageNumber === 1 && isUsingDefaultSettings;
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

  const verse = verses ? verses[idxInPage] : null;

  // This part handles an edge case where the user has no selected translations but the `initialData` sent from server-side rendering has a default translation.
  // So, we need to remove the translations from the verse if the user has no selected translations.
  if (verse && selectedTranslations.length === 0) {
    verse.translations = [];
  }

  return {
    verse,
    firstVerseInPage: verses ? verses[0] : null,
    bookmarksRangeUrl,
    notesRange:
      verses && verses.length > 0
        ? {
            from: verses?.[0].verseKey,
            to: verses?.[verses.length - 1].verseKey,
          }
        : null,
  };
};

export default useDedupedFetchVerse;
