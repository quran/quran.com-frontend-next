import React from 'react';

import styles from './EmbedVerseText.module.scss';

import { getFontFaceNameForPage, isQCFFont } from '@/utils/fontFaceHelper';
import { QuranFont } from 'types/QuranReader';
import Word, { CharType } from 'types/Word';

interface EmbedVerseTextProps {
  words: Word[];
  quranFont: QuranFont;
}

/**
 * Get the QCF glyph text based on font type.
 *
 * @param {string} textCodeV1 - QCF V1 glyph code
 * @param {string} textCodeV2 - QCF V2 glyph code
 * @param {QuranFont} font - The font type
 * @returns {string} The glyph text to render
 */
const getGlyphText = (textCodeV1: string, textCodeV2: string, font: QuranFont): string => {
  return font === QuranFont.MadaniV1 ? textCodeV1 : textCodeV2;
};

/**
 * Simplified VerseText component for the embed widget.
 * Renders QCF glyph fonts directly - browser handles font loading.
 *
 * @param {EmbedVerseTextProps} props - Component props
 * @param {Word[]} props.words - The words to render
 * @param {QuranFont} props.quranFont - The Quran font to use
 * @returns {JSX.Element} Rendered verse text
 */
const EmbedVerseText: React.FC<EmbedVerseTextProps> = ({ words, quranFont }) => {
  return (
    <div className={styles.verseTextContainer}>
      <div className={styles.verseText} translate="no">
        {words.map((word) => {
          if (isQCFFont(quranFont)) {
            // Render QCF glyph with inline font-family
            const glyphText = getGlyphText(word.codeV1 || '', word.codeV2 || '', quranFont);

            return (
              <span
                key={word.location}
                className={styles.glyphWord}
                style={{ fontFamily: getFontFaceNameForPage(quranFont, word.pageNumber) }}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: glyphText }}
              />
            );
          }

          // Render text word (for non-QCF fonts like Uthmani)
          if (word.charTypeName === CharType.Pause) {
            return null;
          }

          return (
            <span key={word.location} className={styles.textWord}>
              {word.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default EmbedVerseText;
