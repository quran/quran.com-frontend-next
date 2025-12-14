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

/**
 * Normalize type keys to uppercase to handle API response inconsistencies.
 * The API may return keys like "cLARIFICATION" instead of "CLARIFICATION".
 * @param {Record<string, QuestionsData>} data - The questions data to normalize.
 * @returns {Record<string, QuestionsData>} The normalized questions data.
 */
export const normalizeQuestionsData = (
  data: Record<string, QuestionsData>,
): Record<string, QuestionsData> => {
  const normalized: Record<string, QuestionsData> = {};

  Object.entries(data).forEach(([verseKey, questionsData]) => {
    const normalizedTypes: Record<string, number> = {};

    Object.entries(questionsData.types || {}).forEach(([typeKey, count]) => {
      normalizedTypes[typeKey.toUpperCase()] = count;
    });

    normalized[verseKey] = {
      ...questionsData,
      types: normalizedTypes,
    };
  });

  return normalized;
};

const useCountRangeQuestions = (questionsRange: Range): CountRangeQuestionsResponse => {
  const { lang } = useTranslation();
  const { data, isValidating, error } = useSWRImmutable<Record<string, QuestionsData>>(
    questionsRange
      ? makeCountQuestionsWithinRangeUrl(questionsRange.from, questionsRange.to, lang as Language)
      : null,
    async (): Promise<Record<string, QuestionsData>> => {
      const result = await countQuestionsWithinRange(
        questionsRange.from,
        questionsRange.to,
        lang as Language,
      );
      return normalizeQuestionsData(result);
    },
  );

  return {
    data,
    isLoading: isValidating && !data,
    error,
  };
};

export default useCountRangeQuestions;
