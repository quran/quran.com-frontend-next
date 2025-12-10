/* eslint-disable max-lines */
/* eslint-disable react/no-multi-comp */
import React, { useMemo } from 'react';

import classNames from 'classnames';
import { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';

import styles from './index.module.scss';

import { fetcher } from '@/api';
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
import Language from '@/types/Language';
import { QuranFont } from '@/types/QuranReader';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { makeVersesUrl } from '@/utils/apiPaths';
import { fetchCoursesWithLanguages } from '@/utils/auth/api';
import { isLoggedIn } from '@/utils/auth/login';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';
import getCurrentDayAyah from '@/utils/quranInYearCalendar';
import { isMobile } from '@/utils/responsive';
import withSsrRedux from '@/utils/withSsrRedux';
import { GetSsrPropsWithReduxContext } from '@/utils/withSsrRedux.types';
import { ChaptersResponse, VersesResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';

// Helper function to fetch Quran in Year verse for today
async function fetchQuranInYearVerse(
  store: GetSsrPropsWithReduxContext['store'],
  currentLocale: string,
  todayAyah: ReturnType<typeof getCurrentDayAyah>,
): Promise<VersesResponse | undefined> {
  try {
    const state = store.getState();
    const translationIds = state.translations.selectedTranslations.slice(0, 1);
    const { mushafLines } = state.quranReaderStyles;

    const quranInYearParams = {
      ...getDefaultWordFields(QuranFont.QPCHafs),
      translationFields: 'resource_name,language_id',
      translations: translationIds.join(','),
      mushaf: getMushafId(QuranFont.QPCHafs, mushafLines).mushaf,
      from: `${todayAyah.chapter}:${todayAyah.verse}`,
      to: `${todayAyah.chapter}:${todayAyah.verse}`,
    };

    // Fetch the verse data for the current day's Ayah
    return fetcher<VersesResponse>(
      makeVersesUrl(todayAyah.chapter, currentLocale, quranInYearParams),
    );
  } catch (error) {
    return undefined;
  }
}

// Helper function to derive learning plan languages and fetch courses
async function fetchLearningPlansData(countryLanguagePreference: any): Promise<Course[]> {
  // Derive learningPlanLanguages from countryLanguagePreference; fallback to ['en'] if not available
  // Filter out null/undefined isoCode values and convert to lowercase (type-guarded as string[])
  const learningPlanLanguages = countryLanguagePreference?.learningPlanLanguages
    ?.map((lang: any) => lang.isoCode)
    .filter((code: any): code is string => code != null)
    .map((code: string) => code.toLowerCase()) || ['en'];

  // Fetch learning plans with fallback retry for backward compatibility
  return fetchCoursesWithLanguages(learningPlanLanguages);
}

// Helper function to build chapters response from chapters data
function buildChaptersResponse(chaptersData: ChaptersData): ChaptersResponse {
  return {
    chapters: Object.keys(chaptersData).map((chapterId) => {
      const chapterData = chaptersData[chapterId];
      return { ...chapterData, id: Number(chapterId) };
    }),
  };
}

type IndexProps = {
  chaptersResponse: ChaptersResponse;
  chaptersData: ChaptersData;
  learningPlans: Course[];
  quranInYearVerses?: VersesResponse; // SSR-fetched verse data
};

const Index: NextPage<IndexProps> = ({
  chaptersResponse: { chapters },
  chaptersData,
  learningPlans,
  quranInYearVerses,
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
                quranInYearVerses={quranInYearVerses}
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
                        <QuranInYearSection
                          chaptersData={chaptersData}
                          initialVersesData={quranInYearVerses}
                        />
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
                        <QuranInYearSection
                          chaptersData={chaptersData}
                          initialVersesData={quranInYearVerses}
                        />
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
    const typedContext = context as GetSsrPropsWithReduxContext & { chaptersData: ChaptersData };
    const { chaptersData, store } = typedContext;

    const todayAyah = getCurrentDayAyah();
    const currentLocale = languageResult.detectedLanguage || context.locale || Language.EN;

    const [quranInYearVerses, learningPlans] = await Promise.all([
      todayAyah
        ? fetchQuranInYearVerse(store, currentLocale, todayAyah)
        : Promise.resolve(undefined),
      fetchLearningPlansData(languageResult?.countryLanguagePreference),
    ]);

    return {
      props: {
        chaptersData,
        chaptersResponse: buildChaptersResponse(chaptersData),
        learningPlans,
        quranInYearVerses,
      },
    };
  },
);

export default Index;
