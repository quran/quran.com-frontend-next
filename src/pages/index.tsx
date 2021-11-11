import React from 'react';

import classNames from 'classnames';
import { NextPage, GetStaticProps } from 'next';

import styles from './index.module.scss';

import ChapterAndJuzList from 'src/components/chapters/ChapterAndJuzList';
import CommandBarTrigger from 'src/components/CommandBar/CommandBarTrigger';
import Footer from 'src/components/dls/Footer/Footer';
import HomePageImage from 'src/components/HomePage/HomePageImage';
import HomePageWelcomeMessage from 'src/components/HomePage/HomePageWelcomeMessage';
import BookmarksAndQuickLinks from 'src/components/Verses/BookmarksAndQuickLinks';
import RecentReadingSessions from 'src/components/Verses/RecentReadingSessions';
import { getAllChaptersData } from 'src/utils/chapter';
import { ChaptersResponse } from 'types/ApiResponses';

type IndexProps = {
  chaptersResponse: ChaptersResponse;
};

const Index: NextPage<IndexProps> = ({ chaptersResponse: { chapters } }) => (
  <div className={styles.pageContainer}>
    <div className={classNames(styles.listContainer, styles.flow)}>
      <div className={classNames(styles.flowItem)}>
        <CommandBarTrigger />
      </div>
      <div className={classNames(styles.flowItem)}>
        <HomePageImage />
      </div>
      <div className={styles.flowItem}>
        <HomePageWelcomeMessage />
      </div>
      <div className={classNames(styles.flowItem, styles.fullWidth)}>
        <RecentReadingSessions />
      </div>
      <div className={classNames(styles.flowItem, styles.fullWidth)}>
        <BookmarksAndQuickLinks />
      </div>
      <div className={styles.flowItem}>
        <ChapterAndJuzList chapters={chapters} />
      </div>
      <div className={styles.flowItem}>
        <Footer />
      </div>
    </div>
  </div>
);

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
