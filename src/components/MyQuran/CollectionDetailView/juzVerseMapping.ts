import juzToChapterVerseMappings from '@/data/juz-to-chapter-verse-mappings.json';

type VerseRange = {
  juzNumber: number;
  startVerse: number;
  endVerse: number;
};

type ReverseMapping = Record<string, VerseRange[]>;

const parseVerseRange = (range: string): { startVerse: number; endVerse: number } | null => {
  const [startStr, endStr] = range.split('-');
  const startVerse = Number(startStr);
  const endVerse = Number(endStr);
  if (!Number.isFinite(startVerse) || !Number.isFinite(endVerse)) return null;
  return { startVerse, endVerse };
};

const buildReverseMapping = (): ReverseMapping => {
  const reverse: ReverseMapping = {};

  Object.entries(juzToChapterVerseMappings as Record<string, Record<string, string>>).forEach(
    ([juzNumberStr, chapters]) => {
      const juzNumber = Number(juzNumberStr);
      if (!Number.isFinite(juzNumber)) return;

      Object.entries(chapters).forEach(([chapterIdStr, range]) => {
        const parsed = parseVerseRange(range);
        if (!parsed) return;

        reverse[chapterIdStr] ??= [];
        reverse[chapterIdStr].push({ juzNumber, ...parsed });
      });
    },
  );

  // Keep ranges ordered to make the scan predictable.
  Object.values(reverse).forEach((ranges) => {
    ranges.sort((a, b) => a.startVerse - b.startVerse);
  });

  return reverse;
};

const CHAPTER_TO_JUZ_RANGES = buildReverseMapping();

const getJuzNumberByVerse = (chapterId: number, verseNumber: number): number | null => {
  const ranges = CHAPTER_TO_JUZ_RANGES[String(chapterId)];
  if (!ranges) return null;

  const match = ranges.find(
    ({ startVerse, endVerse }) => verseNumber >= startVerse && verseNumber <= endVerse,
  );
  return match?.juzNumber ?? null;
};

export { getJuzNumberByVerse };

export default getJuzNumberByVerse;
