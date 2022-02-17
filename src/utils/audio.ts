import VerseTiming from 'types/VerseTiming';

export const getVerseTimingByVerseKey = (verseKey: string, verseTimings: VerseTiming[]) => {
  return verseTimings.find((verseTiming) => verseTiming.verseKey === verseKey);
};

// format the number to match the the mp3 file name structure
// e.g formatNumber(3) => '003'
//     formatNumber(10) => '010'
const formatNumber = (num: number) => num.toString().padStart(3, '0');
export const QURANCDN_AUDIO_BASE_URL = 'https://audio.qurancdn.com/';

/**
 * Given chapter, verse, and wordLocation. Get the mp3 audio url
 * For example
 * getWordByWordAudioUrl(1,2,1) => `'https://audio.qurancdn.com/wbw/001_002_001.mp3';
 *
 * @param {number} chapter the chapterId
 * @param {number} verse the verse number
 * @param {number} wordLocation the location of the word within a verse
 * @returns {string} audio url
 */
export const getWordByWordAudioUrl = (chapter: number, verse: number, wordLocation: number) => {
  const formattedChapter = formatNumber(chapter);
  const formattedVerse = formatNumber(verse);
  const formattedWordLocation = formatNumber(wordLocation);

  return `${QURANCDN_AUDIO_BASE_URL}wbw/${formattedChapter}_${formattedVerse}_${formattedWordLocation}.mp3`;
};
