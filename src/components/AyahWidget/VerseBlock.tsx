import React from 'react';

import { getVerseMarginTop, WIDGET_FONT_SCALE } from './widget-utils';

import TranslationText from '@/components/QuranReader/TranslationView/TranslationText';
import VerseText from '@/components/Verse/VerseText';
import { MushafLines, QuranFont } from '@/types/QuranReader';
import { getVerseWords } from '@/utils/verse';
import type { WidgetOptions } from 'types/ayah-widget';
import type Verse from 'types/Verse';

type Props = {
  verse: Verse;
  index: number;
  options: WidgetOptions;
  quranFont: QuranFont;
};

/**
 * Renders a single verse block with Arabic text and translations.
 *
 * @param {Props} props - Component props.
 * @returns {JSX.Element} The verse block element.
 */
const VerseBlock = ({ verse, index, options, quranFont }: Props): JSX.Element => {
  const marginTop = getVerseMarginTop(index, options.showArabic);

  return (
    <div
      key={verse.verseKey ?? `${verse.chapterId}-${verse.verseNumber}-${index}`}
      data-verse-block
      data-verse-key={verse.verseKey ?? ''}
      data-verse-number={verse.verseNumber}
      data-surah-name={options.surahName}
      style={{ marginTop }}
    >
      {/*
       * Use the shared VerseText component in standalone mode.
       * This reuses the same rendering logic as the main QuranReader,
       * ensuring consistent font handling and word rendering.
       */}
      {options.showArabic && (
        <VerseText
          words={getVerseWords(verse)}
          isReadingMode={false}
          shouldShowH1ForSEO={index === 0}
          quranFontOverride={quranFont}
          quranTextFontScaleOverride={WIDGET_FONT_SCALE}
          mushafLinesOverride={MushafLines.FifteenLines}
          shouldShowWordByWordTranslation={options.enableWbw}
          shouldShowWordByWordTransliteration={options.enableWbwTransliteration}
          isStandaloneMode
        />
      )}
      {/* Render translations for the verse using the shared TranslationText component */}
      <div style={{ marginTop: options.showArabic ? 12 : 0 }}>
        {verse.translations?.map((translation) => (
          <TranslationText
            key={translation.id}
            languageId={translation.languageId}
            resourceName={
              options.showTranslatorNames
                ? translation.resourceName || translation.authorName
                : undefined
            }
            translationFontScale={3}
            text={
              // In range mode, prefix with verse number
              options.rangeEnd ? `${verse.verseNumber}. ${translation.text}` : translation.text
            }
          />
        ))}
      </div>
    </div>
  );
};

export default VerseBlock;
