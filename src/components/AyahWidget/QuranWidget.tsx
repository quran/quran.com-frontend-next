import React from 'react';

import {
  buildWidgetCopyData,
  getColors,
  getContentPadding,
  getTajweedFontPalette,
  getThemeDataAttribute,
  WIDGET_ARABIC_FONT_SIZE,
  WIDGET_TRANSLATION_FONT_SIZE,
} from './widget-utils';

import WidgetContent from '@/components/AyahWidget/WidgetContent';
import WidgetFooterActions from '@/components/AyahWidget/WidgetFooterActions';
import WidgetHeader from '@/components/AyahWidget/WidgetHeader';
import useQcfFont from '@/hooks/useQcfFont';
import { getQuranFontForMushaf } from '@/types/Embed';
import type { WidgetOptions, WidgetColors } from '@/types/Embed';
import type Verse from 'types/Verse';

type Props = {
  verses: Verse[];
  options: WidgetOptions;
};

/**
 * Get custom width/height styles based on widget options.
 * @param {WidgetOptions} options - Widget options.
 * @returns {object} Custom dimension styles.
 */
const getCustomDimensionStyles = (
  options: WidgetOptions,
): { widthStyle: React.CSSProperties; heightStyle: React.CSSProperties } => {
  const widthStyle = options.customWidth
    ? { width: options.customWidth, maxWidth: options.customWidth }
    : { width: '100%' };

  // Always use 100% height to fill iframe, but respect customHeight as maxHeight
  const heightStyle = options.customHeight
    ? { height: '100%', maxHeight: options.customHeight }
    : { height: '100%' };

  return { widthStyle, heightStyle };
};

/**
 * Build the widget container style object.
 * @param {WidgetColors} colors - Widget colors.
 * @param {WidgetOptions} options - Widget options.
 * @returns {React.CSSProperties} The container style object.
 */
const buildContainerStyle = (colors: WidgetColors, options: WidgetOptions): React.CSSProperties => {
  const { widthStyle, heightStyle } = getCustomDimensionStyles(options);

  return {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    backgroundColor: colors.bgColor,
    color: colors.textColor,
    border: `1px solid ${colors.borderColor}`,
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    boxSizing: 'border-box',
    overflowX: 'hidden',
    // Apply Tajweed font palette based on theme (--Light, --Dark, --Sepia)
    fontPalette: getTajweedFontPalette(options.theme),
    // Inject CSS variables for TranslationText component
    /* eslint-disable @typescript-eslint/naming-convention */
    '--color-text-faded': colors.secondaryText,
    '--color-text-link': colors.linkColor,
    // Use flexbox layout to fill iframe height with fixed header/footer
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    ...widthStyle,
    ...heightStyle,
  } as unknown as React.CSSProperties;
};

/**
 * Generate the inline style tag for fixed font sizes in the widget.
 * @returns {string} The CSS string for the style tag.
 */
const getWidgetFontStyles = (): string => `
  .quran-widget [data-verse-key] span,
  .quran-widget h1 span,
  .quran-widget [data-merged-verses] span {
    font-size: ${WIDGET_ARABIC_FONT_SIZE} !important;
  }
  .quran-widget [data-verse-key],
  .quran-widget h1,
  .quran-widget [data-merged-verses] {
    --line-height: calc(${WIDGET_ARABIC_FONT_SIZE} + 20px) !important;
  }
  .quran-widget [class*="translation-font-size-"] {
    font-size: ${WIDGET_TRANSLATION_FONT_SIZE} !important;
  }
  .quran-widget [class*="translation-font-size-"] p {
    font-size: ${WIDGET_TRANSLATION_FONT_SIZE} !important;
  }
  .quran-widget [class*="translationName"],
  .quran-widget p[class*="translationName"] {
    font-size: 12px !important;
  }
`;

/**
 * Quran Widget Component
 *
 * This component renders the Quran widget with Arabic text and translations.
 *
 * @param {Props} props - Component props.
 * @returns {JSX.Element} QuranWidget JSX Element
 */
const QuranWidget = ({ verses, options }: Props): JSX.Element => {
  // Convert widget mushaf option to QuranFont for VerseText component
  const quranFont = getQuranFontForMushaf(options.mushaf);

  // Use the existing font loading hook - this handles loading QCF fonts dynamically
  useQcfFont(quranFont, verses);

  if (!verses.length) {
    return <div />;
  }

  // Derive verse label and caption for data attributes
  const chapterNumber =
    verses[0]?.chapterId ?? (Number(options.ayah.split(':')[0] || 0) || undefined);
  const startVerse = verses[0]?.verseNumber ?? Number(options.ayah.split(':')[1] || 0);
  const verseLabel = options.rangeEnd ? `${startVerse}-${options.rangeEnd}` : `${startVerse}`;
  const rangeCaption = chapterNumber ? `${chapterNumber}:${verseLabel}` : options.ayah;

  // Get widget colors and compute derived values
  const colors = getColors(options.theme);
  const audioUrl = options.audioUrl || null;
  const firstVerse = verses[0];
  const hasTranslations = verses.some((v) => (v.translations?.length ?? 0) > 0);
  const contentPadding = getContentPadding(options.showArabic, hasTranslations);
  const copyData = buildWidgetCopyData(verses, options);

  return (
    <div
      className="quran-widget"
      data-theme={getThemeDataAttribute(options.theme)}
      data-copy-data={JSON.stringify(copyData)}
      style={buildContainerStyle(colors, options)}
    >
      {/* Override font sizes to be fixed (non-responsive) within the widget */}
      <style>{getWidgetFontStyles()}</style>

      <WidgetHeader verse={firstVerse} options={options} colors={colors} />

      <div
        style={{
          padding: contentPadding,
          marginBottom: hasTranslations ? 16 : 0,
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        data-translations-wrapper={options.showArabic ? 'with-arabic' : 'translations-only'}
        data-range-caption={options.rangeEnd ? rangeCaption : options.ayah}
      >
        <div style={{ margin: 'auto 0' }}>
          <WidgetContent verses={verses} options={options} quranFont={quranFont} />
        </div>
      </div>

      <WidgetFooterActions verse={firstVerse} options={options} colors={colors} />

      {options.enableAudio && audioUrl && (
        <audio
          data-audio-element
          data-audio-start={options.audioStart ?? ''}
          data-audio-end={options.audioEnd ?? ''}
          src={audioUrl}
        />
      )}
    </div>
  );
};

export default QuranWidget;
