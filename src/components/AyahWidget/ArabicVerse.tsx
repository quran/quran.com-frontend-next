/* eslint-disable max-lines */
import React, { useMemo } from 'react';

import { getMushafFontFamily, getQuranFontForMushaf } from './mushaf-fonts';

import type { WidgetColors, WidgetOptions } from '@/types/ayah-widget';
import { QuranFont } from '@/types/QuranReader';
import { getFontFaceNameForPage, isQCFFont } from '@/utils/fontFaceHelper';
import { isRTLLocale } from '@/utils/locale';
import type Verse from 'types/Verse';

type Props = {
  verse: Verse;
  options: WidgetOptions;
  colors: WidgetColors;
};

/**
 * Inline styles for the widget Arabic verse rendering.
 *
 * Note:
 * - We keep these as constants to avoid re-allocations on each render.
 * - The actual fontFamily is resolved dynamically depending on the mushaf/font type.
 */
const STYLES = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 0,
    direction: 'rtl',
    textAlign: 'right',
    fontSize: 32,
    lineHeight: 1.5,
    fontFamily: "UthmanicHafs, 'Traditional Arabic', 'Arabic Typesetting', 'Scheherazade', serif",
  } satisfies React.CSSProperties,

  wordWrapper: {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
  } satisfies React.CSSProperties,

  word: {
    fontSize: 32,
    fontFamily: "UthmanicHafs, 'Traditional Arabic', 'Arabic Typesetting', 'Scheherazade', serif",
  } satisfies React.CSSProperties,

  translation: {
    fontSize: 11,
    textAlign: 'center',
    whiteSpace: 'nowrap',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  } satisfies React.CSSProperties,
} as const;

/**
 * Convert western digits to Arabic-Indic digits.
 *
 * Example:
 * - "123" -> "١٢٣"
 *
 * @param {string | number} value - The input string or number to convert.
 * @returns {string} The converted string with Arabic-Indic digits.
 */
function toArabicNumber(value: string | number): string {
  const digits = [
    '\u0660',
    '\u0661',
    '\u0662',
    '\u0663',
    '\u0664',
    '\u0665',
    '\u0666',
    '\u0667',
    '\u0668',
    '\u0669',
  ];
  return String(value).replace(/\d/g, (digit) => digits[Number(digit)] ?? digit);
}

/**
 * Decide which Arabic text to render for non-QCF fonts.
 *
 * Priority (roughly):
 * - explicit word.text (already prepared by backend)
 * - Indopak if selected and available
 * - Uthmani
 * - verse number (Arabic digits) for end token
 *
 * @param {Verse['words'][number]} word - The word object.
 * @param {Verse} verse - The verse object.
 * @param {WidgetOptions['mushaf']} mushaf - The selected mushaf type.
 * @returns {string} The Arabic text to render.
 */
function getNonQcfWordText(
  word: Verse['words'][number],
  verse: Verse,
  mushaf: WidgetOptions['mushaf'],
): string {
  // Some APIs provide `word.text` already prepared (e.g. includes punctuation logic),
  // so we respect it when present.
  if (word.text) return word.text;

  if (mushaf === 'indopak' && word.textIndopak) return word.textIndopak;

  // Default fallback
  if (word.textUthmani) return word.textUthmani;

  // For end token: if no text is provided, show the verse number
  if (word.charTypeName === 'end' && verse.verseNumber) {
    return toArabicNumber(verse.verseNumber);
  }

  return '';
}

/**
 * Decide which glyph text to use for QCF fonts.
 *
 * - MadaniV1 => word.codeV1
 * - MadaniV2 => prefer word.codeV2, fallback to word.codeV1
 * - TajweedV4 => use word.textUthmaniTajweed if available
 *
 * If nothing is available, fallback to plain text fields.
 *
 * @param {Verse['words'][number]} word - The word object.
 * @param {QuranFont} quranFont - The selected Quran font.
 * @returns {string} The glyph text to use for rendering.
 */
function getQcfGlyphText(word: Verse['words'][number], quranFont: QuranFont): string {
  const codeCandidate = quranFont === QuranFont.MadaniV1 ? word.codeV1 : word.codeV2 || word.codeV1;

  if (codeCandidate) return codeCandidate;

  if (quranFont === QuranFont.TajweedV4 && word.textUthmaniTajweed) {
    return word.textUthmaniTajweed;
  }

  // Final fallback (plain text)
  return word.qpcUthmaniHafs || word.textUthmani || word.text || '';
}

