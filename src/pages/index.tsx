/* eslint-disable react/no-multi-comp */
import React from 'react';

import classNames from 'classnames';
import { NextPage, GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';
import dynamic from 'next/dynamic';

import styles from './index.module.scss';

import ChapterAndJuzListSkeleton from 'src/components/chapters/ChapterAndJuzListSkeleton';
import Footer from 'src/components/dls/Footer/Footer';
import Separator from 'src/components/dls/Separator/Separator';
import HomePageHero from 'src/components/HomePage/HomePageHero';
import HomePageWelcomeMessage from 'src/components/HomePage/HomePageWelcomeMessage';
import NextSeoWrapper from 'src/components/NextSeoWrapper';
import BookmarksSection from 'src/components/Verses/BookmarksSection';
import RecentReadingSessions from 'src/components/Verses/RecentReadingSessions';
import { getAllChaptersData } from 'src/utils/chapter';
import { getSEOUrl } from 'src/utils/navigation';
import { ChaptersResponse } from 'types/ApiResponses';

const ChapterAndJuzListWrapper = dynamic(
  () => import('src/components/chapters/ChapterAndJuzList'),
  {
    ssr: false,
    loading: () => <ChapterAndJuzListSkeleton />,
  },
);

type IndexProps = {
  chaptersResponse: ChaptersResponse;
};

const Index: NextPage<IndexProps> = ({ chaptersResponse: { chapters } }) => {
  const { t, lang } = useTranslation('home');
  return (
    <>
      <NextSeoWrapper title={t('noble-quran')} url={getSEOUrl(lang, '')} />
      <div className={styles.pageContainer}>
        <div className={classNames(styles.listContainer, styles.flow)}>
          <HomePageHero />
          <div className={styles.flowItem}>
            <HomePageWelcomeMessage />
          </div>
          <div className={classNames(styles.flowItem, styles.fullWidth)}>
            <RecentReadingSessions />
          </div>
          <div className={classNames(styles.flowItem, styles.fullWidth)}>
            <BookmarksSection />
          </div>
          <div className={styles.flowItem}>
            <ChapterAndJuzListWrapper chapters={chapters} />
          </div>
          <div className={styles.flowItem}>
            <Separator />
          </div>
          <div className={styles.flowItem}>
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const allChaptersData = getAllChaptersData(locale);

  return {
    props: {
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
