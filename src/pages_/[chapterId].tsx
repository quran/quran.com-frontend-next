import React from 'react';
import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import { ChapterResponse, ChaptersResponse, VersesResponse } from 'types/APIResponses';
import { useRouter } from 'next/router';
import { getChapters, getChapter, getChapterVerses } from '../api';
import QuranReader from '../components/QuranReader';
import { QuranFont } from '../components/QuranReader/types';

type ChapterProps = {
  chaptersResponse: ChaptersResponse;
  chapterResponse: ChapterResponse;
  versesResponse: VersesResponse;
};

const Chapter: NextPage<ChapterProps> = ({ chapterResponse, versesResponse }) => {
  const { isFallback } = useRouter();
  if (!isFallback) {
    const { chapter } = chapterResponse;
    return <QuranReader initialData={versesResponse} chapter={chapter} />;
  }
  // TODO: show a proper loader
  return <div>Loading</div>;
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
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 10 seconds
    revalidate: 10,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  // All chapter pages will be created during runtime and cached for subsequent requests
  return {
    paths: [],
    fallback: true,
  };
};

export default Chapter;
