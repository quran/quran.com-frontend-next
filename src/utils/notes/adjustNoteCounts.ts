import { isVerseKeyWithinRanges } from '@/utils/verse';

/**
 * Adjust cached notes counts client-side without revalidating.
 * - delta: +1 for add, -1 for delete
 */
const adjustNoteCounts = (
  cache: any,
  mutate: (key: string, data?: any, shouldRevalidate?: boolean) => any,
  verseKey: string | undefined,
  delta: number,
) => {
  if (!verseKey) return;

  const keys = [...(cache as any).keys()].filter((key: string) => {
    if (!key.startsWith('countNotes/')) return false;
    // key format: countNotes/<range> e.g. countNotes/1:1-1:7
    const rangeString = key.replace('countNotes/', '');
    return isVerseKeyWithinRanges(verseKey, rangeString);
  }) as string[];

  keys.forEach((key) => {
    mutate(
      key,
      (prev: any) => {
        if (!prev || typeof prev !== 'object') return prev;
        const current = typeof prev[verseKey] === 'number' ? prev[verseKey] : 0;
        return {
          ...prev,
          [verseKey]: Math.max(0, current + delta),
        };
      },
      false,
    );
  });
};
export default adjustNoteCounts;
