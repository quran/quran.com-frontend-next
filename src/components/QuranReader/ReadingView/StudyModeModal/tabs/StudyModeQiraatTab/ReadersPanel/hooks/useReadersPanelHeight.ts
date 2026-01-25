import { useState, useEffect, useRef } from 'react';

interface UseReadersPanelHeightReturn {
  panelRef: React.RefObject<HTMLDivElement>;
  headerRef: React.RefObject<HTMLDivElement>;
  readersListRef: React.RefObject<HTMLDivElement>;
  maxHeight: string | undefined;
}

const CONTAINER_PADDING = 50;
const DESKTOP_BREAKPOINT = 1024;
const MIN_READERS_LIST_HEIGHT = 300;

/**
 * Custom hook to calculate and set the available height for the readers panel.
 * On desktop, this ensures the panel takes 100% of the available visible height
 * and enables internal scrolling when content overflows.
 *
 * @returns {UseReadersPanelHeightReturn} - Ref to attach to the panel container and the max height
 */
const useReadersPanelHeight = (): UseReadersPanelHeightReturn => {
  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const readersListRef = useRef<HTMLDivElement>(null);

  const [maxHeight, setMaxHeight] = useState<string | undefined>();

  useEffect(() => {
    const isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT;
    if (!isDesktop) return setMaxHeight(undefined);

    const panel = panelRef.current;
    const header = headerRef.current;
    const readersList = readersListRef.current;

    const calculateHeight = () => {
      if (!panel || !header || !readersList) return;

      const panelRect = panel.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const availableHeight = viewportHeight - panelRect.top - CONTAINER_PADDING;

      const { marginBlockEnd } = getComputedStyle(header);
      const headerHeight = header.clientHeight + parseInt(marginBlockEnd.replace('px', ''), 10);

      const readersListMaxHeight = Math.max(
        availableHeight - headerHeight,
        MIN_READERS_LIST_HEIGHT,
      );

      setMaxHeight(`${readersListMaxHeight}px`);
    };

    calculateHeight();

    const modalContentElement = panel?.closest('[data-content-modal]') as HTMLElement | null;
    const scrollTarget = modalContentElement || window;

    window.addEventListener('resize', calculateHeight);
    scrollTarget.addEventListener('scroll', calculateHeight);

    return () => {
      window.removeEventListener('resize', calculateHeight);
      scrollTarget.removeEventListener('scroll', calculateHeight);
    };
  }, []);

  return { panelRef, headerRef, readersListRef, maxHeight };
};

export default useReadersPanelHeight;
