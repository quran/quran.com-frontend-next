import React, { useEffect, useMemo, useRef, useCallback, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import useSWRImmutable from 'swr/immutable';

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

  // Track additional pages loaded
  const [additionalPages, setAdditionalPages] = useState<RelatedVersesResponse[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Use useSWRImmutable for the first page to benefit from SSR fallback
  const firstPageUrl = makeRelatedVersesByKeyUrl(verseKey, lang, 1);
  const {
    data: firstPageData,
    error,
    isValidating,
  } = useSWRImmutable<RelatedVersesResponse>(firstPageUrl, fetcher);

  // Combine first page with additional pages
  const allPageData = useMemo(() => {
    if (!firstPageData) return [];
    return [firstPageData, ...additionalPages];
  }, [firstPageData, additionalPages]);

  const relatedVerses = useMemo(() => {
    return allPageData.flatMap((page) => page.relatedVerses || []);
  }, [allPageData]);

  const lastPageData = allPageData[allPageData.length - 1];
  const hasNextPage = !!lastPageData?.pagination?.nextPage;
  const isLoadingInitial = !firstPageData && isValidating;

  const loadMore = useCallback(async () => {
    if (!hasNextPage || isLoadingMore) return;

    const nextPage = allPageData.length + 1;
    const nextPageUrl = makeRelatedVersesByKeyUrl(verseKey, lang, nextPage);

    setIsLoadingMore(true);
    try {
      const data = await fetcher(nextPageUrl);
      setAdditionalPages((prev) => [...prev, data as RelatedVersesResponse]);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasNextPage, isLoadingMore, allPageData.length, verseKey, lang]);

  // Reset additional pages when verse changes
  useEffect(() => {
    setAdditionalPages([]);
  }, [verseKey]);

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
