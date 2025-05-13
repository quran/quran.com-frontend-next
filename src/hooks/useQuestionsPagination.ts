import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import useSWRInfinite from 'swr/infinite';

import Language from '@/types/Language';
import AyahQuestionsResponse from '@/types/QuestionsAndAnswers/AyahQuestionsResponse';
import { privateFetcher } from '@/utils/auth/api';
import { makeGetQuestionsByVerseKeyUrl } from '@/utils/auth/apiPaths';

const PAGE_SIZE = 10;

interface UseQuestionsPaginationProps {
  verseKey?: string;
  initialData?: AyahQuestionsResponse;
}

const useQuestionsPagination = ({ verseKey, initialData }: UseQuestionsPaginationProps) => {
  const { lang } = useTranslation();
  const getKey = (pageIndex: number, previousPageData: AyahQuestionsResponse) => {
    if (previousPageData && !previousPageData.questions.length) {
      return null;
    }

    return makeGetQuestionsByVerseKeyUrl({
      verseKey,
      page: pageIndex + 1,
      pageSize: PAGE_SIZE,
      language: lang as Language,
    });
  };

  const {
    data: pagesData,
    size,
    setSize,
    isValidating,
  } = useSWRInfinite<AyahQuestionsResponse>(getKey, privateFetcher, {
    fallbackData: initialData ? [initialData] : undefined,
    revalidateFirstPage: false,
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const allQuestions = useMemo(
    () => (pagesData ? pagesData.flatMap((page) => page?.questions || []) : []),
    [pagesData],
  );

  const hasMore = useMemo(
    () => (pagesData ? pagesData[pagesData.length - 1]?.questions?.length === PAGE_SIZE : false),
    [pagesData],
  );

  const isLoadingMore =
    isValidating || (size > 0 && pagesData && typeof pagesData[size - 1] === 'undefined');

  const loadMore = () => setSize(size + 1);

  return {
    questions: allQuestions,
    hasMore,
    isLoadingMore,
    loadMore,
  };
};

export default useQuestionsPagination;
