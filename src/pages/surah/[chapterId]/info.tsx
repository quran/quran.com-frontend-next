import { GetStaticPaths, GetStaticProps, NextPage } from 'next';

import InfoPage from '@/components/chapters/Info/InfoPage';
import { getChapterData, getAllChaptersData } from '@/utils/chapter';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_MONTH_REVALIDATION_PERIOD_SECONDS,
} from '@/utils/staticPageGeneration';
import { isValidChapterId } from '@/utils/validator';
import { getChapterIdBySlug, getChapterInfo } from 'src/api';
import { ChapterInfoResponse, ChapterResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';

interface Props {
  chapterResponse?: ChapterResponse;
  chapterInfoResponse?: ChapterInfoResponse;
  hasError?: boolean;
  chaptersData: ChaptersData;
}

const ChapterInfo: NextPage<Props> = (props) => {
  return <InfoPage {...props} />;
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  let chapterIdOrSlug = String(params.chapterId);
  // we need to validate the chapterId first to save calling BE since we haven't set the valid paths inside getStaticPaths to avoid pre-rendering them at build time.
  if (!isValidChapterId(chapterIdOrSlug)) {
    const sluggedChapterId = await getChapterIdBySlug(chapterIdOrSlug, locale);
    // if it's not a valid slug
    if (!sluggedChapterId) {
      return { notFound: true };
    }
    chapterIdOrSlug = sluggedChapterId;
  }
  const chaptersData = await getAllChaptersData(locale);
  try {
    const chapterInfoResponse = await getChapterInfo(chapterIdOrSlug, locale);
    return {
      props: {
        chaptersData,
        chapterInfoResponse,
        chapterResponse: { chapter: getChapterData(chaptersData, chapterIdOrSlug) },
      },
      revalidate: ONE_MONTH_REVALIDATION_PERIOD_SECONDS, // chapter info will be generated at runtime if not found in the cache, then cached for subsequent requests for 30 days.
    };
  } catch (error) {
    return {
      props: { hasError: true },
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS, // 35 seconds will be enough time before we re-try generating the page again.
    };
  }
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [], // no pre-rendered chapters at build time.
  fallback: 'blocking', // will server-render pages on-demand if the path doesn't exist.
});

export default ChapterInfo;
