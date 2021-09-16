import React from 'react';

import { NextPage, GetStaticProps } from 'next';
import Image from 'next/image';

import ChaptersList from '../components/chapters/ChaptersList';
import QuickLinks from '../components/HomePage/QuickLinks';

import styles from './index.module.scss';

import homepageImage from 'public/images/homepage.png';
import HomePageWelcomeMessage from 'src/components/HomePage/HomePageWelcomeMessage';
import BookmarkedVersesList from 'src/components/Verses/BookmarkedVersesList';
import { getAllChaptersData } from 'src/utils/chapter';
import { ChaptersResponse } from 'types/APIResponses';

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
      <BookmarkedVersesList />
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
