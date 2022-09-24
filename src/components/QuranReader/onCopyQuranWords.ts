import clipboardCopy from 'clipboard-copy';

import { DATA_ATTRIBUTE_WORD_LOCATION } from '@/dls/QuranWord/QuranWord';
import { getWordDataByLocation } from '@/utils/verse';
import { getWordTextFieldNameByFont } from '@/utils/word';
import { QuranFont } from 'types/QuranReader';
import Verse from 'types/Verse';

/**
 * 1) select all DOM nodes that contain data attribute `data-word-location`
 * 2) see if those nodes are within `selection`
 * 3) extract uthmani_text for those nodes
 * 4) copy those uthmani_text to clipboard
 *
 * We need to use uthmani_text instead of the rendered text to support unicode based fonts like v1 and v2.
 *
 * @param {React.ClipboardEvent<HTMLDivElement>} event
 * @param {Verse[]} verses all verses to scan for `data-word-location`
 * @param {QuranFont} quranFont font to copy, if not `text_indopak` or `text_uthmani` then will use `text_uthmani` to support unicode based fonts
 */
const onCopyQuranWords = (
  event: React.ClipboardEvent<HTMLDivElement>,
  verses: Verse[],
  quranFont: QuranFont,
) => {
  const selection = document.getSelection();
  const quranWordsToCopy = Array.from(
    document.querySelectorAll(`[${DATA_ATTRIBUTE_WORD_LOCATION}]`),
  )
    .filter((node) => selection.containsNode(node, true))
    .map((node) => {
      const wordLocation = node.getAttribute(DATA_ATTRIBUTE_WORD_LOCATION);
      return extractText(wordLocation, verses, quranFont);
    });

  if (quranWordsToCopy.length > 0) {
    // only do prevent default & call clipboardCopy when there are quran words to copy
    // otherwise, user can't copy the translation text
    event.preventDefault();
    clipboardCopy(quranWordsToCopy.join(' '));
  }
};

/**
 *
 * @param {string} wordLocation example: "1:1:1" (chapter 1, verse 1, word position 1)
 * @param {Verse[]} verses list of verses to search for wordLocation
 * @param {QuranFont} quranFont font to copy, if not `text_indopak` or `text_uthmani` then will use `text_uthmani` to support unicode based fonts
 * @returns {string} text of the wordLocation. example "ٱلْحَمْدُ"
 */
const extractText = (wordLocation: string, verses: Verse[], quranFont: QuranFont) => {
  const [chapter, verse, location] = getWordDataByLocation(wordLocation);

  // find the verse
  const selectedVerse = verses.find((v) => v.verseKey === `${chapter}:${verse}`);
  if (!selectedVerse) {
    return '';
  }

  // find the word
  const selectedWord = selectedVerse.words.find(
    (word) => Number(word.position) === Number(location),
  );
  if (!selectedWord) {
    return '';
  }
  return selectedWord[getWordTextFieldNameByFont(quranFont)];
};

export default onCopyQuranWords;
