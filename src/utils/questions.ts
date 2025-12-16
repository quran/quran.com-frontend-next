/**
 * Type for questions data returned by the API.
 */
export type QuestionsData = {
  types: Record<string, number>;
  total: number;
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
