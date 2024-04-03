/* eslint-disable react/no-array-index-key */
import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { Virtuoso } from 'react-virtuoso';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import JoinQuranicCalendarButton from '@/components/QuranicCalendar/JoinQuranicCalendarButton';
import QuranicCalendarHero from '@/components/QuranicCalendar/QuranicCalendarHero';
import QuranicCalendarMonth from '@/components/QuranicCalendar/QuranicCalendarMonth';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getQuranicCalendarNavigationUrl } from '@/utils/navigation';
import monthsMap from 'quranic-calendar.json';

const MONTHS_WEEKS = Object.values(monthsMap);
const PATH = getQuranicCalendarNavigationUrl();

const QuranicCalendarPage = () => {
  const { t, lang } = useTranslation('quranic-calendar');

  return (
    <>
      <NextSeoWrapper
        title={t('quranic-calendar')}
        url={getCanonicalUrl(lang, PATH)}
        languageAlternates={getLanguageAlternates(PATH)}
      />
      <QuranicCalendarHero />
      <PageContainer>
        <JoinQuranicCalendarButton />
        <Virtuoso
          data={MONTHS_WEEKS}
          useWindowScroll
          initialItemCount={3}
          totalCount={MONTHS_WEEKS.length}
          itemContent={(index, monthWeeks) => {
            let totalWeeksBeforeCurrentMonth = 0;
            for (let i = 0; i < index; i += 1) {
              const weeksOfMonth = MONTHS_WEEKS[i].length;
              totalWeeksBeforeCurrentMonth += weeksOfMonth;
            }
            return (
              <QuranicCalendarMonth
                key={index}
                monthOrder={totalWeeksBeforeCurrentMonth}
                monthWeeks={monthWeeks}
              />
            );
          }}
        />
      </PageContainer>
    </>
  );
};

export default QuranicCalendarPage;
