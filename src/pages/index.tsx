import React from 'react';

import { NextPage, GetStaticProps } from 'next';
import Image from 'next/image';

import styles from './index.module.scss';

import homepageImage from 'public/images/homepage.png';
import ChaptersList from 'src/components/chapters/ChaptersList';
import CommandBarTrigger from 'src/components/CommandBar/CommandBarTrigger';
import HomePageWelcomeMessage from 'src/components/HomePage/HomePageWelcomeMessage';
import QuickLinks from 'src/components/HomePage/QuickLinks';
import BookmarkedVersesList from 'src/components/Verses/BookmarkedVersesList';
import RecentReadingSessions from 'src/components/Verses/RecentReadingSessions';
import { getAllChaptersData } from 'src/utils/chapter';
import { ChaptersResponse } from 'types/ApiResponses';

type IndexProps = {
  chaptersResponse: ChaptersResponse;
};

const Index: NextPage<IndexProps> = ({ chaptersResponse: { chapters } }) => (
  <div className={styles.pageContainer}>
    <div className={styles.imageContainer}>
      <Image
        src={homepageImage}
        layout="responsive" // the image will scale the dimensions down for smaller viewports and scale up for larger viewports
        placeholder="blur" // to have a blur effect while loading.
      />
    </div>
    <div className={styles.listContainer}>
      <HomePageWelcomeMessage />
      <QuickLinks />
      <RecentReadingSessions />
      <BookmarkedVersesList />
      <CommandBarTrigger />
      <ChaptersList chapters={chapters} />
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
