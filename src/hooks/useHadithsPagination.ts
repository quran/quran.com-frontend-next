import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import useSWRInfinite from 'swr/infinite';

import { getAyahHadiths } from '@/api';
import { AyahHadithsResponse } from '@/types/Hadith';
import Language from '@/types/Language';

const PAGE_SIZE = 4;

interface UseHadithsPaginationProps {
  ayahKey?: string;
  initialData?: AyahHadithsResponse;
  language?: Language;
}

const useHadithsPagination = ({ ayahKey, initialData, language }: UseHadithsPaginationProps) => {
  const { lang } = useTranslation();

  const getKey = (pageIndex: number, previousPageData: AyahHadithsResponse) => {
    if (!ayahKey) return null;
    if (previousPageData && !previousPageData.hadiths.length) {
      return null;
    }
    if (previousPageData && !previousPageData.hasMore) {
      return null;
    }

    return {
      ayahKey,
      page: pageIndex + 1,
      limit: PAGE_SIZE,
      language: language || (lang as Language),
    };
  };

  const fetcher = ({ ayahKey: key, page, limit, language: langCode }) =>
    getAyahHadiths(key, langCode, page, limit);

  const {
    data: pagesData,
    size,
    setSize,
    isValidating,
    error,
    mutate,
  } = useSWRInfinite<AyahHadithsResponse>(getKey, fetcher, {
    fallbackData: initialData ? [initialData] : undefined,
    revalidateFirstPage: false,
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const hasErrorInPages = useMemo(
    () => (pagesData ? pagesData.some((page) => !Array.isArray(page?.hadiths)) : false),
    [pagesData],
  );

  const hadiths = useMemo(
    () => (pagesData ? pagesData.flatMap((page) => page?.hadiths || []) : []),
    [pagesData],
  );

  const hasMore = useMemo(
    () => (pagesData ? pagesData[pagesData.length - 1]?.hasMore : false),
    [pagesData],
  );

  const isLoadingMore =
    isValidating || (size > 0 && pagesData && typeof pagesData[size - 1] === 'undefined');

  const isLoading = !pagesData && !error;
  const loadMore = () => setSize(size + 1);

  return {
    hadiths,
    hasMore,
    isLoadingMore,
    isValidating,
    loadMore,
    isLoading,
    hasErrorInPages,
    error,
    mutate,
  };
};

export default useHadithsPagination;
