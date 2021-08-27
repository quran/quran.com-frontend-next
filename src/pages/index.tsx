import React from 'react';
import Image from 'next/image';
import { NextPage, GetStaticProps } from 'next';
import { ChaptersResponse } from 'types/APIResponses';
import BookmarkedVersesList from 'src/components/Verses/BookmarkedVersesList';
import homepageImage from 'public/images/homepage.png';
import ChaptersList from '../components/chapters/ChapterList';
import QuickLinks from '../components/Search/QuickLinks';
import { getChapters } from '../api';
import styles from './index.module.scss';

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
    <div className={styles.chaptersListContainer}>
      <QuickLinks />
      <BookmarkedVersesList />
      <ChaptersList chapters={chapters} />
    </div>
  </div>
);

export const getStaticProps: GetStaticProps = async () => {
  const chaptersResponse = await getChapters();

  return {
    props: { chaptersResponse },
  };
};

export default Index;
