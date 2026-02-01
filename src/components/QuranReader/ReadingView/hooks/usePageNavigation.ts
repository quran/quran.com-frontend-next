import { useCallback, useEffect, useRef } from 'react';

import { useSelector } from 'react-redux';
import { VirtuosoHandle } from 'react-virtuoso';

import { READING_MODE_TOP_OFFSET } from '../../observer';
import { getPageIndexByPageNumber } from '../../utils/page';

import { selectPinnedVerses } from '@/redux/slices/QuranReader/pinnedVerses';
import LookupRecord from 'types/LookupRecord';

const PINNED_VERSES_BAR_OFFSET = 90;

enum ScrollDirection {
  Next = 'next',
  Prev = 'prev',
}

type UsePageNavigationParams = {
  pagesVersesRange: Record<number, LookupRecord>;
  lastReadPageNumber: string;
  pagesCount: number;
  virtuosoRef: React.RefObject<VirtuosoHandle>;
};

/**
 * Custom hook for handling page navigation in ReadingView.
 * Tracks current page index in a ref to ensure navigation works
 * even before the intersection observer updates.
 *
 * @returns {object} Navigation functions and current page index
 */
const usePageNavigation = ({
  pagesVersesRange,
  lastReadPageNumber,
  pagesCount,
  virtuosoRef,
}: UsePageNavigationParams) => {
  const currentPageIndexFromObserver = getPageIndexByPageNumber(
    Number(lastReadPageNumber),
    pagesVersesRange,
  );

  const currentPageIndexRef = useRef(currentPageIndexFromObserver);
  useEffect(() => {
    currentPageIndexRef.current = currentPageIndexFromObserver;
  }, [currentPageIndexFromObserver]);

  const pinnedVerses = useSelector(selectPinnedVerses);
  const hasPinnedVerses = pinnedVerses.length > 0;

  const scrollToPage = useCallback(
    (direction: ScrollDirection) => {
      const isPrev = direction === ScrollDirection.Prev;
      const newIndex = currentPageIndexRef.current + (isPrev ? -1 : 1);
      const isValidIndex = isPrev ? newIndex >= 0 : newIndex < pagesCount;

      if (isValidIndex && virtuosoRef.current) {
        currentPageIndexRef.current = newIndex;
        const offset = hasPinnedVerses
          ? -(READING_MODE_TOP_OFFSET + PINNED_VERSES_BAR_OFFSET)
          : -READING_MODE_TOP_OFFSET;
        virtuosoRef.current.scrollToIndex({
          index: newIndex,
          align: 'start',
          offset,
        });
      }
    },
    [pagesCount, virtuosoRef, hasPinnedVerses],
  );

  const scrollToPreviousPage = useCallback(
    () => scrollToPage(ScrollDirection.Prev),
    [scrollToPage],
  );
  const scrollToNextPage = useCallback(() => scrollToPage(ScrollDirection.Next), [scrollToPage]);

  return {
    scrollToPreviousPage,
    scrollToNextPage,
    currentPageIndex: currentPageIndexFromObserver,
  };
};

export default usePageNavigation;
