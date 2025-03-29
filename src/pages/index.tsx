/* eslint-disable max-lines */
/* eslint-disable react/no-multi-comp */
import React, { useMemo } from 'react';

import classNames from 'classnames';
import { NextPage, GetStaticProps } from 'next';
import Head from 'next/head';
import useTranslation from 'next-translate/useTranslation';

import styles from './index.module.scss';

import ChapterAndJuzListWrapper from '@/components/chapters/ChapterAndJuzList';
import CommunitySection from '@/components/HomePage/CommunitySection';
import ExploreTopicsSection from '@/components/HomePage/ExploreTopicsSection';
import HomePageHero from '@/components/HomePage/HomePageHero';
import LearningPlansSection from '@/components/HomePage/LearningPlansSection';
import MobileHomepageSections from '@/components/HomePage/MobileHomepageSections';
import QuranGrowthJourneySection from '@/components/HomePage/QuranGrowthJourneySection';
import QuranInYearSection from '@/components/HomePage/QuranInYearSection';
import ReadingSection from '@/components/HomePage/ReadingSection';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import { isLoggedIn } from '@/utils/auth/login';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';
import getCurrentDayAyah from '@/utils/quranInYearCalendar';
import { isMobile } from '@/utils/responsive';
import { ChaptersResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';

type IndexProps = {
  chaptersResponse: ChaptersResponse;
  chaptersData: ChaptersData;
};

const Index: NextPage<IndexProps> = ({ chaptersResponse: { chapters } }): JSX.Element => {
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
              <MobileHomepageSections isUserLoggedIn={isUserLoggedIn} todayAyah={todayAyah} />
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
                        <QuranInYearSection />
                      </div>
                    )}
                    <div
                      className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}
                    >
                      <LearningPlansSection />
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
                    {todayAyah && (
                      <div
                        className={classNames(
                          styles.flowItem,
                          styles.fullWidth,
                          styles.homepageCard,
                        )}
                      >
                        <QuranInYearSection />
                      </div>
                    )}
                    <div
                      className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}
                    >
                      <LearningPlansSection />
                    </div>
                    <div
                      className={classNames(styles.flowItem, styles.fullWidth, styles.homepageCard)}
                    >
                      <CommunitySection />
                    </div>
                  </>
                )}
              </>
            )}

            <div
              className={classNames(
                styles.flowItem,
                styles.fullWidth,
                styles.homepageCard,
                styles.mobileOnly,
              )}
            >
              <QuranGrowthJourneySection />
            </div>
            <div className={styles.flowItem}>
              <ChapterAndJuzListWrapper chapters={chapters} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const allChaptersData = await getAllChaptersData(locale);

  return {
    props: {
      chaptersData: allChaptersData,
      chaptersResponse: {
        chapters: Object.keys(allChaptersData).map((chapterId) => {
          const chapterData = allChaptersData[chapterId];
          return { ...chapterData, id: Number(chapterId) };
        }),
      },
    },
  };
};

export default Index;
