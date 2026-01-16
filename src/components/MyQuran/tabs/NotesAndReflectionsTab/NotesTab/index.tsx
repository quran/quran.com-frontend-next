import useSWRInfinite from 'swr/infinite';

import styles from '../NotesAndReflectionsTab.module.scss';

import NotesTabContent from './NotesTabContent';

import { GetAllNotesResponse } from '@/types/auth/Note';
import NotesSortOption from '@/types/NotesSortOptions';
import { getAllNotes } from '@/utils/auth/api';
import { makeNotesUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';

const NOTE_LIMIT = 10;

const getNotes = async (sortBy: NotesSortOption, key?: string) => {
  return getAllNotes({
    sortBy,
    limit: NOTE_LIMIT,
    ...(key.includes('cursor') && { cursor: new URL(key).searchParams.get('cursor') || '' }),
  }) as Promise<GetAllNotesResponse>;
};

interface NotesTabProps {
  sortBy: NotesSortOption;
}

const NotesTab: React.FC<NotesTabProps> = ({ sortBy }) => {
  const getKey = (pageIndex: number, previousPageData: GetAllNotesResponse) => {
    if (!isLoggedIn() || (previousPageData && !previousPageData.data)) return null;
    if (pageIndex === 0) return makeNotesUrl({ sortBy, limit: NOTE_LIMIT });
    const { endCursor, hasNextPage } = previousPageData.pagination;
    if (!endCursor || !hasNextPage) return null;
    return makeNotesUrl({ sortBy, cursor: endCursor, limit: NOTE_LIMIT });
  };

  const { data, size, setSize, isValidating, error, mutate } = useSWRInfinite<GetAllNotesResponse>(
    getKey,
    async (key) => getNotes(sortBy, key),
    { revalidateOnFocus: false, revalidateFirstPage: false, revalidateIfStale: true },
  );

  const notes = data ? data.map((response) => response.data).flat() : [];

  const lastPageData = data?.[data.length - 1];
  const hasNextPage = lastPageData?.pagination?.hasNextPage || false;

  const loadMore = () => {
    if (!hasNextPage || isValidating) return;
    setSize(size + 1);
  };

  return (
    <div className={styles.container}>
      <NotesTabContent
        notes={notes}
        isLoading={!data && !error}
        isLoadingMore={notes?.length > 0 && size > 1 && isValidating}
        error={error}
        loadMore={loadMore}
        mutateCache={mutate}
      />
    </div>
  );
};

export default NotesTab;
