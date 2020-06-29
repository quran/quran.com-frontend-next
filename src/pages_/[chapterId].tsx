import React from 'react';
import useSWR from 'swr';
import range from 'lodash/range';
import { Container, Row } from 'styled-bootstrap-grid';
import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import ChapterType from '../../types/ChapterType';
import { getChapters, getChapter, getChapterVerses, fetcher } from '../api';
import VersesList from '../components/verses/VersesList';
import { makeUrl } from '../utils/api';
import VerseType from '../../types/VerseType';

type ChapterProps = {
  chaptersResponse: { chapters: ChapterType[] };
  chapterResponse: { chapter: ChapterType };
  versesResponse: { verses: VerseType[] };
};

const Chapter: NextPage<ChapterProps> = ({ chapterResponse: { chapter }, versesResponse }) => {
  const { data } = useSWR(makeUrl(`/chapters/${chapter.id}/verses`), fetcher, {
    initialData: versesResponse,
    revalidateOnFocus: false,
  });

  return (
    <Container>
      <Row>{data.verses && <VersesList chapter={chapter} verses={data.verses} />}</Row>
    </Container>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const [chaptersResponse, chapterResponse, versesResponse] = await Promise.all([
    getChapters(),
    getChapter(params.chapterId),
    getChapterVerses(params.chapterId),
  ]);
  return {
    props: {
      chapterResponse,
      chaptersResponse,
      versesResponse,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: range(114).map((id) => ({
      params: {
        chapterId: String(id + 1),
      },
    })),
    fallback: false,
  };
};

export default Chapter;
