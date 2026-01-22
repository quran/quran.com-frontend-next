import { useRef, useEffect, useState, useCallback, RefObject } from 'react';

import { StudyModeTabId } from './StudyModeBottomActions';

interface UseStudyModeScrollProps {
  verseKey: string;
  activeTab: StudyModeTabId | null | undefined;
}

interface UseStudyModeScrollReturn {
  containerRef: RefObject<HTMLDivElement>;
  bottomActionsRef: RefObject<HTMLDivElement>;
  tabContentRef: RefObject<HTMLDivElement>;
  hasScrolledDown: boolean;
  hasScrollableContent: boolean;
  showScrollGradient: boolean;
}

/**
 * Hook to manage scroll behavior and gradient visibility in StudyModeBody.
 *
 * @param {UseStudyModeScrollProps} props - The hook props
 * @param {string} props.verseKey - The current verse key
 * @param {StudyModeTabId | null | undefined} props.activeTab - The currently active tab
 * @returns {UseStudyModeScrollReturn} Refs and scroll state for StudyModeBody
 */
const useStudyModeScroll = ({
  verseKey,
  activeTab,
}: UseStudyModeScrollProps): UseStudyModeScrollReturn => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomActionsRef = useRef<HTMLDivElement>(null);
  const tabContentRef = useRef<HTMLDivElement>(null);
  const [hasScrolledDown, setHasScrolledDown] = useState(false);
  const [hasScrollableContent, setHasScrollableContent] = useState(false);
  const [hasScrolledToTab, setHasScrolledToTab] = useState(false);

  // Check if content is scrollable
  useEffect(() => {
    const checkScrollable = () => {
      if (containerRef.current) {
        const scrollContainer = containerRef.current.parentElement;
        if (scrollContainer) {
          const isScrollable = scrollContainer.scrollHeight > scrollContainer.clientHeight;
          setHasScrollableContent(isScrollable);
        }
      }
    };
    const timeoutId = setTimeout(checkScrollable, 100);
    return () => clearTimeout(timeoutId);
  }, [verseKey, activeTab]);

  // Handle scroll events
  const handleScroll = useCallback(
    (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.scrollTop > 10 && !hasScrolledDown) {
        setHasScrolledDown(true);
      }
    },
    [hasScrolledDown],
  );

  // Attach scroll listener
  useEffect(() => {
    if (containerRef.current) {
      const scrollContainer = containerRef.current.parentElement;
      if (scrollContainer) {
        scrollContainer.addEventListener('scroll', handleScroll);
        return () => scrollContainer.removeEventListener('scroll', handleScroll);
      }
    }
    return undefined;
  }, [handleScroll]);

  // Reset scroll state when verse changes
  useEffect(() => {
    setHasScrolledDown(false);
    setHasScrolledToTab(false);
  }, [verseKey]);

  // Reset scroll-to-tab state when tab closes
  useEffect(() => {
    if (!activeTab) {
      setHasScrolledToTab(false);
    }
  }, [activeTab]);

  // Auto-scroll to tab content when a tab is opened
  useEffect(() => {
    if (activeTab && !hasScrolledToTab && bottomActionsRef.current && containerRef.current) {
      setHasScrolledToTab(true);
      const scrollContainer = containerRef.current.parentElement;
      if (scrollContainer) {
        const bottomActionsTop = bottomActionsRef.current.offsetTop;
        scrollContainer.scrollTo({
          top: bottomActionsTop - 140,
          behavior: 'smooth',
        });
      }
    }
  }, [activeTab, hasScrolledToTab]);

  const showScrollGradient = hasScrollableContent && !hasScrolledDown && !activeTab;

  return {
    containerRef,
    bottomActionsRef,
    tabContentRef,
    hasScrolledDown,
    hasScrollableContent,
    showScrollGradient,
  };
};

export default useStudyModeScroll;
