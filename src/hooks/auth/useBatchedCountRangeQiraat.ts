import { useContext, useMemo } from 'react';

import useCountRangeQiraat from './useCountRangeQiraat';

import DataContext from '@/contexts/DataContext';
import { getChapterData } from '@/utils/chapter';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

type BatchedCountRangeQiraatResponse = {
  data: number | null;
  isLoading: boolean;
  error: Error | null;
};

const BATCH_SIZE = 20;

/**
 * Hook that fetches qiraat counts in batches of 20 verses to optimize API calls.
 * When asked for a verse, it fetches a predictable range of 20 verses.
 * Follows the same pattern as useBatchedCountRangeNotes and useBatchedCountRangeQuestions.
 *
 * Examples:
 * - Request 1:1 → fetches 1:1 to 1:20
 * - Request 1:5 → fetches 1:1 to 1:20 (same batch)
 * - Request 1:25 → fetches 1:21 to 1:40
 *
 * @param {string} verseKey - The verse key in format "chapterId:verseNumber"
 * @returns {BatchedCountRangeQiraatResponse} Object containing the qiraat count, loading state, and error
 */
const useBatchedCountRangeQiraat = (verseKey: string): BatchedCountRangeQiraatResponse => {
  const [chapterId, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey || '').map(Number);

  const chaptersData = useContext(DataContext);
  const chapterData = getChapterData(chaptersData, chapterId.toString());

  const batchRange = useMemo(() => {
    if (!verseKey || !chapterId || !verseNumber || !chapterData) return null;
    if (Number.isNaN(chapterId) || Number.isNaN(verseNumber)) return null;

    // Calculate batch: round down to nearest 20, then add 1
    // Verse 1-20 → batch starts at 1
    // Verse 21-40 → batch starts at 21
    // Verse 41-60 → batch starts at 41
    const batchStart = Math.floor((verseNumber - 1) / BATCH_SIZE) * BATCH_SIZE + 1;
    const batchEnd = Math.min(batchStart + BATCH_SIZE - 1, chapterData.versesCount);

    return {
      from: `${chapterId}:${batchStart}`,
      to: `${chapterId}:${batchEnd}`,
    };
  }, [verseKey, chapterId, verseNumber, chapterData]);

  const { data, isLoading, error } = useCountRangeQiraat(batchRange);

  return {
    data: data?.[verseKey] ?? 0,
    isLoading,
    error,
  };
};

export default useBatchedCountRangeQiraat;
