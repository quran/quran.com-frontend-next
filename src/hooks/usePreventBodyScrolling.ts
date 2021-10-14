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
    // disable body scrolling bt setting overflow to hidden on the body
    document.body.style.overflow = 'hidden';
    return () => {
      // revert it back
      document.body.style.overflow = originalOverflow;
    };
  }, [shouldDisableScrolling]);
};

export default usePreventBodyScrolling;
