import { useCallback } from 'react';

import { camelizeKeys } from 'humps';
import { useRouter } from 'next/router';
import useSWR from 'swr';

import { fetcher } from '@/api';
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

  const url = makeQiraatMatrixUrl(verseKey, locale || 'en');

  const { data, error, isValidating, mutate } = useSWR<QiraatApiResponse>(
    url,
    async (fetchUrl: string) => {
      const response = await fetcher(fetchUrl);
      return camelizeKeys(response) as QiraatApiResponse;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000,
      // Handle 404 (no junctures) as empty data, not hard error
      shouldRetryOnError: (err) => {
        // Don't retry on 404 - treat as empty data
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
