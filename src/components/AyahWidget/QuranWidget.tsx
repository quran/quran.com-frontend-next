/* eslint-disable max-lines */
import React from 'react';

import WidgetFooterActions from '@/components/AyahWidget/WidgetFooterActions';
import WidgetHeader from '@/components/AyahWidget/WidgetHeader';
import TranslationText from '@/components/QuranReader/TranslationView/TranslationText';
import VerseText from '@/components/Verse/VerseText';
import useQcfFont from '@/hooks/useQcfFont';
import ThemeType from '@/redux/types/ThemeType';
import { MushafLines } from '@/types/QuranReader';
import { getVerseWords } from '@/utils/verse';
import { getQuranFontForMushaf } from 'types/ayah-widget';
import type { WidgetOptions, WidgetColors } from 'types/ayah-widget';
import type Verse from 'types/Verse';

type Props = {
  verses: Verse[];
  options: WidgetOptions;
};

/**
 * Map widget theme to Tajweed font-palette CSS value.
 * The font palettes are defined by TajweedFontPalettes component.
 * @param {WidgetOptions['theme']} theme - The widget theme.
 * @returns {string} The CSS font-palette value.
 */
const getTajweedFontPalette = (theme: WidgetOptions['theme']): string => {
  switch (theme) {
    case ThemeType.Dark:
      return '--Dark';
    case ThemeType.Sepia:
      return '--Sepia';
    case ThemeType.Light:
    default:
      return '--Light';
  }
};

// eslint-disable-next-line react-func/max-lines-per-function
const getColors = (theme: WidgetOptions['theme']): WidgetColors => {
  switch (theme) {
    case ThemeType.Dark:
      return {
        borderColor: '#2d3748',
        linkColor: '#60a5fa',
        secondaryBg: '#252525',
        secondaryText: '#a0aec0',
        hoverBg: '#2d3748',
        iconColor: '#cbd5e0',
        bgColor: '#1a1a1a',
        textColor: '#e0e0e0',
      };
    case ThemeType.Sepia:
      return {
        borderColor: '#d8c7a0',
        linkColor: '#a2693e',
        secondaryBg: '#f5ecd8',
        secondaryText: '#8a7754',
        hoverBg: '#f1e2c5',
        iconColor: '#6b4f2c',
        bgColor: '#fdf6e3',
        textColor: '#5b4630',
      };
    case ThemeType.Light:
    default:
      return {
        borderColor: '#e2e8f0',
        linkColor: '#20a49b',
        secondaryBg: '#f7fafc',
        secondaryText: '#718096',
        hoverBg: '#edf2f7',
        iconColor: '#4a5568',
        bgColor: '#ffffff',
        textColor: '#2b3a4a',
      };
  }
};

/**
 * Get the content padding for the widget.
 * @param {boolean} showArabic Whether to show the Arabic text.
 * @param {boolean} hasTranslations Whether the verse has translations.
 * @returns {string} The content padding CSS value.
 */
const getContentPadding = (showArabic: boolean, hasTranslations: boolean): string => {
  if (!showArabic) {
    return '0px 24px 0 24px';
  }
  return hasTranslations ? '20px 24px 0 24px' : '20px 24px 20px 24px';
};

/**
 * Get the margin-top value for a verse item based on its position.
 * @param {number} index The index of the verse in the list.
 * @param {boolean} showArabic Whether the Arabic text is shown.
 * @returns {number} The margin-top value in pixels.
 */
const getVerseMarginTop = (index: number, showArabic: boolean): number => {
  if (index === 0) {
    return 0;
  }
  if (showArabic) {
    return 20;
  }
  return 0;
};

/**
 * Group translations by translator (resourceName or authorName).
 * Used in merged mode to display all verses' translations grouped by translator.
 *
 * @param {Verse[]} verses - Array of verses.
 * @returns {Array<{ translatorName: string; texts: string[] }>} Grouped translations.
 */
const groupTranslationsByTranslator = (
  verses: Verse[],
): { translatorName: string; languageId: number; texts: string[] }[] => {
  const translatorMap = new Map<string, { languageId: number; texts: string[] }>();

  verses.forEach((verse) => {
    verse.translations?.forEach((translation) => {
      const translatorName = translation.resourceName || translation.authorName || 'Unknown';
      const existing = translatorMap.get(translatorName);

      // Prefix with verse number for merged display
      const textWithNumber = `${verse.verseNumber}. ${translation.text}`;

      if (existing) {
        existing.texts.push(textWithNumber);
      } else {
        translatorMap.set(translatorName, {
          languageId: translation.languageId,
          texts: [textWithNumber],
        });
      }
    });
  });

  return Array.from(translatorMap.entries()).map(([translatorName, data]) => ({
    translatorName,
    languageId: data.languageId,
    texts: data.texts,
  }));
};

/**
 * Quran Widget Component
 *
 * This component renders the Quran widget with Arabic text and translations.
 * It reuses the existing VerseText component from the QuranReader in standalone mode,
 * which disables interactive features like tooltips and audio highlighting.
 *
 * @returns {JSX.Element} QuranWidget JSX Element
 */
