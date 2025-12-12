import { MutableRefObject, useCallback, useEffect, useMemo, useRef } from 'react';

import useSWRInfinite from 'swr/infinite';

import { Course, CoursesResponse } from '@/types/auth/Course';
import { privateFetcher } from '@/utils/auth/api';
import { makeGetCoursesUrl } from '@/utils/auth/apiPaths';

interface UseCoursesListParams {
  initialResponse?: CoursesResponse;
  isMyCourses: boolean;
  languages: string[];
}

interface UseCoursesListReturn {
  courses: Course[];
  hasNextPage: boolean;
  isLoadingMore: boolean;
  isInitialLoading: boolean;
  sentinelRef: MutableRefObject<HTMLDivElement | null>;
}

const useCoursesList = ({
  initialResponse,
  isMyCourses,
  languages,
}: UseCoursesListParams): UseCoursesListReturn => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  /**
   * Get the SWR key for the given page index and previous page data
   */
  const getKey = useCallback(
    (pageIndex: number, previousPageData: CoursesResponse | null) => {
      // first page, return the initial URL
      if (pageIndex === 0) {
        return makeGetCoursesUrl({ myCourses: isMyCourses, languages });
      }

      const pagination = previousPageData?.pagination;
      if (!pagination?.hasNextPage || !pagination?.endCursor) {
        return null;
      }

      // subsequent pages, return the URL with the cursor
      return makeGetCoursesUrl({
        cursor: pagination.endCursor,
        myCourses: isMyCourses,
        languages,
      });
    },
    [isMyCourses, languages],
  );

  const {
    data: swrData,
    size,
    setSize,
    isValidating,
  } = useSWRInfinite<CoursesResponse>(
    getKey,
    (url) => privateFetcher(url) as Promise<CoursesResponse>,
    {
      fallbackData: initialResponse ? [initialResponse] : undefined,
      revalidateOnFocus: false,
      revalidateFirstPage: false,
    },
  );

  // combine all pages data into a single list
  const pages = useMemo(() => {
    return (swrData ?? [])
      .map((page) => {
        if (!page) return null;
        if (Array.isArray(page)) {
          return { data: page };
        }
        return {
          ...page,
          data: page.data ?? [],
        };
      })
      .filter(Boolean) as CoursesResponse[];
  }, [swrData]);

  // flatten the courses from all pages
  const courses = useMemo(() => {
    return pages.flatMap((page) => page?.data ?? []);
  }, [pages]);

  const lastPage = pages[pages.length - 1];
  const hasNextPage =
    Boolean(lastPage?.pagination?.hasNextPage) && Boolean(lastPage?.pagination?.endCursor);
  const isLoadingMore = isValidating && size > pages.length;
  const isInitialLoading = !swrData && isValidating;

  /**
   * Set up an observer to load more courses when the sentinel comes into view
   */
  useEffect(() => {
    if (!hasNextPage) return undefined;
    const sentinelElement = sentinelRef.current;
    if (!sentinelElement) return undefined;

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry?.isIntersecting && !isLoadingMore) {
        setSize((currentSize) => currentSize + 1);
      }
    });

    observer.observe(sentinelElement);
    return () => observer.disconnect();
  }, [hasNextPage, isLoadingMore, setSize]);

  return {
    courses,
    hasNextPage,
    isLoadingMore,
    isInitialLoading,
    sentinelRef,
  };
};

export default useCoursesList;
