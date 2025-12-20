import React from 'react';

import type { WidgetOptions, WidgetColors } from '@/types/ayah-widget';
import type Verse from 'types/Verse';

type Props = {
  verse: Verse;
  options: WidgetOptions;
  colors: WidgetColors;
};

const getContainerStyle = (showArabic: boolean): React.CSSProperties => ({
  marginTop: showArabic ? 12 : 0,
});

const translationTextStyle = (
  colors: WidgetColors,
  showTranslatorNames: boolean,
): React.CSSProperties => ({
  fontSize: 16,
  lineHeight: 1.75,
  color: colors.textColor,
  marginBottom: showTranslatorNames ? 8 : 0,
});

const translatorNameStyle = (colors: WidgetColors): React.CSSProperties => ({
  fontSize: 13,
  color: colors.secondaryText,
  marginTop: 8,
});

const Translations = ({ verse, options, colors }: Props): JSX.Element | null => {
  const translations = verse.translations ?? [];
  if (!translations.length) {
    return null;
  }

  const isRangeMode = Boolean(options.rangeEnd);

  return (
    <div style={getContainerStyle(options.showArabic)} data-translations>
      {translations.map((translation) => (
        <div
          key={translation.id ?? translation.resourceId}
          style={{
            padding: '16px 0',
            borderTop:
              options.showArabic && !isRangeMode ? `1px solid ${colors.borderColor}` : 'none',
          }}
        >
          <div
            data-translation-text
            data-translator-name={translation.resourceName ?? translation.authorName}
            style={translationTextStyle(colors, options.showTranslatorNames)}
          >
            {isRangeMode ? `${verse.verseNumber}. ` : null}
            <span
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: translation.text }}
            />
          </div>
          {options.showTranslatorNames && (translation.resourceName || translation.authorName) && (
            <div style={translatorNameStyle(colors)}>
              — {translation.resourceName ?? translation.authorName}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Translations;
