import React, { useEffect, useMemo, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './QuranInYearSection.module.scss';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '@/components/dls/Button/Button';
import Link, { LinkVariant } from '@/components/dls/Link/Link';
import VerseAndTranslation from '@/components/Verse/VerseAndTranslation';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import Spinner from '@/dls/Spinner/Spinner';
import ArrowIcon from '@/public/icons/arrow.svg';
import CalendarIcon from '@/public/icons/new-calendar.svg';
import { QuranFont } from '@/types/QuranReader';
import { logButtonClick } from '@/utils/eventLogger';
import { getQuranicCalendarNavigationUrl } from '@/utils/navigation';
import getCurrentDayAyah from '@/utils/quranInYearCalendar';

// Set a fixed font scale for both Arabic and translation text
const FONT_SCALE = 3;

const QuranInYearSection = () => {
  const { t } = useTranslation('home');
  const [shouldLoadVerse, setShouldLoadVerse] = useState(false);

  const onCalendarClicked = () => {
    logButtonClick('quran_in_year_header_calendar');
  };

  // Get the Ayah for today's date
  const todayAyah = useMemo(() => getCurrentDayAyah(), []);

  // eslint-disable-next-line react-func/max-lines-per-function
  useEffect(() => {
    if (!todayAyah || shouldLoadVerse) {
      return undefined;
    }

    const triggerLoad = () => {
      setShouldLoadVerse(true);
    };

    if (typeof window === 'undefined') {
      return undefined;
    }

    const idleWindow = window as Window & {
      requestIdleCallback?: (
        callback: () => void,
        options?: {
          timeout?: number;
        },
      ) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (typeof idleWindow.requestIdleCallback === 'function') {
      const idleId = idleWindow.requestIdleCallback(
        () => {
          triggerLoad();
        },
        { timeout: 2000 },
      );
      return () => {
        idleWindow.cancelIdleCallback?.(idleId);
      };
    }

    const timeoutId = window.setTimeout(triggerLoad, 1000);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [shouldLoadVerse, todayAyah]);

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
      <div className={styles.container}>
        <div className={styles.verseContainer}>
          {shouldLoadVerse ? (
            <VerseAndTranslation
              chapter={todayAyah.chapter}
              from={todayAyah.verse}
              to={todayAyah.verse}
              quranFont={QuranFont.QPCHafs}
              translationsLimit={1}
              arabicVerseClassName={styles.customArabicVerse}
              translationClassName={styles.customTranslation}
              fixedFontScale={FONT_SCALE}
            />
          ) : (
            <div className={styles.loadingPlaceholder}>
              <Spinner />
            </div>
          )}
        </div>
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
