import { useRouter } from 'next/router';
import useSWRImmutable from 'swr/immutable';

import { getLayeredTranslationCountWithinRange } from '@/api';
import Language from '@/types/Language';
import { makeLayeredTranslationCountWithinRangeUrl } from '@/utils/apiPaths';

type Range = {
  from: string;
  to: string;
};

type CountRangeLayeredTranslationsResponse = {
  data: Record<string, number> | null;
  isLoading: boolean;
  error: Error | null;
};

const useCountRangeLayeredTranslations = (range: Range): CountRangeLayeredTranslationsResponse => {
  const { locale } = useRouter();
  const language = (locale as Language) ?? Language.EN;

  const { data, isValidating, error } = useSWRImmutable<Record<string, number>>(
    range ? makeLayeredTranslationCountWithinRangeUrl(range, language) : null,
    () => getLayeredTranslationCountWithinRange(range, language),
  );

  return {
    data,
    isLoading: isValidating && !data,
    error,
  };
};

export default useCountRangeLayeredTranslations;
