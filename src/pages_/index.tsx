import React, { useState, useEffect } from 'react';
import { NextPage, GetStaticProps } from 'next';
import dynamic from 'next/dynamic';
import ChapterType from '../../types/ChapterType';
import { getChapters } from '../api';

const DynamicChaptersList = dynamic(() => import('../components/chapters/ChapterList'));

type IndexProps = {
  chaptersResponse: {
    chapters: ChapterType[];
  };
};

const Index: NextPage<IndexProps> = ({ chaptersResponse: { chapters } }) => {
  const [didMount, setDidMount] = useState(false);

  useEffect(() => {
    setDidMount(true);
  }, []);

  return (
    <div style={{ paddingTop: '4rem' }}>
      {didMount && <DynamicChaptersList chapters={chapters} />}
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const chaptersResponse = await getChapters();

  return {
    props: { chaptersResponse },
  };
};

export default Index;
