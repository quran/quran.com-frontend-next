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
import useGetQuranicProgramWeek from '@/hooks/auth/useGetQuranicProgramWeek';
import { getQuranicCalendarOgImageUrl } from '@/lib/og';
import { QURANIC_CALENDAR_PROGRAM_ID } from '@/utils/auth/constants';
import { getAllChaptersData } from '@/utils/chapter';
import { getCurrentQuranicCalendarWeek } from '@/utils/hijri-date';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getQuranicCalendarNavigationUrl } from '@/utils/navigation';

const PATH = getQuranicCalendarNavigationUrl();

const QuranicCalendarPage = () => {
  const { t, lang } = useTranslation('quranic-calendar');
  const currentHijriDate = umalqura();
  const currentQuranicCalendarWeek = getCurrentQuranicCalendarWeek(currentHijriDate);

  // Get the current week data using our hook
  const { weekData, isLoading } = useGetQuranicProgramWeek({
    programId: QURANIC_CALENDAR_PROGRAM_ID,
    currentWeek: currentQuranicCalendarWeek,
  });

  // Use range from the API response if available, otherwise fallback to default
  const weekRanges = weekData?.ranges?.[0] || '1:1-2:1';

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
        currentQuranicCalendarWeek={currentQuranicCalendarWeek}
        currentHijriDate={currentHijriDate}
      />
      <PageContainer>
        <div className={styles.section}>
          <WeeklyVerses
            weekNumber={currentQuranicCalendarWeek}
            weekRanges={weekRanges}
            isLoading={isLoading}
            weekData={weekData}
          />
        </div>

        <div className={styles.section}>
          <AdditionalResources weekData={weekData} weekNumber={currentQuranicCalendarWeek} />
        </div>
        <div className={styles.section}>
          <MyProgress />
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
