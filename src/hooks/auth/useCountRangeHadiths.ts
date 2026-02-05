import useSWRImmutable from 'swr/immutable';

import { getHadithCountWithinRange } from '@/api';
import Language from '@/types/Language';

type Range = {
  from: string;
  to: string;
};

type CountRangeHadithsResponse = {
  data: Record<string, number> | null;
  isLoading: boolean;
  error: Error | null;
};

/**
 * Hook to fetch hadith counts for a verse range.
 * Follows the same pattern as useCountRangeQiraat.
 *
 * @param {Range} hadithRange - The verse range object with from and to keys
 * @param {Language} language - The language of the hadiths
 * @returns {CountRangeHadithsResponse} Object containing the hadith counts, loading state, and error
 */
const useCountRangeHadiths = (
  hadithRange: Range,
  language: Language,
): CountRangeHadithsResponse => {
  const fetcher = () => getHadithCountWithinRange(hadithRange, language);

  const { data, isValidating, error } = useSWRImmutable<Record<string, number>>(
    hadithRange && language
      ? `hadith-count-${hadithRange.from}-${hadithRange.to}-${language}`
      : null,
    fetcher,
  );

  return {
    data,
    isLoading: isValidating && !data,
    error,
  };
};

export default useCountRangeHadiths;
