import React from 'react';
import Error from 'next/error';
import { NextPage, GetStaticProps, GetStaticPaths } from 'next';

import { ChapterResponse, VersesResponse } from 'types/APIResponses';
import { isValidChapterId } from '../utils/validator';
import { getChapter, getChapterVerses } from '../api';
import QuranReader from '../components/QuranReader';
import { QuranFont } from '../components/QuranReader/types';

type ChapterProps = {
  chapterResponse?: ChapterResponse;
  versesResponse?: VersesResponse;
  hasError?: boolean;
};

const Chapter: NextPage<ChapterProps> = ({ chapterResponse, versesResponse, hasError }) => {
  if (hasError) {
    return <Error statusCode={500} />;
  }
  return <QuranReader initialData={versesResponse} chapter={chapterResponse.chapter} />;
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const chapterId = String(params.chapterId);
  // we need to validate the chapterId first to save calling BE since we haven't set the valid paths inside getStaticPaths to avoid pre-rendering them at build time.
  if (!isValidChapterId(chapterId)) {
    return {
      notFound: true,
    };
  }
  const [chapterResponse, versesResponse] = await Promise.all([
    getChapter(chapterId),
    getChapterVerses(chapterId, {
      wordFields: `verse_key, verse_id, page_number, location, ${QuranFont.QPCHafs}`,
    }),
  ]);
  // if any of the APIs have failed due to internal server error, we will still receive a response but the body will be something like {"status":500,"error":"Internal Server Error"}.
  if (chapterResponse.status === 500 || versesResponse.status === 500) {
    return {
      props: {
        hasError: true,
      },
      revalidate: 35, // 35 seconds will be enough time before we re-try generating the page again.
    };
  }
  return {
    props: {
      chapterResponse,
      versesResponse,
    },
    revalidate: 604800, // chapters will be generated at runtime if not found in the cache, then cached for subsequent requests for 7 days.
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [], // no pre-rendered chapters at build time.
    fallback: 'blocking', // will server-render pages on-demand if the path doesn't exist.
  };
};

export default Chapter;
