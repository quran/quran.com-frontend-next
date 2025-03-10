/* eslint-disable unicorn/filename-case */
import { getWindowOrigin } from '@/utils/url';
import { getChapterNumberFromKey } from '@/utils/verse';

// Helper function to build URL for verse
const buildVerseURL = (fromVerse: string, toVerse: string, lang: string) => {
  const origin = getWindowOrigin(lang) || 'https://quran.com';
  const chapterNumber = getChapterNumberFromKey(fromVerse);
  if (fromVerse === toVerse) {
    const verseNumber = fromVerse.split(':')[1];
    return `${origin}/${chapterNumber}/${verseNumber}`;
  }
  const startVerseNumber = fromVerse.split(':')[1];
  const endVerseNumber = toVerse.split(':')[1];
  return `${origin}/${chapterNumber}/${startVerseNumber}-${endVerseNumber}`;
};

export default buildVerseURL;
