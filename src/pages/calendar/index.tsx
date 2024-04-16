import umalqura from '@umalqura/core';
import useTranslation from 'next-translate/useTranslation';
import { Virtuoso } from 'react-virtuoso';

import styles from './calendar.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import JoinQuranicCalendarButton from '@/components/QuranicCalendar/JoinQuranicCalendarButton';
import QuranicCalendarHero from '@/components/QuranicCalendar/QuranicCalendarHero';
import QuranicCalendarMonth from '@/components/QuranicCalendar/QuranicCalendarMonth';
import { getCurrentQuranicCalendarWeek } from '@/utils/hijri-date';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getQuranicCalendarNavigationUrl } from '@/utils/navigation';
import monthsMap from 'quranic-calendar.json';

const MONTHS_WEEKS = Object.values(monthsMap);
const PATH = getQuranicCalendarNavigationUrl();

const QuranicCalendarPage = () => {
  const { t, lang } = useTranslation('quranic-calendar');
  const currentHijriDate = umalqura();

  /**
   * Get the index of the current month in the MONTHS_WEEKS array
   * by comparing the current month and year with the month and year of each month in the array.
   *
   * @returns {number} The index of the current month in the MONTHS_WEEKS array
   */
  const getInitialTopMostItemIndex = () => {
    for (let index = 0; index < MONTHS_WEEKS.length; index += 1) {
      const monthWeeks = MONTHS_WEEKS[index];
      const calendarMonth = umalqura(
        Number(monthWeeks[0].hijriYear),
        Number(monthWeeks[0].hijriMonth),
        1,
      );
      const isCurrentMonthAndYear =
        calendarMonth.hm === currentHijriDate.hm && currentHijriDate.hy === calendarMonth.hy;
      if (isCurrentMonthAndYear) {
        return index;
      }
    }
    return 0;
  };
  const currentQuranicCalendarWeek = getCurrentQuranicCalendarWeek(currentHijriDate);

  return (
    <>
      <NextSeoWrapper
        title={t('quranic-calendar')}
        url={getCanonicalUrl(lang, PATH)}
        languageAlternates={getLanguageAlternates(PATH)}
      />
      <QuranicCalendarHero />
      <PageContainer>
        <JoinQuranicCalendarButton
          currentQuranicCalendarWeek={currentQuranicCalendarWeek}
          currentHijriDate={currentHijriDate}
        />
        <div className={styles.container}>
          <Virtuoso
            data={MONTHS_WEEKS}
            initialItemCount={1}
            initialTopMostItemIndex={getInitialTopMostItemIndex()}
            totalCount={MONTHS_WEEKS.length}
            itemContent={(index, monthWeeks) => (
              <QuranicCalendarMonth
                currentQuranicCalendarWeek={currentQuranicCalendarWeek}
                key={index}
                monthWeeks={monthWeeks}
              />
            )}
          />
        </div>
      </PageContainer>
    </>
  );
};

export default QuranicCalendarPage;
