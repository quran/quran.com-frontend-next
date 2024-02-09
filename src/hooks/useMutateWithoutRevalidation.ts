import { useCallback } from 'react';

import { useSWRConfig, MutatorCallback, MutatorOptions, Key } from 'swr';

export const NO_REVALIDATION_MUTATOR_OPTIONS: MutatorOptions = { revalidate: false };

/**
 * a hook on top of useSWRConfig.mutate to mutate without revalidation
 *
 * @returns {(url: string, callback: MutatorCallback) => void} mutateWithoutRevalidation
 */
const useMutateWithoutRevalidation = (): ((url: Key, callback: MutatorCallback) => void) => {
  const { mutate } = useSWRConfig();
  const mutateWithoutRevalidation = useCallback(
    (url: Key, callback: MutatorCallback) => {
      mutate(url, callback, NO_REVALIDATION_MUTATOR_OPTIONS);
    },
    [mutate],
  );
  return mutateWithoutRevalidation;
};

export default useMutateWithoutRevalidation;
