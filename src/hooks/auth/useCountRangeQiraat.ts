import useSWRImmutable from 'swr/immutable';

import { getQiraatJuncturesCount } from '@/api';
import { makeQiraatJuncturesCountUrl } from '@/utils/apiPaths';

type Range = {
  from: string;
  to: string;
};

type CountRangeQiraatResponse = {
  data: Record<string, number> | null;
  isLoading: boolean;
  error: Error | null;
};

/**
 * Hook to fetch qiraat counts for a verse range.
 * Follows the same pattern as useCountRangeNotes and useCountRangeQuestions.
 *
 * @param {Range} qiraatRange - The verse range object with from and to keys
 * @returns {CountRangeQiraatResponse} Object containing the qiraat counts, loading state, and error
 */
const useCountRangeQiraat = (qiraatRange: Range): CountRangeQiraatResponse => {
  const { data, isValidating, error } = useSWRImmutable<Record<string, number>>(
    qiraatRange ? makeQiraatJuncturesCountUrl(qiraatRange) : null,
    () => getQiraatJuncturesCount(qiraatRange),
  );

  return {
    data,
    isLoading: isValidating && !data,
    error,
  };
};

export default useCountRangeQiraat;
