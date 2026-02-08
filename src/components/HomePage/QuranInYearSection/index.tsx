import React, { useMemo, type ClipboardEvent } from 'react';

import clipboardCopy from 'clipboard-copy';
import useTranslation from 'next-translate/useTranslation';

import styles from './QuranInYearSection.module.scss';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '@/components/dls/Button/Button';
import Link, { LinkVariant } from '@/components/dls/Link/Link';
import VerseAndTranslation from '@/components/Verse/VerseAndTranslation';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import ArrowIcon from '@/public/icons/arrow.svg';
import CalendarIcon from '@/public/icons/new-calendar.svg';
import { TestId } from '@/tests/test-ids';
import { QuranFont } from '@/types/QuranReader';
import { logButtonClick } from '@/utils/eventLogger';
import { getQuranicCalendarNavigationUrl } from '@/utils/navigation';
import getCurrentDayAyah from '@/utils/quranInYearCalendar';
import ChaptersData from 'types/ChaptersData';

// Set a fixed font scale for both Arabic and translation text
const FONT_SCALE = 3;

interface Props {
  chaptersData?: ChaptersData;
}

const QuranInYearSection: React.FC<Props> = ({ chaptersData }) => {
  const { t } = useTranslation('home');

  const onCalendarClicked = () => {
    logButtonClick('quran_in_year_header_calendar');
  };

  // Get the Ayah for today's date
  const todayAyah = useMemo(() => getCurrentDayAyah(), []);

  /**
   * Handle copy events on the verse container.
   * @param {ClipboardEvent<HTMLDivElement>} event The copy event.
   */
  const onCopy = (event: ClipboardEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const container = event.currentTarget;

    // get the arabic and translation elements
    const arabic = container.querySelector(`.${styles.customArabicVerse} [translate="no"]`);
    const translation = container.querySelector(`.${styles.customTranslation}`);

    if (!arabic && !translation) return;

    // check if the selection intersects with the arabic or translation elements
    const intersects = (node: Element | null) =>
      !!node &&
      Array.from({ length: selection.rangeCount }).some((unused, i) =>
        selection.getRangeAt(i).intersectsNode(node),
      );

    // function to get cleaned innerText of a node
    const toText = (node: Element | null) =>
      (node as HTMLElement | null)?.innerText?.replace(/\s+/g, ' ').trim() || '';

    // get the text content of the arabic and translation elements depending on selection
    const parts = [
      intersects(arabic) && toText(arabic),
      intersects(translation) && toText(translation),
    ].filter(Boolean) as string[];

    if (!parts.length) return;
    event.preventDefault();

    // copy the combined text to clipboard
    clipboardCopy(parts.join('\n'));
  };

  // Don't render anything if we're before April 1st, 2025
  if (!todayAyah) {
    return null;
  }

  return (
    <>
      <div className={styles.header}>
        <h1>{t('quran-in-year')}</h1>
        <div className={styles.cardWithIcon}>
          <div className={styles.calendarContainer}>
            <CalendarIcon />
          </div>
          <Link variant={LinkVariant.Blend} href="/calendar" onClick={onCalendarClicked}>
            <p className={styles.calendarText}>{t('calendar-cta')}</p>
          </Link>
        </div>
      </div>
      <div
        className={styles.container}
        data-testid={TestId.QURAN_IN_A_YEAR_SECTION}
        onCopy={onCopy}
      >
        <VerseAndTranslation
          chaptersData={chaptersData}
          chapter={todayAyah.chapter}
          from={todayAyah.verse}
          to={todayAyah.verse}
          titleText={t('quran-in-year-verse-title')}
          quranFont={QuranFont.QPCHafs}
          translationsLimit={1}
          arabicVerseClassName={styles.customArabicVerse}
          translationClassName={styles.customTranslation}
          fixedFontScale={FONT_SCALE}
        />
        <Button
          type={ButtonType.Primary}
          variant={ButtonVariant.Compact}
          size={ButtonSize.Small}
          className={styles.button}
          href={getQuranicCalendarNavigationUrl()}
          onClick={() => {
            logButtonClick('quran_in_year_calendar');
          }}
        >
          {t('quran-in-year-cta')}
          <IconContainer
            size={IconSize.Xsmall}
            icon={<ArrowIcon />}
            shouldForceSetColors={false}
            className={styles.arrowIcon}
          />
        </Button>
      </div>
    </>
  );
};

export default QuranInYearSection;
