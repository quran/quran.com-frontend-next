import Error from 'next/error';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { isValidChapterId } from 'src/utils/validator';
import { getChapter, getChapterInfo } from 'src/api';
import { ChapterInfoResponse, ChapterResponse } from 'types/APIResponses';
import NextSeoHead from 'src/components/NextSeoHead';
import Info from 'src/components/chapters/Info';

interface Props {
  chapterResponse?: ChapterResponse;
  chapterInfoResponse?: ChapterInfoResponse;
  hasError?: boolean;
}

const REVALIDATION_PERIOD_SECONDS = 2592000; // 30 days

const ChapterInfo: NextPage<Props> = ({ hasError, chapterInfoResponse, chapterResponse }) => {
  if (hasError) {
    return <Error statusCode={500} />;
  }
  return (
    <>
      <NextSeoHead
        title={`Surah ${chapterResponse.chapter.nameSimple} - 1-${chapterResponse.chapter.versesCount}`}
      />
      <Info chapter={chapterResponse.chapter} chapterInfo={chapterInfoResponse.chapterInfo} />
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const chapterId = String(params.chapterId);
  // we need to validate the chapterId first to save calling BE since we haven't set the valid paths inside getStaticPaths to avoid pre-rendering them at build time.
  if (!isValidChapterId(chapterId)) {
    return {
      notFound: true,
    };
  }

  const [chapterInfoResponse, chapterResponse] = await Promise.all([
    getChapterInfo(chapterId, locale),
    getChapter(chapterId, locale),
  ]);

  // if the API failed due to internal server error, we will still receive a response but the body will be something like {"status":500,"error":"Internal Server Error"}.
  if (chapterInfoResponse.status === 500 || chapterResponse.status === 500) {
    return {
      props: {
        hasError: true,
      },
      revalidate: 35, // 35 seconds will be enough time before we re-try generating the page again.
    };
  }

  return {
    props: {
      chapterInfoResponse,
      chapterResponse,
    },
    revalidate: REVALIDATION_PERIOD_SECONDS, // chapter info will be generated at runtime if not found in the cache, then cached for subsequent requests for 30 days.
  };
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [], // no pre-rendered chapters at build time.
  fallback: 'blocking', // will server-render pages on-demand if the path doesn't exist.
});

export default ChapterInfo;
