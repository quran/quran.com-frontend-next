/* eslint-disable import/prefer-default-export */
import { WordByWordDisplay, WordByWordType } from '../../types/QuranReader';

import { mergeTwoArraysUniquely } from './array';

/**
 * Given current state either locally on Redux or remotely
 * from legacy value, we need to generate new state values.
 *
 * @param {boolean} showWordByWordTranslation
 * @param {boolean} showWordByWordTransliteration
 * @param {WordByWordType[]} showTooltipFor
 * @returns {{ wordByWordDisplay: WordByWordDisplay[];wordByWordContentType: WordByWordType[] }}
 */
export const consolidateWordByWordState = (
  showWordByWordTranslation: boolean,
  showWordByWordTransliteration: boolean,
  showTooltipFor: WordByWordType[],
): {
  wordByWordDisplay: WordByWordDisplay[];
  wordByWordContentType: WordByWordType[];
} => {
  const wordByWordDisplay: WordByWordDisplay[] = [];
  let wordByWordContentType: WordByWordType[] = [];

  if (showWordByWordTranslation) {
    wordByWordContentType.push(WordByWordType.Translation);
  }
  if (showWordByWordTransliteration) {
    wordByWordContentType.push(WordByWordType.Transliteration);
  }

  // if show tooltip for is not empty
  if (showTooltipFor && showTooltipFor.length) {
    // merge showTooltipFor and wordByWordContentType array with unique value
    wordByWordContentType = mergeTwoArraysUniquely(showTooltipFor, wordByWordContentType);
    wordByWordDisplay.push(WordByWordDisplay.TOOLTIP);
    // if either of translation/transliteration are set to true, it means we need to show wbw inline
    if (showWordByWordTranslation || showWordByWordTransliteration) {
      wordByWordDisplay.push(WordByWordDisplay.INLINE);
    }
    // if either of translation/transliteration are set to true, it means we need to show wbw inline
  } else if (showWordByWordTranslation || showWordByWordTransliteration) {
    wordByWordDisplay.push(WordByWordDisplay.INLINE);
  }
  return {
    wordByWordDisplay,
    wordByWordContentType,
  };
};

/**
 * Given the current state, if the word by word display is empty,
 * we will set to Tooltip.
 *
 * @param {WordByWordDisplay[]} wordByWordDisplay
 * @returns {WordByWordDisplay[]}
 */
export const getDefaultWordByWordDisplay = (
  wordByWordDisplay?: WordByWordDisplay[],
): WordByWordDisplay[] => {
  // if word by word display settings are empty (current default), we will set tooltip
  if (!wordByWordDisplay || (wordByWordDisplay && wordByWordDisplay.length === 0)) {
    return [WordByWordDisplay.TOOLTIP];
  }
  return wordByWordDisplay;
};
