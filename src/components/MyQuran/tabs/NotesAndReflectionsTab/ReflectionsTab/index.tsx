import React, { useCallback } from 'react';

import useSWRInfinite from 'swr/infinite';

import styles from '../NotesAndReflectionsTab.module.scss';

import ReflectionsTabContent from './ReflectionsTabContent';

import Introduction from '@/components/MyQuran/tabs/NotesAndReflectionsTab/ReflectionsTab/Introduction';
import { DEFAULT_DEDUPING_INTERVAL } from '@/components/Notes/modal/constant';
import useRefocusAndReconnect from '@/hooks/useRefocusAndReconnect';
import GetUserReflectionsResponse from '@/types/QuranReflect/GetUserReflectionsResponse';
import { privateFetcher } from '@/utils/auth/api';
import { isLoggedIn } from '@/utils/auth/login';
import { makeGetUserReflectionsUrl } from '@/utils/quranReflect/apiPaths';

const REFLECTION_LIMIT = 10;

const getReflections = async (key?: string) => {
  return privateFetcher(key) as Promise<GetUserReflectionsResponse>;
};

const getKey = (pageIndex: number, previousPageData: GetUserReflectionsResponse) => {
  if (!isLoggedIn() || (previousPageData && !previousPageData.data)) return null;
  const page = pageIndex + 1;
  if (pageIndex === 0) return makeGetUserReflectionsUrl({ page, limit: REFLECTION_LIMIT });
  const hasNextPage = previousPageData.currentPage < previousPageData.pages;
  if (!hasNextPage) return null;
  return makeGetUserReflectionsUrl({ page, limit: REFLECTION_LIMIT });
};

const ReflectionsTab: React.FC = () => {
  const lastLoadedIndexRef = React.useRef<number | null>(null);
  const clearLastLoadedIndex = useCallback(() => {
    lastLoadedIndexRef.current = null;
  }, []);

  /**
   * Custom revalidation strategy for infinite scroll with SWR
   *
   * Problem: Using `revalidateAll: true` with useSWRInfinite causes a performance issue
   * where all pages are fetched every time a new page is loaded. Loading N pages
   * results in N(N+1)/2 requests instead of just N requests.
   *
   * Reference: https://github.com/vercel/swr/issues/590#issuecomment-2166199620
   *
   * Solution: We disable all built-in revalidation options and implement custom logic:
   * 1. Disable revalidateFirstPage, revalidateOnReconnect, and revalidateOnFocus
   * 2. Use a custom hook (useRefocusAndReconnect) to manually trigger mutate()
   *    when the window refocuses or network reconnects
   *
   * Note: Calling mutate() without arguments revalidates all pages, which is the desired
   * behavior when changes occur (on focus/reconnect). The trade-off is writing extra code
   * for manual control instead of using built-in SWR options.
   */
  const { data, size, setSize, isValidating, error, mutate } =
    useSWRInfinite<GetUserReflectionsResponse>(getKey, getReflections, {
      revalidateFirstPage: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: DEFAULT_DEDUPING_INTERVAL,
      onSuccess: clearLastLoadedIndex,
      onError: clearLastLoadedIndex,
    });

  const reflections = (data ? data.map((response) => response.data).flat() : []).filter(
    // filter out errors and unexpected values
    (reflection) => reflection instanceof Object && 'id' in reflection && 'createdAt' in reflection,
  );

  const lastPageData = data?.[data.length - 1];
  const hasNextPage = lastPageData?.currentPage < lastPageData?.pages;

  const loadMore = (index: number) => {
    if (!hasNextPage || isValidating) return;
    if (lastLoadedIndexRef.current === index) return;
    lastLoadedIndexRef.current = index;
    setSize(size + 1);
  };

  const mutateCache = useCallback(() => {
    mutate();
  }, [mutate]);

  /**
   * Trigger manual revalidation when window refocuses or network reconnects
   * This replaces the built-in revalidateOnFocus and revalidateOnReconnect options
   * to avoid the performance issue with revalidateAll in infinite scroll scenarios.
   * Note: mutate() will revalidate all cached pages.
   */
  useRefocusAndReconnect(mutateCache);

  return (
    <div className={styles.container}>
      <Introduction />
      <ReflectionsTabContent
        reflections={reflections}
        isLoading={!data && !error}
        isLoadingMore={reflections?.length > 0 && size > 1 && isValidating}
        error={error}
        loadMore={loadMore}
      />
    </div>
  );
};

export default ReflectionsTab;
