import { useCallback, useEffect, useRef } from 'react';

import { VirtuosoHandle } from 'react-virtuoso';

import { READING_MODE_TOP_OFFSET } from '../../observer';
import { getPageIndexByPageNumber } from '../../utils/page';

import LookupRecord from 'types/LookupRecord';

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
  // Calculate page index from observer/Redux state
  const currentPageIndexFromObserver = getPageIndexByPageNumber(
    Number(lastReadPageNumber),
    pagesVersesRange,
  );

  // Track current page index in a ref for navigation (avoids re-renders)
  const currentPageIndexRef = useRef(currentPageIndexFromObserver);
  useEffect(() => {
    currentPageIndexRef.current = currentPageIndexFromObserver;
  }, [currentPageIndexFromObserver]);

  const scrollToPage = useCallback(
    (direction: ScrollDirection) => {
      const isPrev = direction === ScrollDirection.Prev;
      const newIndex = currentPageIndexRef.current + (isPrev ? -1 : 1);
      const isValidIndex = isPrev ? newIndex >= 0 : newIndex < pagesCount;

      if (isValidIndex && virtuosoRef.current) {
        currentPageIndexRef.current = newIndex;
        virtuosoRef.current.scrollToIndex({
          index: newIndex,
          align: 'start',
          offset: -READING_MODE_TOP_OFFSET,
        });
      }
    },
    [pagesCount, virtuosoRef],
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
