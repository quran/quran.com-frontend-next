import React, { useEffect } from 'react';

import {
  buildQcffFontFaceSource,
  getMushafFontFamily,
  getQuranFontForMushaf,
} from './mushaf-fonts';

import type { WidgetOptions, WidgetColors } from '@/types/ayah-widget';
import { QuranFont } from '@/types/QuranReader';
import { getFontFaceNameForPage, isQCFFont } from '@/utils/fontFaceHelper';
import type Verse from 'types/Verse';

type Props = {
  verse: Verse;
  options: WidgetOptions;
  colors: WidgetColors;
};

const CONTAINER_STYLE: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  marginBottom: 0,
  direction: 'rtl',
  textAlign: 'right',
  fontSize: 32,
  lineHeight: 1.5,
  fontFamily: "UthmanicHafs, 'Traditional Arabic', 'Arabic Typesetting', 'Scheherazade', serif",
};

const WORD_WRAPPER_STYLE: React.CSSProperties = {
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const WORD_STYLE: React.CSSProperties = {
  fontSize: 32,
  fontFamily: "UthmanicHafs, 'Traditional Arabic', 'Arabic Typesetting', 'Scheherazade', serif",
};

const TRANSLATION_STYLE_BASE: React.CSSProperties = {
  fontSize: 11,
  textAlign: 'center',
  whiteSpace: 'nowrap',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const ArabicVerse = ({ verse, options, colors }: Props): JSX.Element => {
  const quranFont = getQuranFontForMushaf(options.mushaf);
  const isQcfFont = isQCFFont(quranFont);
  const mushafFont = getMushafFontFamily(options.mushaf);
  const qcfFontFamily = isQcfFont ? getFontFaceNameForPage(quranFont, verse.pageNumber) : '';
  const resolvedFontFamily = isQcfFont ? `${qcfFontFamily}, ${mushafFont}` : mushafFont;

  useEffect(() => {
    if (!isQcfFont || !qcfFontFamily) return;
    const src = buildQcffFontFaceSource(options.mushaf, verse.pageNumber, options.theme);
    if (!src || typeof FontFace === 'undefined') return;
    const fontFace = new FontFace(qcfFontFamily, src);
    fontFace.load().then(() => {
      document.fonts.add(fontFace);
    });
  }, [isQcfFont, options.mushaf, options.theme, qcfFontFamily, verse.pageNumber]);

  const getGlyphText = (word: Verse['words'][number]): string => {
    const codeCandidate =
      quranFont === QuranFont.MadaniV1 ? word.codeV1 : word.codeV2 || word.codeV1;
    if (codeCandidate) return codeCandidate;
    if (quranFont === QuranFont.TajweedV4 && word.textUthmaniTajweed) {
      return word.textUthmaniTajweed;
    }
    return word.qpcUthmaniHafs || word.textUthmani || word.text || '';
  };

  return (
    <div
      data-verse-text
      data-verse-key={verse.verseKey}
      data-surah-name={options.surahName}
      data-arabic-verse={verse.textUthmani}
      style={{ ...CONTAINER_STYLE, fontFamily: resolvedFontFamily }}
    >
      {verse.words.map((word) => {
        if (word.charTypeName !== 'word') {
          return null;
        }
        if (isQcfFont) {
          const glyphText = getGlyphText(word);
          return (
            <div key={word.id ?? word.position} style={WORD_WRAPPER_STYLE}>
              <div
                style={{ ...WORD_STYLE, fontFamily: resolvedFontFamily }}
                // QCF glyphs are trusted from backend
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: glyphText }}
              />
              {options.enableWbw && word.translation?.text && (
                <div style={{ ...TRANSLATION_STYLE_BASE, color: colors.secondaryText }}>
                  {word.translation.text}
                </div>
              )}
            </div>
          );
        }

        let textToRender = word.textUthmani;
        if (options.mushaf === 'indopak' && word.textIndopak) {
          textToRender = word.textIndopak;
        }

        return (
          <div key={word.id ?? word.position} style={WORD_WRAPPER_STYLE}>
            <div style={{ ...WORD_STYLE, fontFamily: mushafFont }}>{textToRender}</div>
            {options.enableWbw && word.translation?.text && (
              <div style={{ ...TRANSLATION_STYLE_BASE, color: colors.secondaryText }}>
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
