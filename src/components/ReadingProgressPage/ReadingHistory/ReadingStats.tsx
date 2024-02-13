import { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './ReadingHistory.module.scss';

import DataContext from '@/contexts/DataContext';
import Link, { LinkVariant } from '@/dls/Link/Link';
import BookIcon from '@/icons/book.svg';
import ClockIcon from '@/icons/clock.svg';
import RightArrow from '@/icons/east.svg';
import { ActivityDay, QuranActivityDay } from '@/types/auth/ActivityDay';
import { RangeItemDirection } from '@/types/Range';
import { getChapterData } from '@/utils/chapter';
import { secondsToReadableFormat } from '@/utils/datetime';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { getChapterWithStartingVerseUrl } from '@/utils/navigation';
import { parseVerseRange } from '@/utils/verseKeys';

interface ReadingStatsProps {
  activityDay: ActivityDay<QuranActivityDay>;
}

const ReadingStats: React.FC<ReadingStatsProps> = ({ activityDay }) => {
  const { t, lang } = useTranslation('reading-progress');
  const chaptersData = useContext(DataContext);

  const pages = Number(activityDay.pagesRead.toFixed(1));
  const localizedPages = toLocalizedNumber(pages, lang);
  const verses = activityDay.versesRead;
  const localizedVerses = toLocalizedNumber(verses, lang);

  const handleVerseClick = (position: RangeItemDirection, verseKey: string) => {
    return () => {
      logButtonClick(`reading_history_range_${position}`, {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        verse_key: verseKey,
      });
    };
  };

  const secondsRead = activityDay.secondsRead + (activityDay.manuallyAddedSeconds || 0);

  return (
    <div className={styles.readingInfo}>
      <div className={styles.readingStats}>
        <p>
          <BookIcon />
          {t('reading-goal:x-pages', { count: pages, pages: localizedPages })}
        </p>
        <p>
          <BookIcon />
          {`${localizedVerses} ${t('common:ayahs').toLocaleLowerCase(lang)}`}
        </p>
        <p>
          <ClockIcon />
          {secondsToReadableFormat(secondsRead, t, lang)}
        </p>
      </div>

      <h3>{t('you-read')}</h3>
      {activityDay.ranges.length > 0 && (
        <ul>
          {activityDay.ranges.map((range, rangeIdx) => {
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
                  onClick={handleVerseClick(RangeItemDirection.From, rangeFrom)}
                >
                  {from}
                </Link>
                <RightArrow />
                <Link
                  href={getChapterWithStartingVerseUrl(rangeTo)}
                  variant={LinkVariant.Primary}
                  onClick={handleVerseClick(RangeItemDirection.To, rangeTo)}
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
};

export default ReadingStats;
