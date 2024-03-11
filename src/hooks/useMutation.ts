import { useCallback, useState } from 'react';

type MutationFunction<TData, TVariables> = (variables?: TVariables) => Promise<TData>;
type MutationOptions<TData, TVariables> = {
  onSuccess?: (data: TData, variables?: TVariables) => void;
  onError?: (error: Error, variables?: TVariables) => void;
};

interface UseMutation<TData, TVariables> {
  mutate: (variables?: TVariables) => Promise<TData | null>;
  isMutating: boolean;
  error: Error | null;
}

/**
 * A helper hook to execute a mutation and handle the loading and error states.
 *
 * @param {MutationFunction<TData, TVariables>} mutationFn
 * @param {MutationOptions<TData, TVariables>} options
 * @returns {UseMutation<TData, TVariables>}
 */
const useMutation = <TData, TVariables>(
  mutationFn: MutationFunction<TData, TVariables>,
  options?: MutationOptions<TData, TVariables>,
): UseMutation<TData, TVariables> => {
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (variables?: TVariables) => {
      setIsMutating(true);
      setError(null);

      try {
        const response = await mutationFn(variables);
        options?.onSuccess?.(response, variables);
        return response;
      } catch (err) {
        setError(err);
        options?.onError?.(err, variables);
      } finally {
        setIsMutating(false);
      }

      return null;
    },
    [mutationFn, options],
  );

  return {
    mutate,
    isMutating,
    error,
  };
};

export default useMutation;
