import { useContext, useMemo } from 'react';

import useCountRangeQuestions from './useCountRangeQuestions';

import DataContext from '@/contexts/DataContext';
import { getChapterData } from '@/utils/chapter';
import { QuestionsData } from '@/utils/questions';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

type BatchedCountRangeQuestionsResponse = {
  data: QuestionsData;
  isLoading: boolean;
  error: Error | null;
};

const BATCH_SIZE = 20;

/**
 * Hook that fetches question counts in batches of 10 verses to optimize API calls.
 * When asked for a verse, it fetches a predictable range of 10 verses.
 *
 * Examples:
 * - Request 1:1 → fetches 1:1 to 1:10
 * - Request 1:5 → fetches 1:1 to 1:10 (same batch)
 * - Request 1:15 → fetches 1:11 to 1:20
 *
 * @param {string} verseKey - The verse key in format "chapterId:verseNumber"
 * @returns {BatchedCountRangeQuestionsResponse} Object containing the questions data, loading state, and error
 */
const useBatchedCountRangeQuestions = (verseKey: string): BatchedCountRangeQuestionsResponse => {
  const [chapterId, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey).map(Number);

  const chaptersData = useContext(DataContext);
  const chapterData = getChapterData(chaptersData, chapterId.toString());

  const batchRange = useMemo(() => {
    if (!verseKey || !chapterId || !verseNumber || !chapterData) return null;
    if (Number.isNaN(chapterId) || Number.isNaN(verseNumber)) return null;

    // Calculate batch: round down to nearest 10, then add 1
    // Verse 1-10 → batch starts at 1
    // Verse 11-20 → batch starts at 11
    // Verse 21-30 → batch starts at 21
    const batchStart = Math.floor((verseNumber - 1) / BATCH_SIZE) * BATCH_SIZE + 1;
    const batchEnd = Math.min(batchStart + BATCH_SIZE - 1, chapterData.versesCount);

    return {
      from: `${chapterId}:${batchStart}`,
      to: `${chapterId}:${batchEnd}`,
    };
  }, [verseKey, chapterId, verseNumber, chapterData]);

  const { data, isLoading, error } = useCountRangeQuestions(batchRange);

  return {
    data: data?.[verseKey] || null,
    isLoading,
    error,
  };
};

export default useBatchedCountRangeQuestions;
