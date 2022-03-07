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
import HomePageMessage from 'src/components/HomePage/HomePageMessage';
import NextSeoWrapper from 'src/components/NextSeoWrapper';
import BookmarksSection from 'src/components/Verses/BookmarksSection';
import RecentReadingSessions from 'src/components/Verses/RecentReadingSessions';
import { getAllChaptersData } from 'src/utils/chapter';
import { getLanguageAlternates } from 'src/utils/locale';
import { getCanonicalUrl } from 'src/utils/navigation';
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
      <NextSeoWrapper
        title={t('noble-quran')}
        url={getCanonicalUrl(lang, '')}
        languageAlternates={getLanguageAlternates('')}
      />
      <div className={styles.pageContainer}>
        <div className={classNames(styles.listContainer, styles.flow)}>
          <HomePageHero />
          <div className={styles.flowItem}>
            <HomePageMessage
              title="Welcome to the new Quran.com!"
              body={
                <>
                  After over a year of hard work we are excited to present to you the new Quran.com.
                  We have put great effort to providing you with new experiences such as sepia mode,
                  word-by-word view, command bar, IndoPak Mushafs, and more.
                  <br />
                  <br />
                  We hope you enjoy the new Quran.com as much as we do. Please let us know about
                  bugs, feature requests on{' '}
                  <a href="https://feedback.quran.com" target="_blank" rel="noreferrer">
                    feedback.quran.com
                  </a>
                  . We are all in this together and want to improve the product to serve you better.
                  <br />
                  <br />
                  If you wish to go back to the old site at any time, please visit{' '}
                  <a href="https://previous.quran.com" target="_blank" rel="noreferrer">
                    previous.quran.com
                  </a>
                  .
                  <br />
                  <br />- Quran.com team
                </>
              }
            />
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
