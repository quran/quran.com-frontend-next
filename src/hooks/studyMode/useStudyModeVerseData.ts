import { useMemo } from 'react';

import { shallowEqual, useSelector } from 'react-redux';
import useSWR from 'swr';

import { fetcher } from '@/api';
import useQcfFont from '@/hooks/useQcfFont';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import Verse from '@/types/Verse';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { makeByVerseKeyUrl } from '@/utils/apiPaths';
import { makeBookmarksRangeUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';

interface VerseResponse {
  verse: Verse;
}

interface UseStudyModeVerseDataProps {
  verseKey: string;
  selectedChapterId: string;
  selectedVerseNumber: string;
  initialChapterId: string;
  initialVerseNumber: string;
  initialVerse?: Verse;
}

interface UseStudyModeVerseDataReturn {
  currentVerse: Verse | undefined;
  isLoading: boolean;
  error: Error | undefined;
  retry: () => void;
  bookmarksRangeUrl: string;
}

const useStudyModeVerseData = ({
  verseKey,
  selectedChapterId,
  selectedVerseNumber,
  initialChapterId,
  initialVerseNumber,
  initialVerse,
}: UseStudyModeVerseDataProps): UseStudyModeVerseDataReturn => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const selectedTranslations = useSelector(selectSelectedTranslations, shallowEqual);

  const safeChapterId = initialChapterId || '1';
  const safeVerseNumber = initialVerseNumber || '1';

  const isInitialVerse =
    selectedChapterId === safeChapterId && selectedVerseNumber === safeVerseNumber;

  const queryKey =
    !isInitialVerse || !initialVerse
      ? makeByVerseKeyUrl(verseKey, {
          words: true,
          translationFields: 'resource_name,language_id',
          translations: selectedTranslations.join(','),
          ...getDefaultWordFields(quranReaderStyles.quranFont),
          ...getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines),
          wordTranslationLanguage: 'en',
          wordTransliteration: 'true',
        })
      : null;

  const { data, isValidating, error, mutate } = useSWR<VerseResponse>(queryKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 2000,
  });

  const rawVerse = data?.verse || (isInitialVerse ? initialVerse : undefined);

  const currentVerse = useMemo(() => {
    if (!rawVerse) return undefined;
    return {
      ...rawVerse,
      chapterId: rawVerse.chapterId ?? Number(selectedChapterId),
    };
  }, [rawVerse, selectedChapterId]);

  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;
  const bookmarksRangeUrl = isLoggedIn()
    ? makeBookmarksRangeUrl(mushafId, Number(selectedChapterId), Number(selectedVerseNumber), 1)
    : '';

  const versesForFont = useMemo(() => (currentVerse ? [currentVerse] : []), [currentVerse]);
  useQcfFont(quranReaderStyles.quranFont, versesForFont);

  const isLoading = isValidating && !data && !initialVerse;

  return {
    currentVerse,
    isLoading,
    error,
    retry: mutate,
    bookmarksRangeUrl,
  };
};

export default useStudyModeVerseData;
