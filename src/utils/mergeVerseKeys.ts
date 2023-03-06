import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

// given an array of verse keys, merge back to back verses into a single range like this:
// ['1:1', '1:2', '1:3', '1:7'] will be ['1:1-1:3', '1:7-1:7']
function mergeVerseKeys(
  verses: Set<string>,
  // chaptersData: ChaptersData
) {
  const combinedVerses = new Set<string>();
  const verseMap: { [key: string]: number[] } = {};

  // Create a map of chapter to verse numbers
  verses.forEach((verseKey) => {
    const [chapter, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
    if (!verseMap[chapter]) verseMap[chapter] = [];
    verseMap[chapter].push(Number(verseNumber));
  });

  // Merge the verse numbers for each chapter
  const entries = Object.entries(verseMap);
  for (let i = 0; i < entries.length; i += 1) {
    // eslint-disable-next-line prefer-const
    const [chapter, verseNumbers] = entries[i];
    verseNumbers.sort((a, b) => a - b);

    let start = verseNumbers[0];
    let end = start;

    for (let j = 1; j < verseNumbers.length; j += 1) {
      // merge back to back verses into a single range
      // OR
      // merge verses into a single range if they are not back to back but the distance is 1
      // e.g. 1:1, 1:2, 1:3, 1:5 will be merged into 1:1-1:5
      if (verseNumbers[j] - end > 0 && verseNumbers[j] - end <= 5) {
        end = verseNumbers[j];
      } else {
        combinedVerses.add(`${chapter}:${start}-${chapter}:${end}`);
        start = verseNumbers[j];
        end = start;
      }
    }
    combinedVerses.add(`${chapter}:${start}-${chapter}:${end}`);
  }

  return combinedVerses;
}

export default mergeVerseKeys;
