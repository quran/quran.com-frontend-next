import React from 'react';
import range from 'lodash/range';
import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import { ChapterResponse, ChaptersResponse, VersesResponse } from 'types/APIResponses';
import { getChapters, getChapter, getChapterVerses } from '../api';
import QuranReader from '../components/QuranReader';
import { QuranFont } from '../components/QuranReader/types';

type ChapterProps = {
  chaptersResponse: ChaptersResponse;
  chapterResponse: ChapterResponse;
  versesResponse: VersesResponse;
};

const Chapter: NextPage<ChapterProps> = ({ chapterResponse: { chapter }, versesResponse }) => {
  return <QuranReader initialData={versesResponse} chapter={chapter} />;
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const chapterId = String(params.chapterId);

  const [chaptersResponse, chapterResponse, versesResponse] = await Promise.all([
    getChapters(),
    getChapter(chapterId),
    getChapterVerses(chapterId, {
      wordFields: `verse_key, verse_id, page_number, location, ${QuranFont.QPCHafs}`,
    }),
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
