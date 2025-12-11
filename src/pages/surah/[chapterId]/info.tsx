/* eslint-disable react-func/max-lines-per-function */
import { GetServerSideProps, NextPage } from 'next';

import InfoPage from '@/components/chapters/Info/InfoPage';
import { logErrorToSentry } from '@/lib/sentry';
import { getChapterData, getAllChaptersData } from '@/utils/chapter';
import { isValidChapterId } from '@/utils/validator';
import withSsrRedux from '@/utils/withSsrRedux';
import { getChapterIdBySlug, getChapterInfo } from 'src/api';
import { ChapterInfoResponse, ChapterResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';

interface Props {
  chapterResponse?: ChapterResponse;
  chapterInfoResponse?: ChapterInfoResponse;
  chaptersData: ChaptersData;
}

const ChapterInfo: NextPage<Props> = ({ chapterResponse, chapterInfoResponse, chaptersData }) => {
  return <InfoPage {...{ chapterResponse, chapterInfoResponse, chaptersData }} />;
};

export const getServerSideProps: GetServerSideProps = withSsrRedux(
  '/surah/[chapterId]/info',
  async (context) => {
    const { params, locale } = context;
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
      };
    } catch (error) {
      logErrorToSentry(error, {
        transactionName: 'getServerSideProps-ChapterInfoPage',
        metadata: {
          chapterIdOrSlug: String(params.chapterId),
          locale,
        },
      });
      return { notFound: true };
    }
  },
);

export default ChapterInfo;
