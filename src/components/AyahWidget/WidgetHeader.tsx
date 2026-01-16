/* eslint-disable max-lines */
/* eslint-disable i18next/no-literal-string */
import React from 'react';

import CopyIcon from '@/icons/copy.svg';
import PlayIcon from '@/icons/play-outline.svg';
import ShareIcon from '@/icons/share.svg';
import type { WidgetOptions, WidgetColors } from '@/types/Embed';
import { isRTLLocale, toLocalizedNumber } from '@/utils/locale';
import type Verse from 'types/Verse';

type Props = {
  verse: Verse;
  options: WidgetOptions;
  colors: WidgetColors;
};

const ICON_BUTTON_STYLE = (colors: WidgetColors): React.CSSProperties => ({
  width: 34,
  height: 34,
  borderRadius: 10,
  border: `1px solid ${colors.borderColor}`,
  backgroundColor: colors.bgColor,
  color: colors.iconColor,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 0.2s, border-color 0.2s',
});

/**
 * Format verse label with localized numbers.
 *
 * @param {number} verseNumber - Starting verse number.
 * @param {number | undefined} rangeEnd - End of verse range (if applicable).
 * @param {string} locale - Locale for number formatting.
 * @returns {string} Formatted verse label.
 */
const formatVerseLabel = (
  verseNumber: number,
  rangeEnd: number | undefined,
  locale: string,
): string => {
  const localizedStart = toLocalizedNumber(verseNumber, locale);
  if (rangeEnd) {
    const localizedEnd = toLocalizedNumber(rangeEnd, locale);
    return `${localizedStart}-${localizedEnd}`;
  }
  return localizedStart;
};

const formatVerseCaption = (
  chapterId: number,
  verseNumber: number,
  rangeEnd: number | undefined,
  locale: string,
): string => {
  const localizedChapter = toLocalizedNumber(chapterId, locale);
  const localizedStart = toLocalizedNumber(verseNumber, locale);
  if (rangeEnd) {
    const localizedEnd = toLocalizedNumber(rangeEnd, locale);
    return `${localizedChapter}:${localizedStart}-${localizedEnd}`;
  }
  return `${localizedChapter}:${localizedStart}`;
};

const WidgetHeader = ({ verse, options, colors }: Props): JSX.Element => {
  const audioUrl = options.audioUrl || null;
  const locale = options.locale || 'en';
  const isRtl = isRTLLocale(locale);

  // Display the selected verse or verse range in the header with localized numbers.
  const verseLabel = formatVerseLabel(verse.verseNumber, options.rangeEnd, locale);
  const verseCaption = `${verse.chapterId}:${verse.verseNumber}`;

  // For URL, we use non-localized numbers
  const verseCaptionUrl = options.rangeEnd
    ? `${verse.chapterId}:${verse.verseNumber}-${options.rangeEnd}`
    : verseCaption;
  const siteLinkLabel = `quran.com/${verseCaption}`;

  // Labels with defaults
  const quranLabel = options.labels?.quran || 'Quran';
  const surahLabel = options.labels?.surah || 'Surah';
  const verseWordLabel = options.labels?.verse || 'Verse';
  const localizedVerseCaption = formatVerseCaption(
    Number(verse.chapterId),
    Number(verse.verseNumber),
    Number(options.rangeEnd),
    locale,
  );
  const headerTitle = options.surahName
    ? `${quranLabel} ${localizedVerseCaption} (${surahLabel} ${options.surahName})`
    : `${verseWordLabel} ${verseLabel}`;
  const localePrefix = locale === 'en' ? '' : `/${locale}`;

  // Construct the URL to the verse on Quran.com
  const verseUrl = `https://quran.com${localePrefix}/${verseCaptionUrl}`;

  // Action buttons component (reused in both positions)
  const ActionButtons = (
    <div style={{ display: 'flex', gap: 8 }}>
      {options.enableAudio && audioUrl && (
        <>
          <button
            data-audio-button
            type="button"
            style={ICON_BUTTON_STYLE(colors)}
            aria-label="Play audio"
          >
            <span data-play-icon>
              <PlayIcon style={{ width: 16, height: 16 }} />
            </span>
            <span data-pause-icon style={{ display: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <rect x="4" y="3" width="3" height="10" />
                <rect x="9" y="3" width="3" height="10" />
              </svg>
            </span>
          </button>
          <div style={{ width: 1, height: 32, backgroundColor: colors.borderColor }} />
        </>
      )}
      <button
        type="button"
        data-copy-verse
        style={ICON_BUTTON_STYLE(colors)}
        aria-label="Copy verse text"
      >
        <CopyIcon style={{ width: 16, height: 16 }} />
      </button>
      <button
        type="button"
        data-share-verse
        style={ICON_BUTTON_STYLE(colors)}
        aria-label="Copy verse link"
      >
        <ShareIcon style={{ width: 16, height: 16 }} />
      </button>
    </div>
  );

  // Text info component
  const TextInfo = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div
        style={{
          fontWeight: 700,
          fontSize: 15,
          color: colors.textColor,
          direction: isRtl ? 'rtl' : 'ltr',
          textAlign: isRtl ? 'right' : 'left',
        }}
      >
        {headerTitle}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          justifyContent: isRtl ? 'flex-end' : 'flex-start',
        }}
      >
        <a
          href={verseUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 13,
            color: colors.secondaryText,
            textUnderlineOffset: 2,
            fontWeight: 500,
          }}
        >
          {siteLinkLabel}
        </a>
      </div>
    </div>
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isRtl ? 'row-reverse' : 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 16px',
        backgroundColor: colors.secondaryBg,
        borderBottom: `1px solid ${colors.borderColor}`,
      }}
    >
      {TextInfo}
      {ActionButtons}
    </div>
  );
};

export default WidgetHeader;
