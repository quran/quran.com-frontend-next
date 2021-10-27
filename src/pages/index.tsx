import React from 'react';

import classNames from 'classnames';
import { NextPage, GetStaticProps } from 'next';
import Image from 'next/image';

import styles from './index.module.scss';

import homepageImage from 'public/images/homepage.png';
import ChapterAndJuzList from 'src/components/chapters/ChapterAndJuzList';
import CommandBarTrigger from 'src/components/CommandBar/CommandBarTrigger';
import Footer from 'src/components/dls/Footer/Footer';
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
        <div className={styles.homepageImageContainer}>
          <Image
            className={styles.homepageImage}
            src={homepageImage}
            objectFit="cover"
            sizes="(max-width: 500px) 640w, 50vw"
            quality={65}
            priority
            layout="fill" // the image will scale the dimensions down for smaller viewports and scale up for larger viewports
            // placeholder="blur" // to have a blur effect while loading.
          />
        </div>
      </div>
      <div className={styles.flowItem}>
        <CommandBarTrigger />
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

export const getStaticProps: GetStaticProps = async () => {
  const allChaptersData = getAllChaptersData();

  return {
    props: {
      chaptersResponse: {
        chapters: Object.values(allChaptersData),
      },
    },
  };
};

export default Index;
