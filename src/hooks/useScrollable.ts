import { useCallback, useRef, useEffect } from 'react';

const SCROLL_THRESHOLD = 2;

const useScrollable = (isRTL: boolean, hiddenClassName: string, indicatorOnly: boolean = false) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const leftButtonRef = useRef<HTMLDivElement>(null);
  const rightButtonRef = useRef<HTMLDivElement>(null);

  const updateScrollButtons = useCallback(() => {
    const el = scrollContainerRef.current;
    const leftBtn = leftButtonRef.current;
    const rightBtn = rightButtonRef.current;
    if (!el || !leftBtn || !rightBtn) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;

    const firstChild = el.firstElementChild as HTMLElement;
    const lastChild = el.lastElementChild as HTMLElement;

    const firstElementWidth = firstChild?.offsetWidth || SCROLL_THRESHOLD;
    const lastElementWidth = lastChild?.offsetWidth || SCROLL_THRESHOLD;

    let showLeft: boolean;
    let showRight: boolean;

    if (isRTL) {
      const absScrollLeft = Math.abs(scrollLeft);
      showLeft = absScrollLeft + clientWidth < scrollWidth - lastElementWidth;
      showRight = absScrollLeft > firstElementWidth;
    } else {
      showLeft = scrollLeft > firstElementWidth;
      showRight = scrollLeft + clientWidth < scrollWidth - lastElementWidth;
    }

    leftBtn.classList.toggle(hiddenClassName, !showLeft);
    rightBtn.classList.toggle(hiddenClassName, !showRight);
  }, [isRTL, hiddenClassName]);

  const onLeftButtonClick = useCallback(() => {
    if (indicatorOnly) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    if (isRTL) {
      el.scrollTo({ left: -el.scrollWidth, behavior: 'smooth' });
    } else {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [isRTL, indicatorOnly]);

  const onRightButtonClick = useCallback(() => {
    if (indicatorOnly) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    if (isRTL) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    }
  }, [isRTL, indicatorOnly]);

  const containerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.removeEventListener('scroll', updateScrollButtons);
      }

      scrollContainerRef.current = node;

      if (node) {
        node.addEventListener('scroll', updateScrollButtons, { passive: true });
        updateScrollButtons();
        requestAnimationFrame(updateScrollButtons);
      }
    },
    [updateScrollButtons],
  );

  useEffect(() => {
    updateScrollButtons();
    requestAnimationFrame(updateScrollButtons);

    window.addEventListener('resize', updateScrollButtons);

    return () => {
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [updateScrollButtons]);

  return { containerRef, leftButtonRef, rightButtonRef, onLeftButtonClick, onRightButtonClick };
};

export default useScrollable;
