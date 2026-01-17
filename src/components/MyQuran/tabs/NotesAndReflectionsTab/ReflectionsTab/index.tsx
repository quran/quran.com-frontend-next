import useSWRInfinite from 'swr/infinite';

import styles from '../NotesAndReflectionsTab.module.scss';

import ReflectionsTabContent from './ReflectionsTabContent';

import Introduction from '@/components/MyQuran/tabs/NotesAndReflectionsTab/ReflectionsTab/Introduction';
import { DEFAULT_DEDUPING_INTERVAL } from '@/components/Notes/modal/constant';
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
  const { data, size, setSize, isValidating, error } = useSWRInfinite<GetUserReflectionsResponse>(
    getKey,
    getReflections,
    {
      revalidateFirstPage: false,
      revalidateAll: true,
      revalidateOnReconnect: true,
      revalidateOnFocus: true,
      dedupingInterval: DEFAULT_DEDUPING_INTERVAL,
    },
  );

  const reflections = data ? data.map((response) => response.data).flat() : [];

  const lastPageData = data?.[data.length - 1];
  const hasNextPage = lastPageData?.currentPage < lastPageData?.pages;

  const loadMore = () => {
    if (!hasNextPage || isValidating) return;
    setSize(size + 1);
  };

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