/**
 * ArabicVerse
 *
 * Renders a verse word-by-word, optionally showing WBW translation under each word.
 *
 * Two rendering modes:
 * 1) QCF fonts (glyph-based):
 *    - Uses page-specific font-face names (e.g. QCF page fonts)
 *    - Uses `dangerouslySetInnerHTML` for glyph HTML (trusted from backend)
 *
 * 2) Non-QCF fonts (text-based):
 *    - Uses normal text nodes
 *    - Uses Uthmani/Indopak text depending on selected mushaf
 *
 * @param {Props} props - The component props.
 * @returns {JSX.Element} The rendered Arabic verse component.
 */
const ArabicVerse = ({ verse, options, colors }: Props): JSX.Element => {
  // Determine which Quran font corresponds to the selected mushaf (QPC, Indopak, Tajweed, etc.)
  const quranFont = useMemo(() => getQuranFontForMushaf(options.mushaf), [options.mushaf]);

  const isQcfFont = useMemo(() => isQCFFont(quranFont), [quranFont]);
  const mushafFont = useMemo(() => getMushafFontFamily(options.mushaf), [options.mushaf]);

  // Determine text direction for WBW translations
  const translationDirection = useMemo(
    () => (isRTLLocale(options.locale) ? 'rtl' : 'ltr'),
    [options.locale],
  );

  // QCF fonts use page-specific font-face names (one font per page).
  const qcfFontFamily = useMemo(() => {
    if (!isQcfFont) return '';
    return getFontFaceNameForPage(quranFont, verse.pageNumber);
  }, [isQcfFont, quranFont, verse.pageNumber]);

  /**
   * Resolved font family:
   * - For QCF: prefer page-specific font, then fallback to mushaf base font
   * - For non-QCF: use mushaf base font
   */
  const resolvedFontFamily = useMemo(() => {
    return isQcfFont ? `${qcfFontFamily}, ${mushafFont}` : mushafFont;
  }, [isQcfFont, qcfFontFamily, mushafFont]);

  return (
    <div
      data-verse-text
      data-verse-key={verse.verseKey}
      data-surah-name={options.surahName}
      data-arabic-verse={verse.textUthmani}
      style={{ ...STYLES.container, fontFamily: resolvedFontFamily }}
    >
      {verse.words.map((word) => {
        const isEndToken = word.charTypeName === 'end';
        const isWordToken = word.charTypeName === 'word';

        // Skip non-word tokens (like pause marks) except the "end" token.
        if (!isEndToken && !isWordToken) return null;

        const key = word.id ?? word.position;

        // QCF fonts: render glyph HTML
        if (isQcfFont) {
          const glyphText = getQcfGlyphText(word, quranFont);

          return (
            <div key={key} style={STYLES.wordWrapper}>
              <div
                style={{ ...STYLES.word, fontFamily: resolvedFontFamily }}
                // QCF glyph HTML is considered trusted from the backend.
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: glyphText }}
              />
              {!isEndToken && options.enableWbw && word.translation?.text && (
                <div
                  style={{
                    ...STYLES.translation,
                    color: colors.secondaryText,
                    direction: translationDirection,
                    unicodeBidi: 'isolate',
                  }}
                >
                  {word.translation.text}
                </div>
              )}
            </div>
          );
        }

        // Non-QCF fonts: render plain text
        const textToRender = getNonQcfWordText(word, verse, options.mushaf);
        if (!textToRender) return null;

        // Verse-end markers should prefer the mushaf font (for IndoPak ayah glyphs) and fall back to the default.
        const wordFontFamily = isEndToken ? `${mushafFont}, ${STYLES.word.fontFamily}` : mushafFont;

        return (
          <div key={key} style={STYLES.wordWrapper}>
            <div style={{ ...STYLES.word, fontFamily: wordFontFamily }}>{textToRender}</div>
            {!isEndToken && options.enableWbw && word.translation?.text && (
              <div
                style={{
                  ...STYLES.translation,
                  color: colors.secondaryText,
                  direction: translationDirection,
                  unicodeBidi: 'isolate',
                }}
              >
                {word.translation.text}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ArabicVerse;
