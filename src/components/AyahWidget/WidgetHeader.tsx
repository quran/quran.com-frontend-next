/* eslint-disable i18next/no-literal-string */
import React from 'react';

import CopyIcon from '@/icons/copy.svg';
import PlayIcon from '@/icons/play-outline.svg';
import ShareIcon from '@/icons/share.svg';
import type { WidgetOptions, WidgetColors } from '@/types/ayah-widget';
import { isRTLLocale } from '@/utils/locale';
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

const WidgetHeader = ({ verse, options, colors }: Props): JSX.Element => {
  const audioUrl = options.audioUrl || null;

  // Display the selected verse or verse range in the header.
  const verseLabel = options.rangeEnd
    ? `${verse.verseNumber}-${options.rangeEnd}` // range
    : `${verse.verseNumber}`; // single verse
  const chapterLabel = verse.chapterId;
  const verseCaption = options.rangeEnd ? `${chapterLabel}:${verseLabel}` : options.ayah;
  const siteLinkLabel = `Quran.com/${verseCaption}`;

  // Labels with defaults
  const surahLabel = options.labels?.surah || 'Surah';
  const verseWordLabel = options.labels?.verse || 'Verse';
  const localePrefix = options.locale === 'en' ? '' : `/${options.locale}`;
  const isRtl = isRTLLocale(options.locale);

  // Construct the URL to the verse on Quran.com
  const verseUrl = `https://quran.com${localePrefix}/${verseCaption}`;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 16px',
        backgroundColor: colors.secondaryBg,
        borderBottom: `1px solid ${colors.borderColor}`,
      }}
    >
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
          {options.surahName
            ? `${surahLabel} ${options.surahName}, ${verseWordLabel} ${verseLabel}`
            : `${verseWordLabel} ${verseCaption}`}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <a
            href={verseUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 13,
              color: colors.secondaryText,
              textDecoration: 'none',
            }}
          >
            {siteLinkLabel}
          </a>
        </div>
      </div>
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
    </div>
  );
};

export default WidgetHeader;
