import React, { useMemo } from 'react';

import type { WidgetColors, WidgetOptions } from '@/types/ayah-widget';
import type Verse from 'types/Verse';

type Props = {
  verse: Verse;
  options: WidgetOptions;
  colors: WidgetColors;
};

/**
 * Translations
 *
 * Renders the verse translations, optionally showing the translator name.
 *
 * Notes:
 * - Translation text is assumed to be trusted HTML (coming from backend), so we render it with `dangerouslySetInnerHTML`.
 * - In range mode, we prefix each translation with the verse number for clarity.
 *
 * @param {Props} props - The component props.
 * @returns {JSX.Element | null} The rendered Translations component or null if no translations exist.
 */
const Translations = ({ verse, options, colors }: Props): JSX.Element | null => {
  const translations = verse.translations ?? [];

  const isRangeMode = Boolean(options.rangeEnd);

  /**
   * Container spacing:
   * - If Arabic is shown above translations, add a little top margin.
   * - If Arabic is hidden, translations should align closer to the top.
   */
  const containerStyle = useMemo<React.CSSProperties>(() => {
    return { marginTop: options.showArabic ? 12 : 0 };
  }, [options.showArabic]);

  /**
   * Translation text style:
   * - Add bottom spacing when translator names are enabled so the name doesn't feel cramped.
   */
  const translationTextStyle = useMemo<React.CSSProperties>(() => {
    return {
      fontSize: 16,
      lineHeight: 1.75,
      color: colors.textColor,
      marginBottom: options.showTranslatorNames ? 8 : 0,
    };
  }, [colors.textColor, options.showTranslatorNames]);

  /**
   * Translator name style.
   */
  const translatorNameStyle = useMemo<React.CSSProperties>(() => {
    return {
      fontSize: 13,
      color: colors.secondaryText,
      marginTop: 8,
    };
  }, [colors.secondaryText]);

  /**
   * For normal mode (single ayah), we show a border only when Arabic is shown.
   * For range mode, we avoid borders because translations appear in a list-like flow.
   */
  const shouldShowTopBorder = options.showArabic && !isRangeMode;

  if (!translations.length) return null;

  return (
    <div style={containerStyle} data-translations>
      {translations.map((translation) => {
        const translatorName = translation.resourceName ?? translation.authorName;
        const key = translation.id ?? translation.resourceId;

        return (
          <div
            key={key}
            style={{
              padding: '16px 0',
              borderTop: shouldShowTopBorder ? `1px solid ${colors.borderColor}` : 'none',
            }}
          >
            <div
              data-translation-text
              data-translator-name={translatorName}
              style={translationTextStyle}
            >
              {/* In range mode, prefix each translation with the verse number */}
              {isRangeMode ? `${verse.verseNumber}. ` : null}

              <span
                // Translation HTML is considered trusted from the backend.
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: translation.text }}
              />
            </div>

            {options.showTranslatorNames && translatorName && (
              <div style={translatorNameStyle}>— {translatorName}</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Translations;
