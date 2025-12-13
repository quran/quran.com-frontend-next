/* eslint-disable i18next/no-literal-string */
import React from 'react';

import Image from 'next/image';

import type { WidgetOptions, WidgetColors } from '@/types/ayah-widget';
import type Verse from 'types/Verse';

type Props = {
  verse: Verse;
  options: WidgetOptions;
  colors: WidgetColors;
};

const ICON_BUTTON_STYLE = (colors: WidgetColors): React.CSSProperties => ({
  width: 36,
  height: 36,
  borderRadius: 6,
  border: 'none',
  backgroundColor: colors.hoverBg,
  color: colors.iconColor,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 0.2s',
});

const DROPDOWN_STYLE = (colors: WidgetColors): React.CSSProperties => ({
  display: 'none',
  position: 'absolute',
  top: 42,
  right: 0,
  backgroundColor: colors.bgColor,
  border: `1px solid ${colors.borderColor}`,
  borderRadius: 8,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  minWidth: 180,
  zIndex: 10,
});

const WidgetHeader = ({ verse, options, colors }: Props): JSX.Element => {
  const audioUrl = options.audioUrl || null;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: colors.secondaryBg,
        borderBottom: `1px solid ${colors.borderColor}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Image
          src="https://quran.com/images/logo/Logo@192x192.png"
          alt="Quran.com logo"
          width={36}
          height={36}
          style={{ borderRadius: '50%', objectFit: 'cover' }}
          priority
        />
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: colors.textColor }}>
            {options.surahName
              ? `Surah ${options.surahName}, Verse ${verse.verseNumber}`
              : `Verse ${options.ayah}`}
          </div>
          <div style={{ fontSize: 12, color: colors.secondaryText }}>{verse.verseKey}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
        {options.enableAudio && audioUrl && (
          <button
            data-audio-button
            type="button"
            style={ICON_BUTTON_STYLE(colors)}
            aria-label="Play audio"
          >
            <span data-play-icon>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5 3v10l8-5z" />
              </svg>
            </span>
            <span data-pause-icon style={{ display: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <rect x="4" y="3" width="3" height="10" />
                <rect x="9" y="3" width="3" height="10" />
              </svg>
            </span>
          </button>
        )}
        <button
          data-menu-toggle
          type="button"
          style={ICON_BUTTON_STYLE(colors)}
          aria-label="More options"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="3" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="8" cy="13" r="1.5" />
          </svg>
        </button>
        <div data-menu style={DROPDOWN_STYLE(colors)}>
          <button
            type="button"
            data-copy-verse
            style={{
              width: '100%',
              padding: '10px 16px',
              border: 'none',
              background: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: colors.textColor,
              fontSize: 14,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6z" />
              <path d="M2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2z" />
            </svg>
            Copy Verse
          </button>
        </div>
      </div>
    </div>
  );
};

export default WidgetHeader;
