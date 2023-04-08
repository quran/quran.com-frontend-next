import { useContext, useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './ReadingHistory.module.scss';

import DataContext from '@/contexts/DataContext';
import Link, { LinkVariant } from '@/dls/Link/Link';
import BookIcon from '@/icons/book.svg';
import ClockIcon from '@/icons/clock.svg';
import RightArrow from '@/icons/east.svg';
import { ReadingDay } from '@/types/auth/ReadingDay';
import { getChapterData } from '@/utils/chapter';
import { secondsToReadableFormat } from '@/utils/datetime';
import { toLocalizedNumber } from '@/utils/locale';
import { getChapterWithStartingVerseUrl } from '@/utils/navigation';
import { parseVerseRange } from '@/utils/verseKeys';

interface DaysCalendarProps {
  month: { id: number; name: string; daysCount: number };
  year: number;
  days: ReadingDay[];
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
}

const DaysCalendar: React.FC<DaysCalendarProps> = ({
  month,
  year,
  days,
  selectedDate,
  setSelectedDate,
}) => {
  const { t, lang } = useTranslation('reading-progress');
  const chaptersData = useContext(DataContext);

  // YYYY-MM
  const monthDate = `${year}-${month.id.toString().padStart(2, '0')}`;

  const dateToDayMap = useMemo(() => {
    const map: Record<string, ReadingDay> = {};

    days.forEach((day) => {
      if (!day.pagesRead && !day.secondsRead && !day.ranges.length) {
        return;
      }

      map[day.date as unknown as string] = day;
    });

    return map;
  }, [days]);

  if (selectedDate) {
    const readingDay = dateToDayMap[selectedDate];
    const pages = Number(readingDay.pagesRead.toFixed(1));
    const localizedPages = toLocalizedNumber(pages, lang);
    const verses = readingDay.versesRead;
    const localizedVerses = toLocalizedNumber(verses, lang);

    return (
      <div className={styles.readingInfo}>
        <div className={styles.readingStats}>
          <p>
            <BookIcon />
            {t('reading-goal:x-pages', { count: pages, pages: localizedPages })}
          </p>
          <p>
            <BookIcon />
            {`${localizedVerses} ${t('common:ayah').toLocaleLowerCase(lang)}`}
          </p>
          <p>
            <ClockIcon />
            {secondsToReadableFormat(readingDay.secondsRead, t, lang)}
          </p>
        </div>

        <h3>{t('you-read')}</h3>
        {readingDay.ranges.length > 0 && (
          <ul>
            {readingDay.ranges.map((range, rangeIdx) => {
              const [
                { chapter: fromChapter, verse: fromVerse, verseKey: rangeFrom },
                { chapter: toChapter, verse: toVerse, verseKey: rangeTo },
              ] = parseVerseRange(range);

              const from = `${
                getChapterData(chaptersData, fromChapter).transliteratedName
              } ${toLocalizedNumber(Number(fromVerse), lang)}`;

              const to = `${
                getChapterData(chaptersData, toChapter).transliteratedName
              } ${toLocalizedNumber(Number(toVerse), lang)}`;

              return (
                // eslint-disable-next-line react/no-array-index-key
                <li key={rangeIdx}>
                  <Link
                    href={getChapterWithStartingVerseUrl(rangeFrom)}
                    variant={LinkVariant.Primary}
                  >
                    {from}
                  </Link>
                  <RightArrow />
                  <Link
                    href={getChapterWithStartingVerseUrl(rangeTo)}
                    variant={LinkVariant.Primary}
                  >
                    {to}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className={styles.calendarContainer}>
      {/* eslint-disable-next-line @typescript-eslint/naming-convention */}
      {Array.from({ length: month.daysCount }).map((_, index) => {
        const day = index + 1;
        const date = `${monthDate}-${day.toString().padStart(2, '0')}`;
        const dayData = dateToDayMap[date];

        const isDisabled = !dayData;

        return (
          <div key={date} className={classNames(index > 6 && styles.bordered)}>
            <button
              type="button"
              disabled={isDisabled}
              className={classNames({ [styles.disabled]: isDisabled })}
              onClick={() => setSelectedDate(date)}
            >
              <time dateTime={date}>{toLocalizedNumber(day, lang)}</time>
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default DaysCalendar;
