import useTranslation from 'next-translate/useTranslation';
import useSWRImmutable from 'swr/immutable';

import { getQiraatJuncturesCount } from '@/api';
import Language from '@/types/Language';
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
  const { lang } = useTranslation();
  console.log('qiraatRange', qiraatRange);
  const { data, isValidating, error } = useSWRImmutable<Record<string, number>>(
    qiraatRange ? makeQiraatJuncturesCountUrl(qiraatRange, lang as Language) : null,
    async (): Promise<Record<string, number>> => {
      console.log('getQiraatJuncturesCount', qiraatRange, lang as Language);
      return getQiraatJuncturesCount(qiraatRange, lang as Language);
    },
  );

  return {
    data,
    isLoading: isValidating && !data,
    error,
  };
};

export default useCountRangeQiraat;
