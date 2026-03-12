import React, { useCallback } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './MyProgress.module.scss';
import { WeekRow } from './weekProgressTypes';

import { toLocalizedNumber, toLocalizedVerseKeyAuto } from '@/utils/locale';

type WeekProgressRowProps = {
  week: WeekRow;
  activeWeek: number;
  currentWeek: number;
  lang: string;
  isCompleted: boolean;
  shouldShowPassedStyle: boolean;
  onWeekClick: (weekNumber: number) => void;
};

const WeekProgressRow: React.FC<WeekProgressRowProps> = ({
  week,
  activeWeek,
  currentWeek,
  lang,
  isCompleted,
  shouldShowPassedStyle,
  onWeekClick,
}) => {
  const { t } = useTranslation('common');

  const onWeekClickHandler = useCallback(
    () => onWeekClick(week.weekNumber),
    [onWeekClick, week.weekNumber],
  );

  const startReference = `${week.startSurahName} ${t('quranic-calendar:verse')} ${toLocalizedNumber(
    week.startVerse,
    lang,
  )} (${toLocalizedVerseKeyAuto(`${week.startChapterNumber}:${week.startVerse}`, lang)})`;

  const endReference = `${week.endSurahName} ${t('quranic-calendar:verse')} ${toLocalizedNumber(
    week.endVerse,
    lang,
  )} (${toLocalizedVerseKeyAuto(`${week.endChapterNumber}:${week.endVerse}`, lang)})`;

  const isActive = week.weekNumber === activeWeek;

  return (
    <div
      className={styles.weekRow}
      data-active={isActive}
      data-week-range-passed={shouldShowPassedStyle}
    >
      <div>
        <span className={styles.weekNumberLabel}>
          {t('quranic-calendar:week')} {toLocalizedNumber(week.weekNumber, lang)}:
        </span>{' '}
        <span
          className={styles.weekRangeButton}
          role="button"
          tabIndex={0}
          onClick={onWeekClickHandler}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.stopPropagation();
              event.preventDefault();
              onWeekClickHandler();
            }
          }}
        >
          {/* Desktop version */}
          <span className={styles.weekRangeFull}>
            {startReference} {t('to')} {endReference}
          </span>

          {/* Mobile version */}
          <span className={styles.weekRangeCompact}>
            {toLocalizedVerseKeyAuto(`${week.startChapterNumber}:${week.startVerse}`, lang)} -{' '}
            {toLocalizedVerseKeyAuto(`${week.endChapterNumber}:${week.endVerse}`, lang)}
          </span>
        </span>
      </div>

      {!isCompleted && week.weekNumber === currentWeek && (
        <div className={classNames(styles.status, styles.current)}>
          {t('quranic-calendar:current')}
        </div>
      )}
      {isCompleted && (
        <div className={classNames(styles.status, styles.completed)}>
          {t('quranic-calendar:complete')}
        </div>
      )}
    </div>
  );
};

export default WeekProgressRow;
