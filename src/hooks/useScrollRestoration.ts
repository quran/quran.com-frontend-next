import { useCallback } from 'react';

/**
 * Hook for handling scroll restoration, particularly for translation tab rendering
 * which often has DOM changes that reset scroll position
 *
 * @returns {object} Object containing scroll restoration functions
 */
const useScrollRestoration = (): {
  handleTranslationTabScroll: (scrollPosition: number) => void;
  restoreScrollPosition: (
    scrollPosition: number,
    isTranslationTab: boolean,
    onComplete?: () => void,
  ) => void;
} => {
  /**
   * Handles the translation tab's scrolling issues by using a MutationObserver
   * This ensures the scroll position is maintained even when DOM changes occur
   *
   * @param {number} scrollPosition - The scroll position to maintain
   */
  const handleTranslationTabScroll = useCallback((scrollPosition: number) => {
    // Create a MutationObserver to detect DOM changes and maintain scroll position
    const observer = new MutationObserver(() => {
      window.scrollTo(0, scrollPosition);
    });

    // Start observing the document with the configured parameters
    observer.observe(document.body, { childList: true, subtree: true });

    // Stop observing after a short period to allow initial rendering
    setTimeout(() => {
      observer.disconnect();
      window.scrollTo(0, scrollPosition);
    }, 500);
  }, []);

  /**
   * Restores scroll position after navigation and handles special cases
   *
   * @param {number} scrollPosition - The scroll position to restore
   * @param {boolean} isTranslationTab - Whether this is the translation tab that needs special handling
   * @param {Function} [onComplete] - Optional callback to run after scroll restoration is complete
   */
  const restoreScrollPosition = useCallback(
    (scrollPosition: number, isTranslationTab: boolean, onComplete?: () => void) => {
      // Restore scroll position immediately
      window.scrollTo(0, scrollPosition);

      // For translation tab, apply special handling with MutationObserver
      if (isTranslationTab) {
        handleTranslationTabScroll(scrollPosition);
      }

      // Run any additional completion logic after a delay
      if (onComplete) {
        setTimeout(() => {
          onComplete();
          // Make sure scroll position is maintained
          window.scrollTo(0, scrollPosition);
        }, 500);
      }
    },
    [handleTranslationTabScroll],
  );

  return {
    handleTranslationTabScroll,
    restoreScrollPosition,
  };
};

export default useScrollRestoration;
