import useBrowserLayoutEffect from './useBrowserLayoutEffect';

/**
 * This hook disables body scrolling depending on the value passed
 * to the hook. Inspired by {@link https://usehooks-typescript.com/react-hook/use-locked-body}
 *
 * @param {boolean} shouldDisableScrolling
 */
const preventScrollingToken = 'prevent-scrolling';
/**
 * access the count of how many components have requested to prevent scrolling
 */
let preventScrollingCount = 0;

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

    preventScrollingCount += 1;

    // if this is the first component to prevent scrolling, we need to hide the scrollbar
    if (preventScrollingCount === 1) {
      document.body.classList.add(preventScrollingToken);
    }

    return () => {
      preventScrollingCount -= 1;

      // if this is the last component to prevent scrolling, we need to show the scrollbar
      if (preventScrollingCount === 0) {
        document.body.classList.remove(preventScrollingToken);
      }
    };
  }, [shouldDisableScrolling]);
};

export default usePreventBodyScrolling;
