import { useCallback } from 'react';

import { useSWRConfig, MutatorCallback, MutatorOptions } from 'swr';

/**
 * a hook on top of useSWRConfig.mutate to mutate multiple keys in the cache by matching a regex expression against
 * each of the keys in the cache.
 *
 * Inspired by {@see https://github.com/vercel/swr/discussions/488#discussioncomment-743074}
 *
 * @returns {(url: string, callback: MutatorCallback, options: MutatorOptions) => void} mutateMultipleKeys
 */
const useMutateMultipleKeys = (): ((url: string, callback: MutatorCallback) => void) => {
  const { cache, mutate } = useSWRConfig();
  const mutateMultipleKeys = useCallback(
    (regexExpression: string, callback: MutatorCallback, options?: MutatorOptions) => {
      // @ts-ignore
      const cacheKeys = Array.from(cache.keys());
      cacheKeys.forEach((key: string) => {
        const pattern = new RegExp(regexExpression);
        const keyMatches = pattern.test(key);
        if (keyMatches) {
          mutate(key, callback, options);
        }
      });
    },

    [cache, mutate],
  );
  return mutateMultipleKeys;
};

export default useMutateMultipleKeys;
