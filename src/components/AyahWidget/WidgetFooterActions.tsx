import React from 'react';

import BookIcon from '@/icons/book-open.svg';
import ChatIcon from '@/icons/chat.svg';
import LightbulbIcon from '@/icons/lightbulb.svg';
import type { WidgetOptions, WidgetColors } from '@/types/ayah-widget';
import type Verse from 'types/Verse';

type Props = {
  verse: Verse;
  options: WidgetOptions;
  colors: WidgetColors;
};

type FooterAction = {
  label: string;
  href: string;
  icon: JSX.Element;
};

const BUTTON_BASE_STYLE = (colors: WidgetColors): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 14px',
  borderRadius: 10,
  border: `1px solid ${colors.borderColor}`,
  color: colors.textColor,
  backgroundColor: colors.bgColor,
  textDecoration: 'none',
  fontSize: 14,
  fontWeight: 600,
});

const ICON_STYLE: React.CSSProperties = { width: 16, height: 16, display: 'inline-flex' };

const WidgetFooterActions = ({ verse, options, colors }: Props): JSX.Element => {
  const chapterNumber = verse.chapterId ?? options.ayah.split(':')[0];
  const startVerse = verse.verseNumber ?? Number(options.ayah.split(':')[1] || 0);
  const verseSegment = options.rangeEnd ? `${startVerse}-${options.rangeEnd}` : `${startVerse}`;
  const baseUrl = `https://quran.com/fr/${chapterNumber}:${verseSegment}`;

  const actions = [
    options.showTafsirs && {
      label: 'Tafsirs',
      href: `${baseUrl}/tafsirs/169`,
      icon: <BookIcon style={ICON_STYLE} />,
    },
    options.showReflections && {
      label: 'Reflections & Lessons',
      href: `${baseUrl}/reflections`,
      icon: <ChatIcon style={ICON_STYLE} />,
    },
    options.showAnswers && {
      label: 'Answers',
      href: `${baseUrl}/answers`,
      icon: <LightbulbIcon style={ICON_STYLE} />,
    },
  ].filter((action): action is FooterAction => Boolean(action));

  if (!actions.length) {
    return <></>;
  }

  return (
    <div
      style={{
        padding: '12px 16px',
        borderTop: `1px solid ${colors.borderColor}`,
        backgroundColor: colors.secondaryBg,
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {actions.map((action) => (
          <a
            key={action.label}
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
            style={BUTTON_BASE_STYLE(colors)}
          >
            {action.icon}
            <span>{action.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default WidgetFooterActions;
