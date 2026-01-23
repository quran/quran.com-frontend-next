import React, { useCallback, useMemo } from 'react';

import useSWRInfinite from 'swr/infinite';

import styles from '../NotesAndReflectionsTab.module.scss';

import NotesTabContent from './NotesTabContent';

import { DEFAULT_DEDUPING_INTERVAL } from '@/components/Notes/modal/constant';
import useNotesWithRecentReflection from '@/components/Notes/modal/hooks/useNotesWithRecentReflection';
import useRefocusAndReconnect from '@/hooks/useRefocusAndReconnect';
import { GetAllNotesResponse } from '@/types/auth/Note';
import NotesSortOption from '@/types/NotesSortOptions';
import { getAllNotes } from '@/utils/auth/api';
import { makeNotesUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';

const baseConfig = {
  limit: 10,
};

const getNotes = async (sortBy: NotesSortOption, key?: string) => {
  return getAllNotes({
    sortBy,
    ...baseConfig,
    ...(key && key.includes('cursor') && { cursor: new URL(key).searchParams.get('cursor') || '' }),
  }) as Promise<GetAllNotesResponse>;
};

interface NotesTabProps {
  sortBy: NotesSortOption;
}

const NotesTab: React.FC<NotesTabProps> = ({ sortBy }) => {
  const getKey = (pageIndex: number, previousPageData: GetAllNotesResponse) => {
    if (!isLoggedIn() || (previousPageData && !previousPageData.data)) return null;
    if (pageIndex === 0) return makeNotesUrl({ ...baseConfig, sortBy });
    const { endCursor, hasNextPage } = previousPageData.pagination;
    if (!endCursor || !hasNextPage) return null;
    return makeNotesUrl({ ...baseConfig, sortBy, cursor: endCursor });
  };

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
  const { data, size, setSize, isValidating, error, mutate } = useSWRInfinite<GetAllNotesResponse>(
    getKey,
    async (key) => getNotes(sortBy, key),
    {
      revalidateFirstPage: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: DEFAULT_DEDUPING_INTERVAL,
      onSuccess: clearLastLoadedIndex,
      onError: clearLastLoadedIndex,
    },
  );

  const notes = useMemo(() => (data ? data.map((response) => response.data).flat() : []), [data]);
  const notesWithRecentReflection = useNotesWithRecentReflection(notes);

  const lastPageData = data?.[data.length - 1];
  const hasNextPage = lastPageData?.pagination?.hasNextPage || false;

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
      <NotesTabContent
        notes={notesWithRecentReflection}
        isLoading={!data && !error}
        isLoadingMore={notes?.length > 0 && size > 1 && isValidating}
        error={error}
        loadMore={loadMore}
        mutateCache={mutateCache}
      />
    </div>
  );
};

export default NotesTab;
