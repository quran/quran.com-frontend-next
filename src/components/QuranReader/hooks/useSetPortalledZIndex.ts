import useBrowserLayoutEffect from '@/hooks/useBrowserLayoutEffect';

/**
 * A hook that will run when enabled that will manually set the zIndex of the parent of
 * a portalled Radix component (e.g. a modal or popover menu) to 1 so that it doesn't
 * stack on top of a modal since the default behavior of Radix is to set a really high
 *  value of the zIndex of the container of the portalled component which causes it to
 * be on always on top of our custom Modal.
 *
 * @param {string} querySelectorKey
 * @param {boolean} isEnabled
 */
const useSetPortalledZIndex = (querySelectorKey: string, isEnabled = true) => {
  useBrowserLayoutEffect(() => {
    if (isEnabled) {
      // eslint-disable-next-line i18next/no-literal-string
      const portalledElement = window.document.querySelector(`[${querySelectorKey}="true"]`);
      if (portalledElement) {
        // we need to react a few elements up the tree to get to the container that we want to override its zIndex
        const radixPortalElement = portalledElement.closest('[data-radix-portal]') as HTMLElement;
        if (radixPortalElement) {
          radixPortalElement.style.zIndex = '1';
        }
      }
    }
  }, [isEnabled, querySelectorKey]);
};

export default useSetPortalledZIndex;
