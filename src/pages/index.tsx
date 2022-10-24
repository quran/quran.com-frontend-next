/* eslint-disable react/no-multi-comp */
import React from 'react';

import classNames from 'classnames';
import { NextPage, GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';
import Head from 'next/head';

import styles from './index.module.scss';

import ChapterAndJuzListWrapper from '@/components/chapters/ChapterAndJuzList';
import HomePageHero from '@/components/HomePage/HomePageHero';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import BookmarksAndCollectionsSection from '@/components/Verses/BookmarksAndCollectionsSection';
import RecentReadingSessions from '@/components/Verses/RecentReadingSessions';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';
import DataContext from 'src/contexts/DataContext';
import { ChaptersResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';

type IndexProps = {
  chaptersResponse: ChaptersResponse;
  chaptersData: ChaptersData;
};

const Index: NextPage<IndexProps> = ({
  chaptersData,
  chaptersResponse: { chapters },
}): JSX.Element => {
  const { t, lang } = useTranslation('home');
  return (
    <>
      <Head>
        <link rel="preload" as="image" href="/images/background.jpg" crossOrigin="anonymous" />
      </Head>
      <DataContext.Provider value={chaptersData}>
        <NextSeoWrapper
          title={t('home:noble-quran')}
          url={getCanonicalUrl(lang, '')}
          languageAlternates={getLanguageAlternates('')}
        />
        <div className={styles.pageContainer}>
          <div className={styles.flow}>
            <HomePageHero />
            <div className={classNames(styles.flowItem, styles.fullWidth)}>
              <RecentReadingSessions />
            </div>
            <div className={classNames(styles.flowItem, styles.fullWidth)}>
              <BookmarksAndCollectionsSection />
            </div>
            <div className={styles.flowItem}>
              <ChapterAndJuzListWrapper chapters={chapters} />
            </div>
          </div>
        </div>
      </DataContext.Provider>
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
