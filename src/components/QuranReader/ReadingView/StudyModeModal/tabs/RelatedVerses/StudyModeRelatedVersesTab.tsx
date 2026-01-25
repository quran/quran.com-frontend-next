import React, { useEffect, useMemo, useRef, useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';
import useSWRInfinite from 'swr/infinite';

import { studyModeTabStyles as parentStyles, useStudyModeTabScroll } from '../StudyModeTabLayout';

import RelatedVerseCollapsible from './RelatedVerseCollapsible';
import RelatedVersesSkeleton from './RelatedVersesSkeleton';

import { fetcher } from '@/api';
import { makeRelatedVersesByKeyUrl } from '@/utils/apiPaths';
import { RelatedVersesResponse } from 'types/ApiResponses';

interface StudyModeRelatedVersesTabProps {
  chapterId: string;
  verseNumber: string;
  onGoToVerse?: (chapterId: string, verseNumber: string) => void;
}

const StudyModeRelatedVersesTab: React.FC<StudyModeRelatedVersesTabProps> = ({
  chapterId,
  verseNumber,
  onGoToVerse,
}) => {
  const { lang } = useTranslation();
  const { containerRef } = useStudyModeTabScroll();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const verseKey = `${chapterId}:${verseNumber}`;

  const getKey = (pageIndex: number, previousPageData: RelatedVersesResponse | null) => {
    if (previousPageData && !previousPageData.pagination?.nextPage) return null;
    const page = pageIndex + 1;
    return makeRelatedVersesByKeyUrl(verseKey, lang, page);
  };

  const { data, size, setSize, isValidating, error } = useSWRInfinite<RelatedVersesResponse>(
    getKey,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateFirstPage: false,
    },
  );

  const relatedVerses = useMemo(() => {
    if (!data) return [];
    return data.flatMap((page) => page.relatedVerses || []);
  }, [data]);

  const lastPageData = data?.[data.length - 1];
  const hasNextPage = !!lastPageData?.pagination?.nextPage;
  const isLoadingInitial = !data && isValidating;
  const isLoadingMore = size > 0 && data && typeof data[size - 1] === 'undefined' && isValidating;

  const loadMore = useCallback(() => {
    if (!hasNextPage || isValidating) return;
    setSize(size + 1);
  }, [hasNextPage, isValidating, setSize, size]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  if (isLoadingInitial) {
    return <RelatedVersesSkeleton />;
  }

  if (error || relatedVerses.length === 0) {
    return null;
  }

  return (
    <div ref={containerRef} className={parentStyles.container}>
      {relatedVerses.map((relatedVerse) => (
        <RelatedVerseCollapsible
          key={relatedVerse.id}
          relatedVerse={relatedVerse}
          onGoToVerse={onGoToVerse}
        />
      ))}
      <div ref={sentinelRef} style={{ height: 1 }} />
      {isLoadingMore && <RelatedVersesSkeleton />}
    </div>
  );
};

export default StudyModeRelatedVersesTab;
