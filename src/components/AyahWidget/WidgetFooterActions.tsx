import React from 'react';

import BookIcon from '@/icons/book-open.svg';
import ChatIcon from '@/icons/chat.svg';
import GraduationCapIcon from '@/icons/graduation-cap.svg';
import LightbulbOnIcon from '@/icons/lightbulb-on.svg';
import LightbulbIcon from '@/icons/lightbulb.svg';
import type { WidgetOptions, WidgetColors } from '@/types/Embed';
import { isRTLLocale } from '@/utils/locale';
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

  // Construct the base URL for the verse actions based on locale and verse reference.
  const locale = options.locale || 'en';
  const localePrefix = locale === 'en' ? '' : `/${locale}`;
  const baseUrl = `https://quran.com${localePrefix}/${chapterNumber}:${startVerse}`;
  const isRtl = isRTLLocale(locale);

  const actions = [
    options.showTafsirs && {
      label: options.labels?.tafsirs || 'Tafsirs',
      href: `${baseUrl}/tafsirs/169`,
      icon: <BookIcon style={ICON_STYLE} />,
    },
    options.showLessons && {
      label: options.labels?.lessons || 'Lessons',
      href: `${baseUrl}/lessons`,
      icon: <GraduationCapIcon style={ICON_STYLE} />,
    },
    options.showReflections && {
      label: options.labels?.reflections || 'Reflections',
      href: `${baseUrl}/reflections`,
      icon: <ChatIcon style={ICON_STYLE} />,
    },
    options.showAnswers &&
      options.hasAnswers && {
        label: options.labels?.answers || 'Answers',
        href: `${baseUrl}/answers`,
        icon: options.isClarificationQuestion ? (
          <LightbulbOnIcon style={ICON_STYLE} />
        ) : (
          <LightbulbIcon style={ICON_STYLE} />
        ),
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
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          direction: isRtl ? 'rtl' : 'ltr',
          justifyContent: 'flex-start',
        }}
      >
        {actions.map((action) => (
          <a
            key={action.label}
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
            style={BUTTON_BASE_STYLE(colors)}
            dir={isRtl ? 'rtl' : 'ltr'}
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
