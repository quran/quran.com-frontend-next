import { useRef } from 'react';

import { useStore } from 'react-redux';

/**
 * A react hook for memoizing the redux state on mount time.
 * It povides the state of the store on the first rendering and does not lead to re-render due to state updates.
 * Equivalent to redux useSelector hook, useSelectorOnce expects a selector function as parameter.
 *
 *
 * @param {Function} selector
 * @returns {any} selectedState
 *
 * Reference: https://github.com/artcom/use-selector-once-hook/blob/master/src/index.js
 */
function useSelectorOnce(selector) {
  const store = useStore();
  const state = useRef();

  if (!state.current) {
    state.current = store.getState();
  }

  return selector(state.current);
}

export default useSelectorOnce;