const QuranWidget = ({ verses, options }: Props): JSX.Element => {
  // Convert widget mushaf option to QuranFont for VerseText component
  const quranFont = getQuranFontForMushaf(options.mushaf);

  // Use the existing font loading hook - this handles loading QCF fonts dynamically
  // Works because the widget iframe loads a quran.com page, so local fonts are accessible
  useQcfFont(quranFont, verses);

  if (!verses.length) {
    return <div />;
  }

  const chapterNumber =
    verses[0]?.chapterId ?? (Number(options.ayah.split(':')[0] || 0) || undefined);
  const startVerse = verses[0]?.verseNumber ?? Number(options.ayah.split(':')[1] || 0);
  const verseLabel = options.rangeEnd ? `${startVerse}-${options.rangeEnd}` : `${startVerse}`;
  const rangeCaption = chapterNumber ? `${chapterNumber}:${verseLabel}` : options.ayah;

  // Get widget colors based on the selected theme
  const colors = getColors(options.theme);

  // Get audio URL if audio is enabled
  const audioUrl = options.audioUrl || null;

  const firstVerse = verses[0];
  const hasTranslations = verses.some((verseItem) => (verseItem.translations?.length ?? 0) > 0);

  // Determine content padding based on whether Arabic text and translations are shown
  const contentPadding = getContentPadding(options.showArabic, hasTranslations);

  // Apply custom width and height styles if provided
  const customWidthStyle = options.customWidth
    ? { width: options.customWidth, maxWidth: options.customWidth }
    : { width: '100%' };
  const customHeightStyle = options.customHeight
    ? { maxHeight: options.customHeight, overflow: 'auto' as const }
    : { overflow: 'hidden' as const };

  // Default font scale for widget (medium size)
  const widgetFontScale = 3;

  // Fixed font sizes for the widget (non-responsive)
  const widgetArabicFontSize = '28px';
  const widgetTranslationFontSize = '16px';

  return (
    <div
      className="quran-widget"
      style={
        {
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          backgroundColor: colors.bgColor,
          color: colors.textColor,
          border: `1px solid ${colors.borderColor}`,
          borderRadius: 12,
          margin: '0 auto',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          boxSizing: 'border-box',
          overflowX: 'hidden',
          // Apply Tajweed font palette based on theme (--Light, --Dark, --Sepia)
          // This ensures Tajweed colors are readable on all theme backgrounds
          fontPalette: getTajweedFontPalette(options.theme),
          // Inject CSS variables for TranslationText component
          /* eslint-disable @typescript-eslint/naming-convention */
          '--color-text-faded': colors.secondaryText,
          '--color-text-link': colors.linkColor,
          ...customWidthStyle,
          ...customHeightStyle,
        } as unknown as React.CSSProperties
      }
    >
      {/* Override font sizes to be fixed (non-responsive) within the widget */}
      <style>{`
        .quran-widget [data-verse-key] span,
        .quran-widget h1 span,
        .quran-widget [data-merged-verses] span {
          font-size: ${widgetArabicFontSize} !important;
        }
        .quran-widget [data-verse-key],
        .quran-widget h1,
        .quran-widget [data-merged-verses] {
          --line-height: calc(${widgetArabicFontSize} + 20px) !important;
        }
        .quran-widget [class*="translation-font-size-"] {
          font-size: ${widgetTranslationFontSize} !important;
        }
        .quran-widget [class*="translation-font-size-"] p {
          font-size: ${widgetTranslationFontSize} !important;
        }
        .quran-widget [class*="translationName"],
        .quran-widget p[class*="translationName"] {
          font-size: 12px !important;
        }
      `}</style>
      <WidgetHeader verse={firstVerse} options={options} colors={colors} />
      <div
        style={{
          padding: contentPadding,
          marginBottom: 16,
        }}
        data-translations-wrapper={options.showArabic ? 'with-arabic' : 'translations-only'}
        data-range-caption={options.rangeEnd ? rangeCaption : options.ayah}
      >
        {/* Render merged verses when mergeVerses is enabled */}
        {options.mergeVerses && options.rangeEnd ? (
          <div data-merged-verses>
            {/* All Arabic text together - merge all words from all verses into one continuous flow */}
            {options.showArabic && (
              <VerseText
                words={verses.flatMap((verseItem) => getVerseWords(verseItem))}
                isReadingMode={false}
                shouldShowH1ForSEO
                quranFontOverride={quranFont}
                quranTextFontScaleOverride={widgetFontScale}
                mushafLinesOverride={MushafLines.FifteenLines}
                shouldShowWordByWordTranslation={options.enableWbw}
                shouldShowWordByWordTransliteration={false}
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
        ) : (
          /* Render each verse block in the range sequentially (default mode). */
          verses.map((verseItem, index) => {
            const marginTop = getVerseMarginTop(index, options.showArabic);
            return (
              <div
                key={
                  verseItem.verseKey ?? `${verseItem.chapterId}-${verseItem.verseNumber}-${index}`
                }
                data-verse-block
                data-verse-key={verseItem.verseKey ?? ''}
                data-verse-number={verseItem.verseNumber}
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
                    words={getVerseWords(verseItem)}
                    isReadingMode={false}
                    shouldShowH1ForSEO={index === 0}
                    // Override props for widget/standalone usage
                    quranFontOverride={quranFont}
                    quranTextFontScaleOverride={widgetFontScale}
                    mushafLinesOverride={MushafLines.FifteenLines}
                    shouldShowWordByWordTranslation={options.enableWbw}
                    shouldShowWordByWordTransliteration={false}
                    isStandaloneMode
                  />
                )}
                {/* Render translations for the verse using the shared TranslationText component */}
                <div style={{ marginTop: options.showArabic ? 12 : 0 }}>
                  {verseItem.translations?.map((translation) => (
                    <TranslationText
                      key={translation.id}
                      languageId={translation.languageId}
                      resourceName={
                        options.showTranslatorNames
                          ? translation.resourceName || translation.authorName
                          : undefined
                      }
                      translationFontScale={3} // Default scale
                      text={
                        // In range mode, prefix with verse number
                        options.rangeEnd
                          ? `${verseItem.verseNumber}. ${translation.text}`
                          : translation.text
                      }
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
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
