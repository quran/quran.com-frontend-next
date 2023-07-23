import { useCallback } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import Spinner from '../Spinner/Spinner';

import styles from './Calendar.module.scss';

import { toLocalizedNumber } from '@/utils/locale';

interface CalendarProps {
  month: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  year: number;
  getIsDayDisabled?: (day: number, dateString: string) => boolean;
  onDayClick?: (day: number, dateString: string) => void;
  isLoading?: boolean;
}

const Calendar = ({ month, year, getIsDayDisabled, onDayClick, isLoading }: CalendarProps) => {
  const { lang } = useTranslation();

  // YYYY-MM
  const monthDateString = `${year}-${month.toString().padStart(2, '0')}`;

  const monthDateObj = new Date(year, month, 0);
  const daysInMonth = monthDateObj.getDate();

  const getIsDisabled = useCallback(
    (day: number, dateString: string) => {
      // if the calendar is loading, disable all days
      if (isLoading) return true;

      if (getIsDayDisabled) return getIsDayDisabled(day, dateString);

      // if there is no custom logic to disable days, don't disable any day
      return false;
    },
    [getIsDayDisabled, isLoading],
  );

  return (
    <>
      {isLoading && <Spinner className={styles.calendarSpinner} />}
      <div className={styles.calendarContainer}>
        {/* eslint-disable-next-line @typescript-eslint/naming-convention */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const dateString = `${monthDateString}-${day.toString().padStart(2, '0')}`;

          const isDisabled = getIsDisabled(day, dateString);

          return (
            <div key={dateString} className={classNames(index > 6 && styles.bordered)}>
              <button
                type="button"
                disabled={isDisabled}
                className={classNames({ [styles.disabled]: isDisabled })}
                onClick={() => onDayClick?.(day, dateString)}
              >
                <time dateTime={dateString}>{toLocalizedNumber(day, lang)}</time>
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Calendar;
