/* eslint-disable max-lines */
import React from 'react';

import { buildMushafFontFaceCss, buildQcffFontFaceCss } from './mushaf-fonts';

import ArabicVerse from '@/components/AyahWidget/ArabicVerse';
import Translations from '@/components/AyahWidget/Translations';
import WidgetFooterActions from '@/components/AyahWidget/WidgetFooterActions';
import WidgetHeader from '@/components/AyahWidget/WidgetHeader';
import ThemeType from '@/redux/types/ThemeType';
import type { WidgetOptions, WidgetColors } from '@/types/ayah-widget';
import type Verse from 'types/Verse';

type Props = {
  verses: Verse[];
  options: WidgetOptions;
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
 * Quran Widget Component
 * @returns {JSX.Element} QuranWidget JSX Element
 */
const QuranWidget = ({ verses, options }: Props): JSX.Element => {
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

  // Build font-face CSS for mushaf and QCF fonts
  const firstVerse = verses[0];
  const mushafBaseFontFaces = options.showArabic ? buildMushafFontFaceCss() : '';
  const uniquePages = Array.from(
    new Set(
      verses
        .map((verseItem) => verseItem.pageNumber)
        .filter((pageNumber): pageNumber is number => typeof pageNumber === 'number'),
    ),
  );
  const qcfFontFaces = options.showArabic
    ? uniquePages
        .map((pageNumber) => buildQcffFontFaceCss(options.mushaf, pageNumber, options.theme))
        .join('\n')
    : '';

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

  return (
    <div>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: `${mushafBaseFontFaces}\n${qcfFontFaces}` }} />
      <div
        className="quran-widget"
        style={{
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
          ...customWidthStyle,
          ...customHeightStyle,
        }}
      >
        <WidgetHeader verse={firstVerse} options={options} colors={colors} />
        <div
          style={{
            padding: contentPadding,
          }}
          data-translations-wrapper={options.showArabic ? 'with-arabic' : 'translations-only'}
          data-range-caption={options.rangeEnd ? rangeCaption : options.ayah}
        >
          {/* Render each verse block in the range sequentially. */}
          {verses.map((verseItem, index) => {
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
                {options.showArabic && (
                  <ArabicVerse verse={verseItem} options={options} colors={colors} />
                )}
                <Translations verse={verseItem} options={options} colors={colors} />
              </div>
            );
          })}
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
    </div>
  );
};

export default QuranWidget;
