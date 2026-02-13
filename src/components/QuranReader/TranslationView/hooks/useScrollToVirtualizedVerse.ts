/* eslint-disable max-lines */
import { useCallback, useEffect, useState, useContext, useRef, useMemo } from 'react';

import { useRouter } from 'next/router';
import { shallowEqual, useSelector } from 'react-redux';
import { VirtuosoHandle } from 'react-virtuoso';

import { useVerseTrackerContext } from '../../contexts/VerseTrackerContext';

import DataContext from '@/contexts/DataContext';
import useAudioNavigationScroll from '@/hooks/useAudioNavigationScroll';
import { selectNavbar } from '@/redux/slices/navbar';
import { selectPinnedVerses } from '@/redux/slices/QuranReader/pinnedVerses';
import { QuranReaderDataType } from '@/types/QuranReader';
import Verse from '@/types/Verse';
import { getPageNumberFromIndexAndPerPage } from '@/utils/number';
import { isValidVerseId, isValidVerseKey } from '@/utils/validator';
import { getVerseAndChapterNumbersFromKey, makeVerseKey } from '@/utils/verse';
import { generateVerseKeysBetweenTwoVerseKeys } from '@/utils/verseKeys';
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

  const startingVerseQueryParam = router.query.startingVerse;
  const startingVerse = Array.isArray(startingVerseQueryParam)
    ? startingVerseQueryParam[0]
    : startingVerseQueryParam;
  const chapterIdQueryParam = router.query.chapterId; // The chapterId route param or undefined if we are on a /juz, /page or other multi-chapter route.
  const chapterIdFromRoute = Array.isArray(chapterIdQueryParam)
    ? chapterIdQueryParam[0]
    : chapterIdQueryParam;

  const isChapterScopedRoute = !!chapterIdFromRoute && !String(chapterIdFromRoute).includes(':'); // Chapter ids/slugs do not include ":" while verse-key/range params do.
  const startingVerseValue = String(startingVerse || '');
  const isStartingVerseKeyFormat = startingVerseValue.includes(':'); // Detect multi-surah format "SS:VV".
  const startingVerseNumber = Number(startingVerseValue);

  const verseKeysInLookupRange = useMemo(() => {
    // Precompute ordered verse keys for the current reader range.
    if (!lookupRange?.from || !lookupRange?.to) return [];
    return generateVerseKeysBetweenTwoVerseKeys(chaptersData, lookupRange.from, lookupRange.to);
  }, [chaptersData, lookupRange?.from, lookupRange?.to]);

  const isValidChapterStartingVerse =
    isChapterScopedRoute &&
    !!startingVerse &&
    !isStartingVerseKeyFormat &&
    isValidVerseId(chaptersData, chapterId, startingVerseValue);

  const isValidLookupStartingVerseKey =
    !!startingVerse &&
    isStartingVerseKeyFormat &&
    isValidVerseKey(chaptersData, startingVerseValue) &&
    verseKeysInLookupRange.includes(startingVerseValue);

  const targetVerseIndex = useMemo(() => {
    // Resolve the final absolute virtualized index for both formats.
    if (isValidChapterStartingVerse) return startingVerseNumber - 1; // Chapter format maps directly to zero-based index.
    if (isValidLookupStartingVerseKey) return verseKeysInLookupRange.indexOf(startingVerseValue); // Multi-surah format uses lookup-range key ordering.
    return -1;
  }, [
    isValidChapterStartingVerse,
    startingVerseNumber,
    isValidLookupStartingVerseKey,
    verseKeysInLookupRange,
    startingVerseValue,
  ]);

  const shouldSkipInitialScroll = isValidChapterStartingVerse && startingVerseNumber <= 1; // Skip scroll when chapter target is the first verse already at top.

  const targetVerseKey = useMemo(() => {
    // Resolve a verse key for observer queue updates.
    if (isValidLookupStartingVerseKey) {
      const [targetChapterId, targetVerseNumber] =
        getVerseAndChapterNumbersFromKey(startingVerseValue);
      return makeVerseKey(Number(targetChapterId), Number(targetVerseNumber));
    }
    if (isValidChapterStartingVerse) return makeVerseKey(chapterId, startingVerseNumber); // Build verse key for numeric chapter format.
    return undefined; // Keep undefined when there is no valid target.
  }, [
    isValidLookupStartingVerseKey,
    startingVerseValue,
    isValidChapterStartingVerse,
    chapterId,
    startingVerseNumber,
  ]);

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

  useAudioNavigationScroll(quranReaderDataType, chapterId, onAudioNavigation);

  useEffect(() => {
    return () => {
      if (timeoutId.current !== null) {
        clearTimeout(timeoutId.current);
      }
    };
  }, []);
};

export default useScrollToVirtualizedTranslationView;
