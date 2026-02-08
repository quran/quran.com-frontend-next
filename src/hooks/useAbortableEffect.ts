import { useEffect, type DependencyList } from 'react';

/**
 * Run an effect with an AbortSignal that is aborted on cleanup to prevent state updates after unmount.
 *
 * @param {(signal: AbortSignal) => void | Promise<void>} effect async effect function receiving an AbortSignal.
 * @param {DependencyList} deps dependencies array for the effect.
 */
const useAbortableEffect = (
  effect: (signal: AbortSignal) => void | Promise<void>,
  deps: DependencyList,
): void => {
  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve(effect(controller.signal)).catch(() => {
      // Effect aborted or failed, ignore
    });
    return () => controller.abort();
  }, [effect, deps]);
};

export default useAbortableEffect;
