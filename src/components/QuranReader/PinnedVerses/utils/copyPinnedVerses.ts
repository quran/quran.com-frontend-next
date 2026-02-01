import copyVerse from '@/components/Verse/AdvancedCopy/utils/copyVerse';
import { PinnedVerse } from '@/redux/slices/QuranReader/pinnedVerses';
import ChaptersData from '@/types/ChaptersData';
import Language from '@/types/Language';
import { QuranFont } from '@/types/QuranReader';
import { textToBlob } from '@/utils/blob';
import copyText from '@/utils/copyText';

interface CopyPinnedVersesParams {
  pinnedVerses: PinnedVerse[];
  lang: string;
  chaptersData: ChaptersData;
  selectedTranslations: number[];
}

/**
 * Copy a single verse using the advanced copy API.
 * Returns the formatted text for one verse.
 *
 * @param {string} verseKey - The verse key (e.g., "1:2")
 * @param {string} lang - The language code
 * @param {ChaptersData} chaptersData - The chapters data object
 * @param {number[]} selectedTranslations - Array of translation IDs
 * @returns {Promise<string>} The formatted verse text
 */
const getVerseTextToCopy = async (
  verseKey: string,
  lang: string,
  chaptersData: ChaptersData,
  selectedTranslations: number[],
): Promise<string> => {
  const translations: Record<number, { shouldBeCopied: boolean; name: string }> = {};
  selectedTranslations.forEach((translationId) => {
    translations[translationId] = {
      shouldBeCopied: true,
      name: '',
    };
  });

  return new Promise((resolve) => {
    copyVerse({
      showRangeOfVerses: false,
      rangeEndVerse: null,
      rangeStartVerse: null,
      shouldCopyFootnotes: false,
      shouldIncludeTranslatorName: true,
      shouldCopyFont: QuranFont.Uthmani,
      translations,
      verseKey,
      lang: lang as Language,
      chaptersData,
    }).then((blob) => {
      blob.text().then((text) => {
        resolve(text);
      });
    });
  });
};

/**
 * Copy all pinned verses to clipboard using the advanced copy API.
 *
 * @param {CopyPinnedVersesParams} params - The copy parameters
 * @returns {Promise<void>}
 */
const copyPinnedVerses = async ({
  pinnedVerses,
  lang,
  chaptersData,
  selectedTranslations,
}: CopyPinnedVersesParams): Promise<void> => {
  if (pinnedVerses.length === 0) {
    return;
  }

  const verseTextsPromises = pinnedVerses.map((pv) =>
    getVerseTextToCopy(pv.verseKey, lang, chaptersData, selectedTranslations),
  );

  const verseTexts = await Promise.all(verseTextsPromises);
  const fullText = verseTexts.join('\n\n');
  const textBlobPromise = Promise.resolve(textToBlob(fullText));
  await copyText(textBlobPromise);
};

export default copyPinnedVerses;
