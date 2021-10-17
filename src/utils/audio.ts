import VerseTiming from 'types/VerseTiming';

export const getVerseTimingByVerseKey = (verseKey: string, verseTimings: VerseTiming[]) => {
  return verseTimings.find((verseTiming) => verseTiming.verseKey === verseKey);
};

// format the number to match the file name structure
// e.g formatNumber(3) => '003'
//     formatNumber(10) => '010'
const formatNumber = (num: number) => num.toString().padStart(3, '0');
const BASE_URL = 'https://audio.qurancdn.com/wbw';
export const getWordByWordAudioUrl = (chapter: number, verse: number, wordLocation: number) => {
  const formattedChapter = formatNumber(chapter);
  const formattedVerse = formatNumber(verse);
  const formattedWordLocation = formatNumber(wordLocation);

  return `${BASE_URL}/${formattedChapter}_${formattedVerse}_${formattedWordLocation}.mp3`;
};
