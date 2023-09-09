import { useCallback } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import Spinner from '../Spinner/Spinner';

import styles from './Calendar.module.scss';

import { getMonthDateObject, numberToPaddedString } from '@/utils/datetime';
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
  const monthDateString = `${year}-${numberToPaddedString(month)}`;

  const monthDateObj = getMonthDateObject(year, month);
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
    <div className={styles.outerContainer}>
      {isLoading && <Spinner />}
      <div className={styles.calendarContainer}>
        {/* eslint-disable-next-line @typescript-eslint/naming-convention */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const dateString = `${monthDateString}-${numberToPaddedString(day)}`;

          const isDisabled = getIsDisabled(day, dateString);

          const handleDayClick = () => onDayClick?.(day, dateString);

          return (
            <div key={dateString} className={classNames(index > 6 && styles.bordered)}>
              <button
                type="button"
                disabled={isDisabled}
                className={classNames({ [styles.disabled]: isDisabled })}
                onClick={handleDayClick}
              >
                <time dateTime={dateString}>{toLocalizedNumber(day, lang)}</time>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
