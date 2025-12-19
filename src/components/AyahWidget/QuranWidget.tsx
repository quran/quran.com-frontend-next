import React from 'react';

import { buildMushafFontFaceCss, buildQcffFontFaceCss } from './mushaf-fonts';

import ArabicVerse from '@/components/AyahWidget/ArabicVerse';
import QdcLink from '@/components/AyahWidget/QdcLink';
import Translations from '@/components/AyahWidget/Translations';
import WidgetHeader from '@/components/AyahWidget/WidgetHeader';
import ThemeType from '@/redux/types/ThemeType';
import type { WidgetOptions, WidgetColors } from '@/types/ayah-widget';
import type Verse from 'types/Verse';

type Props = {
  verse: Verse;
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
 * Quran Widget Component
 * @returns {JSX.Element} QuranWidget JSX Element
 */
const QuranWidget = ({ verse, options }: Props): JSX.Element => {
  const colors = getColors(options.theme);
  const audioUrl = options.audioUrl || null;
  const mushafBaseFontFaces = buildMushafFontFaceCss();
  const qcfFontFaces = buildQcffFontFaceCss(options.mushaf, verse.pageNumber, options.theme);

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
          ...customWidthStyle,
          ...customHeightStyle,
        }}
      >
        <WidgetHeader verse={verse} options={options} colors={colors} />
        <div style={{ padding: '20px 24px 0 24px' }}>
          <ArabicVerse verse={verse} options={options} colors={colors} />
          <Translations verse={verse} options={options} colors={colors} />
        </div>
        <QdcLink verse={verse} options={options} colors={colors} />
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
