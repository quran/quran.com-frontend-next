import useBrowserLayoutEffect from './useBrowserLayoutEffect';

/**
 * This hook disables body scrolling depending on the value passed
 * to the hook. Inspired by {@link https://usehooks-typescript.com/react-hook/use-locked-body}
 *
 * @param {boolean} shouldDisableScrolling
 */
const usePreventBodyScrolling = (shouldDisableScrolling = false) => {
  /**
   * Do the side effect before render since we need to get the value of document.body.style.overflow
   * {@see https://kentcdodds.com/blog/useeffect-vs-uselayouteffect}
   */
  useBrowserLayoutEffect(() => {
    // if we shouldn't disable the scrolling, do nothing
    if (!shouldDisableScrolling) {
      return undefined;
    }
    // Save the initial body style
    const originalOverflow = document.body.style.overflow;
    const originalWidth = document.body.style.width;

    // leave space for the scrollbar to avoid causing a layout shift
    document.body.style.width = 'calc(100% - var(--scrollbar-width))';
    // disable body scrolling by setting overflow to hidden on the body
    document.body.style.overflow = 'hidden';
    return () => {
      // revert them back
      document.body.style.overflow = originalOverflow;
      document.body.style.width = originalWidth;
    };
  }, [shouldDisableScrolling]);
};

export default usePreventBodyScrolling;
