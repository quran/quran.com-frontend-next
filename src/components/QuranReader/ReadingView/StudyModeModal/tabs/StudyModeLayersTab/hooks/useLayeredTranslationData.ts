import { useCallback } from 'react';

import { useRouter } from 'next/router';
import useSWRImmutable from 'swr/immutable';

import { getLayeredTranslationByVerse } from '@/api';
import Language from '@/types/Language';
import { LayeredTranslationApiResponse } from '@/types/LayeredTranslation';
import { makeLayeredTranslationByVerseUrl } from '@/utils/apiPaths';

type UseLayeredTranslationDataResult = {
  data: LayeredTranslationApiResponse | null;
  isLoading: boolean;
  error: Error | null;
  hasData: boolean;
  refetch: () => void;
};

const useLayeredTranslationData = (verseKey: string): UseLayeredTranslationDataResult => {
  const { locale } = useRouter();

  const { data, error, isValidating, mutate } = useSWRImmutable<LayeredTranslationApiResponse>(
    makeLayeredTranslationByVerseUrl(verseKey, (locale as Language) ?? Language.EN),
    () => getLayeredTranslationByVerse(verseKey, (locale as Language) ?? Language.EN),
    {
      dedupingInterval: 5000,
      shouldRetryOnError: (err) => err?.status !== 404,
    },
  );

  const refetch = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    data: data ?? null,
    isLoading: isValidating && !data,
    error: error ?? null,
    hasData: !!data,
    refetch,
  };
};

export default useLayeredTranslationData;
