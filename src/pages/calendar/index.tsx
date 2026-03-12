import { useMemo, useState } from 'react';

import umalqura from '@umalqura/core';
import { GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import styles from './calendar.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import AdditionalResources from '@/components/QuranicCalendar/AdditionalResources';
import FAQ from '@/components/QuranicCalendar/FAQ';
import MyProgress from '@/components/QuranicCalendar/MyProgress';
import QuranicCalendarHero from '@/components/QuranicCalendar/QuranicCalendarHero';
import WeeklyVerses from '@/components/QuranicCalendar/WeeklyVerses';
import quranicCalendarData from '@/data/quranic-calendar.json';
import useGetQuranicProgramWeek from '@/hooks/auth/useGetQuranicProgramWeek';
import { getQuranicCalendarOgImageUrl } from '@/lib/og';
import { QURANIC_CALENDAR_PROGRAM_ID } from '@/utils/auth/constants';
import { getAllChaptersData } from '@/utils/chapter';
import { getCurrentQuranicCalendarWeek } from '@/utils/hijri-date';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getQuranicCalendarNavigationUrl } from '@/utils/navigation';

const PATH = getQuranicCalendarNavigationUrl();
type QuranicCalendarWeekEntry = { weekNumber: string; ranges: string };

const QuranicCalendarPage = () => {
  const { t, lang } = useTranslation('quranic-calendar');
  const currentHijriDate = umalqura();
  const currentQuranicCalendarWeek = getCurrentQuranicCalendarWeek(currentHijriDate);
  const [selectedWeek, setSelectedWeek] = useState<number>(currentQuranicCalendarWeek);

  // Get the week data using our hook
  const { weekData, isLoading } = useGetQuranicProgramWeek({
    programId: QURANIC_CALENDAR_PROGRAM_ID,
    currentWeek: selectedWeek,
  });

  const weekRangesByWeekNumber = useMemo(() => {
    const weekMap = new Map<number, string>();
    Object.values(quranicCalendarData as Record<string, QuranicCalendarWeekEntry[]>)
      .flat()
      .forEach((week) => {
        weekMap.set(Number(week.weekNumber), week.ranges);
      });
    return weekMap;
  }, []);

  // Prefer local calendar data to keep UI in sync with selected week even if API data lags.
  const weekRanges = weekRangesByWeekNumber.get(selectedWeek) || weekData?.ranges?.[0] || '1:1-2:1';

  return (
    <>
      <NextSeoWrapper
        title={t('quran-calendar-title')}
        url={getCanonicalUrl(lang, PATH)}
        languageAlternates={getLanguageAlternates(PATH)}
        description={t('quran-calendar-description')}
        image={getQuranicCalendarOgImageUrl({
          locale: lang,
        })}
        imageWidth={1200}
        imageHeight={630}
      />
      <QuranicCalendarHero
        currentQuranicCalendarWeek={selectedWeek}
        currentHijriDate={currentHijriDate}
      />
      <PageContainer>
        <div className={styles.section} id="weekly-verses-section">
          <WeeklyVerses
            weekNumber={selectedWeek}
            weekRanges={weekRanges}
            isLoading={isLoading}
            weekData={weekData}
          />
        </div>

        <div className={styles.section}>
          <AdditionalResources weekData={weekData} weekNumber={selectedWeek} />
        </div>
        <div className={styles.section}>
          <MyProgress selectedWeek={selectedWeek} onWeekSelect={setSelectedWeek} />
        </div>

        <div className={styles.section}>
          <FAQ />
        </div>
      </PageContainer>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const allChaptersData = await getAllChaptersData(locale);

  return {
    props: {
      chaptersData: allChaptersData,
    },
  };
};

export default QuranicCalendarPage;
