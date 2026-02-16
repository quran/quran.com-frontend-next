import { MutableRefObject } from 'react';

import { VirtuosoHandle } from 'react-virtuoso';

import { StartingVerseTarget } from './startingVerseTarget';

import { getVersePositionWithinAMushafPage } from '@/utils/verse';
import LookupRecord from 'types/LookupRecord';
import Verse from 'types/Verse';

const PINNED_VERSES_BAR_OFFSET = -90;
const NAVBAR_OFFSET = -54;

type ScrollToPageParams = {
  target: StartingVerseTarget;
  page: number;
  firstPageOfCurrentChapter: number;
  pinnedOffset: number;
  virtuosoRef: MutableRefObject<VirtuosoHandle>;
  pagesVersesRange: Record<number, LookupRecord>;
};

type ScrollToVerseTargetParams = {
  target: StartingVerseTarget;
  virtuosoRef: MutableRefObject<VirtuosoHandle>;
  pagesVersesRange: Record<number, LookupRecord>;
  verses: Verse[];
  isUsingDefaultFont: boolean;
  initialDataFirstPage?: number;
  hasPinnedVerses: boolean;
  isNavbarVisible: boolean;
  fetchVersePageNumber: (
    chapterId: string,
    verseNumber: number,
  ) => Promise<{
    verses: { pageNumber: number }[];
  } | void>;
};

/**
 * Compute global top offset caused by pinned verses bar and navbar.
 * @returns {number}
 */
const getPinnedOffset = (hasPinnedVerses: boolean, isNavbarVisible: boolean): number => {
  if (!hasPinnedVerses) return 0;
  return isNavbarVisible ? PINNED_VERSES_BAR_OFFSET + NAVBAR_OFFSET : PINNED_VERSES_BAR_OFFSET;
};

/**
 * Resolve first virtualized page index base for the current reading context.
 * @returns {number}
 */
const getFirstPageOfCurrentChapter = (
  isUsingDefaultFont: boolean,
  initialDataFirstPage: number | undefined,
  pagesVersesRange: Record<number, LookupRecord>,
): number => {
  if (isUsingDefaultFont && initialDataFirstPage) return initialDataFirstPage;
  return Number(Object.keys(pagesVersesRange)[0]);
};

/**
 * Scroll the virtualized list to a page index when page lookup is available.
 * @returns {boolean}
 */
const scrollToPage = ({
  target,
  page,
  firstPageOfCurrentChapter,
  pinnedOffset,
  virtuosoRef,
  pagesVersesRange,
}: ScrollToPageParams): boolean => {
  if (!pagesVersesRange[page] || !virtuosoRef.current) return false;
  const scrollToPageIndex = page - firstPageOfCurrentChapter;
  virtuosoRef.current.scrollToIndex({
    index: scrollToPageIndex,
    // Known limitation: this helper assumes page ranges are within one surah.
    // On cross-surah pages (e.g. 105:3 -> 106:1), align may be approximate.
    align: getVersePositionWithinAMushafPage(target.verseKey, pagesVersesRange[page]),
    offset: pinnedOffset,
  });
  return true;
};

/**
 * Find target page from already loaded verses before hitting the API.
 * @returns {number | undefined}
 */
const getPageFromLoadedVerses = (
  target: StartingVerseTarget,
  verses: Verse[],
): number | undefined => {
  const match = verses.find(
    // Match by chapter + verse so multi-surah targets resolve correctly.
    (verse) =>
      Number(verse.chapterId) === Number(target.chapterId) &&
      verse.verseNumber === target.verseNumber,
  );
  return match?.pageNumber;
};

/**
 * Fetch target page number from API fallback.
 * @returns {Promise<number | undefined>}
 */
const getPageFromApi = async (
  target: StartingVerseTarget,
  fetchVersePageNumber: ScrollToVerseTargetParams['fetchVersePageNumber'],
): Promise<number | undefined> => {
  const response = await fetchVersePageNumber(target.chapterId, target.verseNumber);
  if (!response || !response.verses.length) return undefined;
  return response.verses[0].pageNumber;
};

/**
 * Resolve target page and perform the final virtualized scroll.
 * @returns {Promise<boolean>}
 */
const scrollToVerseTarget = async ({
  target,
  virtuosoRef,
  pagesVersesRange,
  verses,
  isUsingDefaultFont,
  initialDataFirstPage,
  hasPinnedVerses,
  isNavbarVisible,
  fetchVersePageNumber,
}: ScrollToVerseTargetParams): Promise<boolean> => {
  if (!virtuosoRef.current || !Object.keys(pagesVersesRange).length) return false;

  const pinnedOffset = getPinnedOffset(hasPinnedVerses, isNavbarVisible);
  const firstPageOfCurrentChapter = getFirstPageOfCurrentChapter(
    isUsingDefaultFont,
    initialDataFirstPage,
    pagesVersesRange,
  );

  const localPage = getPageFromLoadedVerses(target, verses);
  if (localPage) {
    return scrollToPage({
      target,
      page: localPage,
      firstPageOfCurrentChapter,
      pinnedOffset,
      virtuosoRef,
      pagesVersesRange,
    });
  }

  const apiPage = await getPageFromApi(target, fetchVersePageNumber);
  if (!apiPage || !virtuosoRef.current) return false;

  return scrollToPage({
    target,
    page: apiPage,
    firstPageOfCurrentChapter,
    pinnedOffset,
    virtuosoRef,
    pagesVersesRange,
  });
};

export default scrollToVerseTarget;
