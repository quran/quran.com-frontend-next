import inRange from 'lodash/inRange';
import { selectCurrentTime } from 'src/redux/slices/AudioPlayer/state';
import Word, { CharType } from 'types/Word';

const shouldHighlight = (currentTime: number, segment: number[]) => {
  const startTime = segment[1];
  const endTime = segment[2];
  const currentTimeInMiliseconds = currentTime * 1000;
  return inRange(currentTimeInMiliseconds, startTime, endTime);
};

const findHighlightIndex = (currentTime: number, timestampSegments: [number[]], words: Word[]) =>
  words.findIndex(
    (word, index) =>
      timestampSegments &&
      // example: bismillahirrahmanirrahim, is detected as 4 words with chapterTypeName 'word'
      // + 1 word with chapterTypeName 'end'. So 5 word in total. Need to check before doing shouldHighlight
      word.charTypeName === CharType.Word &&
      shouldHighlight(currentTime, timestampSegments[index]),
  );

const selectHighlightIndex = (state, timestampSegments: [number[]], words: Word[]) => {
  const currentTime = selectCurrentTime(state);
  return findHighlightIndex(currentTime, timestampSegments, words);
};

export default selectHighlightIndex;
