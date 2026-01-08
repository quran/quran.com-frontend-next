import React from 'react';

import { groupTranslationsByTranslator, WIDGET_FONT_SCALE } from './widget-utils';

import TranslationText from '@/components/QuranReader/TranslationView/TranslationText';
import VerseText from '@/components/Verse/VerseText';
import { MushafLines, QuranFont } from '@/types/QuranReader';
import { getVerseWords } from '@/utils/verse';
import type { WidgetOptions } from 'types/ayah-widget';
import type Verse from 'types/Verse';

type Props = {
  verses: Verse[];
  options: WidgetOptions;
  quranFont: QuranFont;
};

/**
 * Renders all verses in merged mode (single Arabic block + grouped translations).
 *
 * @param {Props} props - Component props.
 * @returns {JSX.Element} The merged verses element.
 */
const MergedVersesContent = ({ verses, options, quranFont }: Props): JSX.Element => {
  return (
    <div data-merged-verses>
      {/* All Arabic text together - merge all words from all verses into one continuous flow */}
      {options.showArabic && (
        <VerseText
          words={verses.flatMap((verseItem) => getVerseWords(verseItem))}
          isReadingMode={false}
          shouldShowH1ForSEO
          quranFontOverride={quranFont}
          quranTextFontScaleOverride={WIDGET_FONT_SCALE}
          mushafLinesOverride={MushafLines.FifteenLines}
          shouldShowWordByWordTranslation={options.enableWbw}
          shouldShowWordByWordTransliteration={options.enableWbwTransliteration}
          isStandaloneMode
        />
      )}
      {/* All translations grouped by translator */}
      <div style={{ marginTop: options.showArabic ? 12 : 0 }}>
        {groupTranslationsByTranslator(verses).map((group) => (
          <TranslationText
            key={group.translatorName}
            languageId={group.languageId}
            resourceName={options.showTranslatorNames ? group.translatorName : undefined}
            translationFontScale={3}
            text={group.texts.join(' ')}
          />
        ))}
      </div>
    </div>
  );
};

export default MergedVersesContent;
