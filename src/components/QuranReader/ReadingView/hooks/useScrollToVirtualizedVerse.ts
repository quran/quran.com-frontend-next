import { useEffect, useRef } from 'react';

import { useRouter } from 'next/router';
import { VirtuosoHandle } from 'react-virtuoso';

import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { MushafLines, QuranFont, QuranReaderDataType } from '@/types/QuranReader';
import { getMushafId } from '@/utils/api';
import { makeVersesFilterUrl } from '@/utils/apiPaths';
import { fetcher } from 'src/api';
import { VersesResponse } from 'types/ApiResponses';
import LookupRecord from 'types/LookupRecord';
import ScrollAlign from 'types/ScrollAlign';
import Verse from 'types/Verse';

/**
 * Calculates the total height of fixed elements at the top of the page
 * (navbar + context menu) to use as scroll offset
 *
 * @returns {number} The combined height of fixed top elements in pixels
 */
const getFixedHeaderHeight = (): number => {
  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    // Try to get only the context menu on mobile (navbar often hidden/minimal)
    const contextMenu = document.querySelector('[data-quran-context-menu]');
    const contextMenuHeight = contextMenu ? contextMenu.getBoundingClientRect().height : 48;

    return contextMenuHeight;
  }

  // Desktop: calculate both navbar and context menu
  const navbar = document.querySelector('[data-quran-navbar]');
  const navbarHeight = navbar ? navbar.getBoundingClientRect().height : 0;

  const contextMenu = document.querySelector('[data-quran-context-menu]');
  const contextMenuHeight = contextMenu ? contextMenu.getBoundingClientRect().height : 0;

  const totalHeight = navbarHeight + contextMenuHeight;

  return totalHeight > 0 ? totalHeight : 96;
};

/**
 * Scrolls to a specific verse element with dynamic offset for fixed headers
 *
 * @param {string} verseKey - The verse key to scroll to
 * @param {number} retryCount - Current retry count
 * @param {number} maxRetries - Maximum number of retries
 */
const scrollToVerseElement = (verseKey: string, retryCount: number, maxRetries: number): void => {
  const verseElement = document.querySelector(`[data-word-location="${verseKey}:1"]`);
  if (verseElement) {
    // Calculate header height
    const headerHeight = getFixedHeaderHeight();

    // Use getBoundingClientRect() after ensuring the layout is stable
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const rect = verseElement.getBoundingClientRect();
        const absoluteTop = rect.top + window.pageYOffset;
        // Use the pre-calculated header height
        const targetPosition = absoluteTop - headerHeight;
        window.scrollTo({ top: Math.max(0, targetPosition), behavior: 'smooth' });
      });
    });
  } else if (retryCount < maxRetries) {
    setTimeout(() => scrollToVerseElement(verseKey, retryCount + 1, maxRetries), 150);
  }
};

/**
 * This hook listens to startingVerse query param and navigate to the
 * location where the page of that verse is in the virtualized list if we
 * already have the data of that verse; otherwise, we will call BE to fetch
 * the page number of the verse we want to navigate to.
 *
 * [NOTE]: This is meant to be used by ReadingView only.
 *
 * @param {QuranReaderDataType} quranReaderDataType
 * @param {React.MutableRefObject<VirtuosoHandle>} virtuosoRef
 * @param {VersesResponse} initialData
 * @param {QuranReaderStyles} quranReaderStyles
 * @param {Verse[]} verses
 * @param {Record<number, LookupRecord>} pagesVersesRange
 * @param {boolean} isUsingDefaultFont
 * @param {QuranFont} quranFont
 * @param {MushafLines} mushafLines
 * @param {boolean} isPagesLookupLoading
 */
