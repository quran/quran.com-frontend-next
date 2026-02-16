import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/router';
import { shallowEqual, useSelector } from 'react-redux';
import { VirtuosoHandle } from 'react-virtuoso';

import { useVerseTrackerContext } from '../../contexts/VerseTrackerContext';

import useStartingVerseScrollTarget from './useStartingVerseScrollTarget';

import DataContext from '@/contexts/DataContext';
import useAudioNavigationScroll from '@/hooks/useAudioNavigationScroll';
import { selectNavbar } from '@/redux/slices/navbar';
import { selectPinnedVerses } from '@/redux/slices/QuranReader/pinnedVerses';
import { QuranReaderDataType } from '@/types/QuranReader';
import Verse from '@/types/Verse';
import { getPageNumberFromIndexAndPerPage } from '@/utils/number';
import LookupRange from 'types/LookupRange';
import ScrollAlign from 'types/ScrollAlign';

const SCROLL_DELAY_MS = 1000;
const CONTEXT_MENU_OFFSET = -70;
const PINNED_VERSES_BAR_OFFSET = -90;
const NAVBAR_OFFSET = -54;

/**
 * This hook listens to startingVerse query param and navigate to
 * the location where the verse is in the virtualized list.
 *
 * [NOTE]: This is meant to be used for TranslationView only.
 */
const useScrollToVirtualizedTranslationView = (
  quranReaderDataType: QuranReaderDataType,
  virtuosoRef: React.MutableRefObject<VirtuosoHandle>,
  apiPageToVersesMap: Record<number, Verse[]>,
  chapterId: string,
  versesPerPage: number,
  lookupRange?: LookupRange,
) => {
  const router = useRouter();
  const chaptersData = useContext(DataContext);
  const [shouldReadjustScroll, setShouldReadjustScroll] = useState(false);
  const timeoutId = useRef<ReturnType<typeof setTimeout>>(null);
  const { verseKeysQueue, shouldTrackObservedVerses } = useVerseTrackerContext();

  const pinnedVerses = useSelector(selectPinnedVerses);
  const hasPinnedVerses = pinnedVerses.length > 0;
  const { isVisible: isNavbarVisible } = useSelector(selectNavbar, shallowEqual);

  const hasPinnedVersesRef = useRef(hasPinnedVerses);
  hasPinnedVersesRef.current = hasPinnedVerses;
  const isNavbarVisibleRef = useRef(isNavbarVisible);
  isNavbarVisibleRef.current = isNavbarVisible;

  const { startingVerse, targetVerseIndex, targetVerseKey, shouldSkipInitialScroll } =
    useStartingVerseScrollTarget({
      startingVerseQueryParam: router.query.startingVerse,
      chapterIdQueryParam: router.query.chapterId,
      chapterId,
      chaptersData,
      lookupRange,
    });

  const scrollToBeginningOfVerseCell = useCallback(
    (verseIndex: number) => {
      if (!virtuosoRef.current) return;
      let offset = CONTEXT_MENU_OFFSET;
      if (hasPinnedVersesRef.current) {
        offset += PINNED_VERSES_BAR_OFFSET;
        if (isNavbarVisibleRef.current) offset += NAVBAR_OFFSET;
      }
      virtuosoRef.current.scrollToIndex({
        index: verseIndex,
        align: ScrollAlign.Start,
        offset,
      });
    },
    [virtuosoRef],
  );

  useEffect(() => {
    if (!startingVerse || shouldSkipInitialScroll || targetVerseIndex < 0) return;
    scrollToBeginningOfVerseCell(targetVerseIndex);
    setShouldReadjustScroll(true);
  }, [startingVerse, shouldSkipInitialScroll, targetVerseIndex, scrollToBeginningOfVerseCell]);

  useEffect(() => {
    if (!shouldReadjustScroll || shouldSkipInitialScroll || targetVerseIndex < 0) return;
    shouldTrackObservedVerses.current = false;
    const pageNumber = getPageNumberFromIndexAndPerPage(targetVerseIndex, versesPerPage);
    const isFirstVerseInPage = targetVerseIndex % versesPerPage === 0;

    const isBeforeDoneLoading =
      pageNumber > 1 && isFirstVerseInPage ? !!apiPageToVersesMap[pageNumber - 1] : true;
    const isDoneLoading = !!apiPageToVersesMap[pageNumber] && isBeforeDoneLoading;

    if (isDoneLoading) {
      if (timeoutId.current !== null) {
        clearTimeout(timeoutId.current);
      }

      timeoutId.current = setTimeout(() => {
        scrollToBeginningOfVerseCell(targetVerseIndex);
        shouldTrackObservedVerses.current = true;
        if (targetVerseKey) verseKeysQueue.current.add(targetVerseKey);
      }, SCROLL_DELAY_MS);

      setShouldReadjustScroll(false);
    } else {
      scrollToBeginningOfVerseCell(targetVerseIndex);
    }
  }, [
    shouldReadjustScroll,
    shouldSkipInitialScroll,
    targetVerseIndex,
    apiPageToVersesMap,
    versesPerPage,
    scrollToBeginningOfVerseCell,
    shouldTrackObservedVerses,
    verseKeysQueue,
    targetVerseKey,
  ]);

  const onAudioNavigation = useCallback(
    (ayahNumber: number) => {
      scrollToBeginningOfVerseCell(ayahNumber - 1);
    },
    [scrollToBeginningOfVerseCell],
  );

  useAudioNavigationScroll(quranReaderDataType, onAudioNavigation, chapterId);

  useEffect(() => {
    return () => {
      if (timeoutId.current !== null) {
        clearTimeout(timeoutId.current);
      }
    };
  }, []);
};

export default useScrollToVirtualizedTranslationView;
