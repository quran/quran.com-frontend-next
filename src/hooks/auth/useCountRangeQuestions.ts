import useTranslation from 'next-translate/useTranslation';
import useSWRImmutable from 'swr/immutable';

import Language from '@/types/Language';
import { countQuestionsWithinRange, QuestionsData } from '@/utils/auth/api';
import { makeCountQuestionsWithinRangeUrl } from '@/utils/auth/apiPaths';

type Range = {
  from: string;
  to: string;
};

type CountRangeQuestionsResponse = {
  data: Record<string, QuestionsData>;
  isLoading: boolean;
  error: Error | null;
};

const useCountRangeQuestions = (questionsRange: Range): CountRangeQuestionsResponse => {
  const { lang } = useTranslation();
  const { data, isValidating, error } = useSWRImmutable<Record<string, QuestionsData>>(
    questionsRange
      ? makeCountQuestionsWithinRangeUrl(questionsRange.from, questionsRange.to, lang as Language)
      : null,
    async (): Promise<Record<string, QuestionsData>> => {
      return countQuestionsWithinRange(questionsRange.from, questionsRange.to, lang as Language);
    },
  );

  return {
    data,
    isLoading: isValidating && !data,
    error,
  };
};

export default useCountRangeQuestions;
