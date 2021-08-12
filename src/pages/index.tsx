import React from 'react';
import { NextPage, GetStaticProps } from 'next';
import { ChaptersResponse } from 'types/APIResponses';
import ChaptersList from '../components/chapters/ChapterList';
import { getChapters } from '../api';
import styles from './index.module.scss';

type IndexProps = {
  chaptersResponse: ChaptersResponse;
};

const Index: NextPage<IndexProps> = ({ chaptersResponse: { chapters } }) => (
  <div className={styles.container}>
    <ChaptersList chapters={chapters.slice(0, 38)} />
    <ChaptersList chapters={chapters.slice(38, 76)} />
    <ChaptersList chapters={chapters.slice(76, 114)} />
  </div>
);

export const getStaticProps: GetStaticProps = async () => {
  const chaptersResponse = await getChapters();

  return {
    props: { chaptersResponse },
  };
};

export default Index;
