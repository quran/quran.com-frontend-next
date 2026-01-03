/* eslint-disable max-lines */
/* eslint-disable react/no-multi-comp */
import React, { useMemo } from 'react';

import classNames from 'classnames';
import { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';

import styles from './index.module.scss';

import { getChapterVerses } from '@/api';
import ChapterAndJuzListWrapper from '@/components/chapters/ChapterAndJuzList';
import CommunitySection from '@/components/HomePage/CommunitySection';
import ExploreTopicsSection from '@/components/HomePage/ExploreTopicsSection';
import HomePageHero from '@/components/HomePage/HomePageHero';
import LearningPlansSection from '@/components/HomePage/LearningPlansSection';
import MobileHomepageSections from '@/components/HomePage/MobileHomepageSections';
import QuranInYearSection from '@/components/HomePage/QuranInYearSection';
import ReadingSection from '@/components/HomePage/ReadingSection';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import { logError } from '@/lib/newrelic';
import { Course } from '@/types/auth/Course';
import Language from '@/types/Language';
import { QuranFont } from '@/types/QuranReader';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { fetchCoursesWithLanguages } from '@/utils/auth/api';
import { isLoggedIn } from '@/utils/auth/login';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';
import getCurrentDayAyah from '@/utils/quranInYearCalendar';
import { isMobile } from '@/utils/responsive';
import withSsrRedux from '@/utils/withSsrRedux';
import { GetSsrPropsWithReduxContext } from '@/utils/withSsrRedux.types';
import { QuranInYearVerseRequest } from 'types/ApiRequests';
import {
  ChaptersResponse,
  CountryLanguagePreferenceResponse,
  VersesResponse,
} from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';

// Helper function to derive learning plan languages and fetch courses
async function fetchLearningPlansData(
  countryLanguagePreference?: CountryLanguagePreferenceResponse,
): Promise<Course[]> {
  // Derive learningPlanLanguages from countryLanguagePreference; fallback to ['en'] if not available
  // Filter out null/undefined isoCode values and convert to lowercase (type-guarded as string[])
  const learningPlanLanguages = countryLanguagePreference?.learningPlanLanguages
    ?.map((lang) => lang.isoCode)
    .filter((code): code is string => Boolean(code))
    .map((code) => code.toLowerCase()) || [Language.EN];

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

// Helper function to fetch Quran in a Year verse data
async function fetchQuranInYearVerses(
  params?: QuranInYearVerseRequest,
): Promise<VersesResponse | undefined> {
  if (!params) return undefined;

  // Destructure parameters
  const { locale, chapter, verse, translationIds, mushafLines } = params;
  const translationsParam = translationIds.join(',');

  // Build API parameters
  const quranInYearParams = {
    ...getDefaultWordFields(QuranFont.QPCHafs),
    translationFields: 'resource_name,language_id',
    ...(translationsParam ? { translations: translationsParam } : {}),
    ...getMushafId(QuranFont.QPCHafs, mushafLines),
    from: `${chapter}:${verse}`,
    to: `${chapter}:${verse}`,
  };

  try {
    // Fetch and return the ayah data
    return await getChapterVerses(chapter, locale, quranInYearParams);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logError('Failed to fetch Quran in a Year verse', err, {
      locale,
      from: `${chapter}:${verse}`,
    });
    return undefined;
  }
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
    const state = store.getState();
    const translationIds = state.translations.selectedTranslations.slice(0, 1);
    const { mushafLines } = state.quranReaderStyles;

    const [quranInYearVerses, learningPlans] = await Promise.all([
      fetchQuranInYearVerses(
        todayAyah
          ? {
              locale: currentLocale,
              translationIds,
              mushafLines,
              chapter: todayAyah.chapter,
              verse: todayAyah.verse,
            }
          : undefined,
      ),
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