const useScrollToVirtualizedReadingView = (
  quranReaderDataType: QuranReaderDataType,
  virtuosoRef: React.MutableRefObject<VirtuosoHandle>,
  initialData: VersesResponse,
  quranReaderStyles: QuranReaderStyles,
  verses: Verse[],
  pagesVersesRange: Record<number, LookupRecord>,
  isUsingDefaultFont: boolean,
  quranFont: QuranFont,
  mushafLines: MushafLines,
  isPagesLookupLoading: boolean,
) => {
  const router = useRouter();
  const { startingVerse, chapterId } = router.query;
  const shouldScroll = useRef(true);

  /**
   * We need to scroll again when we have just changed the font since the same
   * verse might lie on another page/position. Same for when we change the
   * verse.
   */
  useEffect(() => {
    shouldScroll.current = true;
  }, [quranFont, mushafLines, startingVerse]);

  useEffect(
    // eslint-disable-next-line react-func/max-lines-per-function
    () => {
      // if we have the data of the page lookup
      if (!isPagesLookupLoading && virtuosoRef.current && Object.keys(pagesVersesRange).length) {
        // if startingVerse is present in the url
        if (quranReaderDataType === QuranReaderDataType.Chapter && startingVerse) {
          const startingVerseNumber = Number(startingVerse);
          // if the startingVerse is a valid integer and is above 1
          if (Number.isInteger(startingVerseNumber) && startingVerseNumber > 0) {
            const firstPageOfCurrentChapter = isUsingDefaultFont
              ? initialData.verses[0].pageNumber
              : Number(Object.keys(pagesVersesRange)[0]);
            // search for the verse number in the already fetched verses first
            const startFromVerseData = verses.find(
              (verse) => verse.verseNumber === startingVerseNumber,
            );
            if (
              startFromVerseData &&
              shouldScroll.current === true &&
              pagesVersesRange[startFromVerseData.pageNumber]
            ) {
              const scrollToPageIndex = startFromVerseData.pageNumber - firstPageOfCurrentChapter;
              const verseKey = `${chapterId}:${startingVerseNumber}`;

              virtuosoRef.current.scrollToIndex({
                index: scrollToPageIndex,
                // Always use 'start' alignment when navigating via startingVerse parameter
                // to ensure consistent positioning when switching between views
                align: ScrollAlign.Start,
              });

              // After scrolling to the page, wait for the verse element to be rendered
              // then scroll to it.
              // Use longer delay on mobile to ensure proper rendering
              setTimeout(() => scrollToVerseElement(verseKey, 0, 20), 300);
              shouldScroll.current = false;
            } else {
              // get the page number by the verse key and the mushafId (because the page will be different for Indopak Mushafs)
              fetcher(
                makeVersesFilterUrl({
                  filters: `${chapterId}:${startingVerseNumber}`,
                  fields: `page_number`,
                  ...getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines),
                }),
              ).then((response: VersesResponse) => {
                if (response.verses.length && shouldScroll.current === true) {
                  const scrollToPageIndex =
                    response.verses[0].pageNumber - firstPageOfCurrentChapter;
                  if (pagesVersesRange[response.verses[0].pageNumber]) {
                    const verseKey = `${chapterId}:${startingVerseNumber}`;

                    virtuosoRef.current.scrollToIndex({
                      index: scrollToPageIndex,
                      // Always use 'start' alignment when navigating via startingVerse parameter
                      // to ensure consistent positioning when switching between views
                      align: ScrollAlign.Start,
                    });

                    // After scrolling to the page, wait for the verse element to be rendered
                    // then scroll to it. We use a polling mechanism with a max retry limit.
                    // Use longer delay on mobile to ensure proper rendering
                    setTimeout(() => scrollToVerseElement(verseKey, 0, 20), 300);

                    shouldScroll.current = false;
                  }
                }
              });
            }
          }
        }
      }
    },
    [
      chapterId,
      initialData.verses,
      isPagesLookupLoading,
      isUsingDefaultFont,
      pagesVersesRange,
      quranReaderDataType,
      quranReaderStyles.mushafLines,
      quranReaderStyles.quranFont,
      startingVerse,
      verses,
      virtuosoRef,
    ],
  );
};

export default useScrollToVirtualizedReadingView;
