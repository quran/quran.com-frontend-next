import { useContext, useMemo } from 'react';

import useCountRangeLayeredTranslations from './useCountRangeLayeredTranslations';

import DataContext from '@/contexts/DataContext';
import { getChapterData } from '@/utils/chapter';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

type BatchedCountRangeLayeredTranslationsResponse = {
  data: number | null;
  isLoading: boolean;
  error: Error | null;
};

const BATCH_SIZE = 20;

const useBatchedCountRangeLayeredTranslations = (
  verseKey: string,
): BatchedCountRangeLayeredTranslationsResponse => {
  const [chapterId, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey || '').map(Number);
  const chaptersData = useContext(DataContext);
  const chapterData = getChapterData(chaptersData, chapterId.toString());

  const batchRange = useMemo(() => {
    if (!verseKey || !chapterId || !verseNumber || !chapterData) return null;
    if (Number.isNaN(chapterId) || Number.isNaN(verseNumber)) return null;

    const batchStart = Math.floor((verseNumber - 1) / BATCH_SIZE) * BATCH_SIZE + 1;
    const batchEnd = Math.min(batchStart + BATCH_SIZE - 1, chapterData.versesCount);

    return {
      from: `${chapterId}:${batchStart}`,
      to: `${chapterId}:${batchEnd}`,
    };
  }, [verseKey, chapterId, verseNumber, chapterData]);

  const { data, isLoading, error } = useCountRangeLayeredTranslations(batchRange);

  return {
    data: data?.[verseKey] ?? 0,
    isLoading,
    error,
  };
};

export default useBatchedCountRangeLayeredTranslations;
