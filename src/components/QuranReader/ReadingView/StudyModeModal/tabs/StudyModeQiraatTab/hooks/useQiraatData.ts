import { useCallback } from 'react';

import { useRouter } from 'next/router';
import useSWR from 'swr';

import { getQiraatMatrix } from '@/api';
import Language from '@/types/Language';
import { QiraatApiResponse } from '@/types/Qiraat';
import { makeQiraatMatrixUrl } from '@/utils/apiPaths';

interface UseQiraatDataResult {
  data: QiraatApiResponse | null;
  isLoading: boolean;
  error: Error | null;
  hasData: boolean;
  refetch: () => void;
}

/**
 * Custom hook for fetching Qiraat data for a specific verse.
 *
 * @param {string} verseKey - The verse key (e.g., "10:35")
 * @returns {UseQiraatDataResult} Object containing data, loading state, error, and refetch function
 */
export const useQiraatData = (verseKey: string): UseQiraatDataResult => {
  const { locale } = useRouter();

  const { data, error, isValidating, mutate } = useSWR<QiraatApiResponse>(
    makeQiraatMatrixUrl(verseKey, (locale as Language) ?? Language.EN),
    () => getQiraatMatrix(verseKey, (locale as Language) ?? Language.EN),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000,
      shouldRetryOnError: (err) => {
        if (err?.status === 404) return false;
        return true;
      },
    },
  );

  const refetch = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    data: data ?? null,
    isLoading: isValidating && !data,
    error: error ?? null,
    hasData: (data?.junctures?.length ?? 0) > 0,
    refetch,
  };
};

export default useQiraatData;
