import React from 'react';

import MergedVersesContent from './MergedVersesContent';
import VerseBlock from './VerseBlock';

import { QuranFont } from '@/types/QuranReader';
import type { WidgetOptions } from 'types/ayah-widget';
import type Verse from 'types/Verse';

type Props = {
  verses: Verse[];
  options: WidgetOptions;
  quranFont: QuranFont;
};

/**
 * Widget Content Component
 *
 * Renders the main content area of the Quran widget, including:
 * - Arabic text (using VerseText component in standalone mode)
 * - Translations (using TranslationText component)
 *
 * Supports two rendering modes:
 * - Merged mode: All verses combined with grouped translations
 * - Sequential mode: Each verse rendered separately
 *
 * @param {Props} props - Component props.
 * @returns {JSX.Element} The widget content element.
 */
const WidgetContent = ({ verses, options, quranFont }: Props): JSX.Element => {
  const isMergedMode = options.mergeVerses && options.rangeEnd;

  if (isMergedMode) {
    return <MergedVersesContent verses={verses} options={options} quranFont={quranFont} />;
  }

  return (
    <>
      {verses.map((verseItem, index) => (
        <VerseBlock
          key={verseItem.verseKey ?? `${verseItem.chapterId}-${verseItem.verseNumber}-${index}`}
          verse={verseItem}
          index={index}
          options={options}
          quranFont={quranFont}
        />
      ))}
    </>
  );
};

export default WidgetContent;
