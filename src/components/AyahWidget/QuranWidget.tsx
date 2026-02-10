/* eslint-disable max-lines */
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
import useWidgetInteractions from '@/hooks/widget/useWidgetInteractions';
import { getQuranFontForMushaf } from '@/types/Embed';
import type { WidgetOptions, WidgetColors } from '@/types/Embed';
import type Verse from 'types/Verse';

type Props = {
  verses: Verse[];
  options: WidgetOptions;
  children?: React.ReactNode;
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

  const heightStyle = options.customHeight ? { height: options.customHeight } : {};

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
      "var(--font-family-figtree, 'Figtree', 'Helvetica Neue', Helvetica, Arial, sans-serif)",
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
    display: 'flex',
    flexDirection: 'column',
    ...widthStyle,
    ...heightStyle,
  } as unknown as React.CSSProperties;
};

/**
 * Generate the inline style tag for fixed font sizes in the widget.
 * @returns {string} The CSS string for the style tag.
 */
// eslint-disable-next-line react-func/max-lines-per-function
const getWidgetFontStyles = (): string => `
  .quran-widget [class*="VerseText_verseTextContainer"] span {
    font-size: ${WIDGET_ARABIC_FONT_SIZE} !important;
  }
  .quran-widget [data-verse-key],
  .quran-widget h1,
  .quran-widget [data-merged-verses] {
    --line-height: calc(${WIDGET_ARABIC_FONT_SIZE} + 20px) !important;
  }
  .quran-widget [class*="VerseText_verseTextContainer"] {
    --font-size: ${WIDGET_ARABIC_FONT_SIZE} !important;
    --line-height: calc(${WIDGET_ARABIC_FONT_SIZE} + 20px) !important;
    font-size: ${WIDGET_ARABIC_FONT_SIZE} !important;
  }
  .quran-widget [data-word-location] {
    font-size: ${WIDGET_ARABIC_FONT_SIZE} !important;
    line-height: var(--line-height) !important;
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
  .quran-widget [class*="InlineWordByWord_word"] {
    font-size: 12px !important;
    line-height: 1.2;
  }
  @media (max-width: 420px) {
    .quran-widget [data-verse-key] span,
    .quran-widget h1 span,
    .quran-widget [data-merged-verses] span {
      font-size: 22px !important;
    }
    .quran-widget [data-verse-key],
    .quran-widget h1,
    .quran-widget [data-merged-verses] {
      --line-height: calc(22px + 16px) !important;
    }
    .quran-widget [class*="translation-font-size-"] {
      font-size: 14px !important;
    }
    .quran-widget [class*="translation-font-size-"] p {
      font-size: 14px !important;
    }
    .quran-widget [class*="translationName"],
    .quran-widget p[class*="translationName"] {
      font-size: 11px !important;
    }
    .quran-widget [class*="InlineWordByWord_word"] {
      font-size: 11px !important;
      line-height: 1.2;
    }
    .quran-widget {
      --widget-header-title-size: 13px;
      --widget-header-link-size: 12px;
      --widget-header-padding: 12px 12px;
      --widget-header-action-size: 30px;
      --widget-header-action-radius: 8px;
      --widget-header-action-divider-height: 26px;
      --widget-footer-font-size: 13px;
      --widget-footer-button-padding: 8px 10px;
      --widget-footer-button-radius: 8px;
      --widget-footer-icon-size: 14px;
      --widget-footer-padding: 10px 12px;
    }
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
const QuranWidget = ({ verses, options, children }: Props): JSX.Element => {
  // Convert widget mushaf option to QuranFont for VerseText component
  const quranFont = getQuranFontForMushaf(options.mushaf);
  const widgetRef = React.useRef<HTMLDivElement | null>(null);

  // Use the existing font loading hook - this handles loading QCF fonts dynamically
  useQcfFont(quranFont, verses);
  useWidgetInteractions(options, widgetRef);

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
      ref={widgetRef}
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

      <WidgetFooterActions verse={firstVerse} options={options} colors={colors}>
        {children}
      </WidgetFooterActions>

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
