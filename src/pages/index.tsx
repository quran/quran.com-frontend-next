/* eslint-disable max-lines */
/* eslint-disable react/no-multi-comp */
import React, { useMemo } from 'react';

import classNames from 'classnames';
import { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';

import styles from './index.module.scss';

import ChapterAndJuzListWrapper from '@/components/chapters/ChapterAndJuzList';
import CommunitySection from '@/components/HomePage/CommunitySection';
import ExploreTopicsSection from '@/components/HomePage/ExploreTopicsSection';
import HomePageHero from '@/components/HomePage/HomePageHero';
import LearningPlansSection from '@/components/HomePage/LearningPlansSection';
import MobileHomepageSections from '@/components/HomePage/MobileHomepageSections';
import QuranInYearSection from '@/components/HomePage/QuranInYearSection';
import ReadingSection from '@/components/HomePage/ReadingSection';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import { Course } from '@/types/auth/Course';
import { fetchCoursesWithLanguages } from '@/utils/auth/api';
import { isLoggedIn } from '@/utils/auth/login';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';
import getCurrentDayAyah from '@/utils/quranInYearCalendar';
import { isMobile } from '@/utils/responsive';
import withSsrRedux from '@/utils/withSsrRedux';
import { ChaptersResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';

type IndexProps = {
  chaptersResponse: ChaptersResponse;
  chaptersData: ChaptersData;
  learningPlans: Course[];
};

const Index: NextPage<IndexProps> = ({
  chaptersResponse: { chapters },
  chaptersData,
  learningPlans,
}): JSX.Element => {
  const { t, lang } = useTranslation('home');
  const isUserLoggedIn = isLoggedIn();
  const todayAyah = useMemo(() => getCurrentDayAyah(), []);

  return (
    <>
      <Head>
        <link rel="preload" as="image" href="/images/background.png" crossOrigin="anonymous" />
      </Head>
      <NextSeoWrapper
        title={t('home:noble-quran')}
        url={getCanonicalUrl(lang, '')}
        languageAlternates={getLanguageAlternates('')}
      />
      <div className={styles.pageContainer}>
        <div className={styles.flow}>
          <HomePageHero />
          <div className={styles.bodyContainer}>
            <div className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}>
              <ReadingSection />
            </div>
            {isMobile() ? (
              <MobileHomepageSections
                isUserLoggedIn={isUserLoggedIn}
                todayAyah={todayAyah}
                chaptersData={chaptersData}
                learningPlans={learningPlans}
              />
            ) : (
              <>
                {isUserLoggedIn ? (
                  <>
                    {todayAyah && (
                      <div
                        className={classNames(
                          styles.flowItem,
                          styles.fullWidth,
                          styles.homepageCard,
                        )}
                      >
                        <QuranInYearSection chaptersData={chaptersData} />
                      </div>
                    )}
                    <div
                      className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}
                    >
                      <LearningPlansSection courses={learningPlans} />
                    </div>
                    <div
                      className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}
                    >
                      <ExploreTopicsSection />
                    </div>
                    <div
                      className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}
                    >
                      <CommunitySection />
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}
                    >
                      <ExploreTopicsSection />
                    </div>
                    <div
                      className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}
                    >
                      <LearningPlansSection courses={learningPlans} />
                    </div>
                    {todayAyah && (
                      <div
                        className={classNames(
                          styles.flowItem,
                          styles.fullWidth,
                          styles.homepageCard,
                        )}
                      >
                        <QuranInYearSection chaptersData={chaptersData} />
                      </div>
                    )}

                    <div
                      className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}
                    >
                      <CommunitySection />
                    </div>
                  </>
                )}
              </>
            )}

            <div className={styles.flowItem}>
              <ChapterAndJuzListWrapper chapters={chapters} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = withSsrRedux(
  '/',
  async (context, languageResult) => {
    const { chaptersData } = context as typeof context & { chaptersData: ChaptersData };

    // Derive learningPlanLanguages from countryLanguagePreference; fallback to ['en'] if not available
    // Filter out null/undefined isoCode values and convert to lowercase (type-guarded as string[])
    const learningPlanLanguages = languageResult?.countryLanguagePreference?.learningPlanLanguages
      ?.map((lang) => lang.isoCode)
      .filter((code): code is string => code != null)
      .map((code) => code.toLowerCase()) || ['en'];

    // Fetch learning plans with fallback retry for backward compatibility
    const learningPlansResponse = await fetchCoursesWithLanguages(learningPlanLanguages);

    return {
      props: {
        chaptersData,
        chaptersResponse: {
          chapters: Object.keys(chaptersData).map((chapterId) => {
            const chapterData = chaptersData[chapterId];
            return { ...chapterData, id: Number(chapterId) };
          }),
        },
        learningPlans: learningPlansResponse.data,
      },
    };
  },
);

export default Index;
