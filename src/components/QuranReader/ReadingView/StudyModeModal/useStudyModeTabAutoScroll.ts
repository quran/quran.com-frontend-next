import { useCallback, useEffect, useRef, useState, RefObject } from 'react';

import { StudyModeTabId } from './StudyModeBottomActions';

const TAB_PEEK_SCROLL_OFFSET_PX = 140;

interface UseStudyModeTabAutoScrollProps {
  verseKey: string;
  activeTab: StudyModeTabId | null | undefined;
  containerRef: RefObject<HTMLDivElement>;
  bottomActionsRef: RefObject<HTMLDivElement>;
  tabContentRef: RefObject<HTMLDivElement>;
}

/**
 * Manages tab content spacer sizing and one-time auto-scroll behavior for Study Mode tabs.
 *
 * @param {UseStudyModeTabAutoScrollProps} props - Hook inputs.
 * @returns {{ tabContentMinBlockSize: number | null }} Dynamic minimum block size for tab content.
 */
const useStudyModeTabAutoScroll = ({
  verseKey,
  activeTab,
  containerRef,
  bottomActionsRef,
  tabContentRef,
}: UseStudyModeTabAutoScrollProps) => {
  const initialActiveTabRef = useRef<StudyModeTabId | null>(null);
  const hasInitialAutoScrollRef = useRef(false);
  const hasSpacerCorrectionScrollRef = useRef(false);
  const [tabContentMinBlockSize, setTabContentMinBlockSize] = useState<number | null>(null);
  const [hasComputedTabSpacing, setHasComputedTabSpacing] = useState(false);

  const scrollToTabPreview = useCallback(() => {
    if (!activeTab || !bottomActionsRef.current || !containerRef.current) return;

    const scrollContainer = containerRef.current.parentElement;
    if (!scrollContainer) return;

    const targetScrollTop = Math.max(
      bottomActionsRef.current.offsetTop - TAB_PEEK_SCROLL_OFFSET_PX,
      0,
    );

    scrollContainer.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth',
    });
  }, [activeTab, bottomActionsRef, containerRef]);

  const updateTabContentMinBlockSize = useCallback(() => {
    const isInvalidState =
      !activeTab || !containerRef.current || !bottomActionsRef.current || !tabContentRef.current;
    if (isInvalidState) return;

    const scrollContainer = containerRef.current.parentElement;
    if (!scrollContainer) return;
    setHasComputedTabSpacing(true);

    const desiredScrollTop = Math.max(
      bottomActionsRef.current.offsetTop - TAB_PEEK_SCROLL_OFFSET_PX,
      0,
    );
    const maxScrollTop = scrollContainer.scrollHeight - scrollContainer.clientHeight;
    const missingScrollableSpace = desiredScrollTop - maxScrollTop;

    if (missingScrollableSpace <= 0) return;

    const currentTabHeight = tabContentRef.current.getBoundingClientRect().height;
    if (currentTabHeight <= 0) return;

    const nextMinBlockSize = Math.ceil(currentTabHeight + missingScrollableSpace);
    setTabContentMinBlockSize((previous) =>
      previous === null ? nextMinBlockSize : Math.max(previous, nextMinBlockSize),
    );
  }, [activeTab, bottomActionsRef, containerRef, tabContentRef]);

  // Reset dynamic tab spacer when content context changes
  useEffect(() => {
    setTabContentMinBlockSize(null);
    setHasComputedTabSpacing(false);
  }, [verseKey, activeTab]);

  // Capture the first opened tab for this modal session.
  useEffect(() => {
    if (activeTab && !initialActiveTabRef.current) {
      initialActiveTabRef.current = activeTab;
    }
  }, [activeTab]);

  // Initial auto-scroll: only once for the first tab opened in this modal session.
  useEffect(() => {
    const shouldSkipInitialScroll =
      !activeTab || activeTab !== initialActiveTabRef.current || hasInitialAutoScrollRef.current;
    if (shouldSkipInitialScroll) return undefined;
    hasInitialAutoScrollRef.current = true;

    let frameId: number | null = null;
    const scheduleScroll = () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(scrollToTabPreview);
    };

    scheduleScroll();
    const timeoutId = window.setTimeout(scheduleScroll, 120);
    const lateTimeoutId = window.setTimeout(scheduleScroll, 260);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
      clearTimeout(lateTimeoutId);
    };
  }, [activeTab, scrollToTabPreview]);

  // Spacer correction scroll: run once after dynamic tab spacer is computed.
  useEffect(() => {
    const shouldSkipSpacerCorrection =
      !activeTab ||
      activeTab !== initialActiveTabRef.current ||
      hasSpacerCorrectionScrollRef.current ||
      !hasComputedTabSpacing;
    if (shouldSkipSpacerCorrection) return undefined;
    hasSpacerCorrectionScrollRef.current = true;

    let frameId: number | null = null;
    const scheduleScroll = () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(scrollToTabPreview);
    };

    scheduleScroll();
    const timeoutId = window.setTimeout(scheduleScroll, 120);
    const lateTimeoutId = window.setTimeout(scheduleScroll, 260);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
      clearTimeout(lateTimeoutId);
    };
  }, [activeTab, hasComputedTabSpacing, scrollToTabPreview]);

  // Ensure enough scrollable space so the verse preview "peek" remains visible on all screen heights
  useEffect(() => {
    if (!activeTab) return undefined;

    let frameId: number | null = null;
    const scheduleUpdate = () => {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(updateTabContentMinBlockSize);
    };

    scheduleUpdate();
    const timeoutId = window.setTimeout(scheduleUpdate, 120);

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(scheduleUpdate) : null;
    const scrollContainer = containerRef.current?.parentElement;
    if (resizeObserver) {
      if (scrollContainer) resizeObserver.observe(scrollContainer);
      if (bottomActionsRef.current) resizeObserver.observe(bottomActionsRef.current);
      if (tabContentRef.current) resizeObserver.observe(tabContentRef.current);
    }

    window.addEventListener('resize', scheduleUpdate);

    return () => {
      window.removeEventListener('resize', scheduleUpdate);
      if (frameId) cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
      resizeObserver?.disconnect();
    };
  }, [
    activeTab,
    verseKey,
    updateTabContentMinBlockSize,
    containerRef,
    bottomActionsRef,
    tabContentRef,
  ]);

  return { tabContentMinBlockSize };
};

export default useStudyModeTabAutoScroll;
