/* eslint-disable react-func/max-lines-per-function */
import { GetServerSideProps, NextPage } from 'next';

import InfoPage from '@/components/chapters/Info/InfoPage';
import { getChapterData, getAllChaptersData } from '@/utils/chapter';
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

export const getServerSideProps: GetServerSideProps = async ({ res, ...ctx }) => {
  const { params, locale } = ctx;
  let chapterIdOrSlug = String(params.chapterId);
  // we need to validate the chapterId first to save calling BE
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
    throw new Error('123');
    const chapterInfoResponse = await getChapterInfo(chapterIdOrSlug, locale);
    return {
      props: {
        chaptersData,
        chapterInfoResponse,
        chapterResponse: { chapter: getChapterData(chaptersData, chapterIdOrSlug) },
      },
    };
  } catch (error) {
    // logErrorToSentry(error, {
    //   transactionName: 'getServerSideProps-SurahInfoPage',
    //   metadata: {
    //     chapterIdOrSlug: String(params.chapterId),
    //     locale,
    //   },
    // });

    res.setHeader(
      'Cache-Control',
      'no-store, no-cache, max-age=0, s-maxage=0, must-revalidate, private',
    );
    res.setHeader(
      'CDN-Cache-Control',
      'no-store, no-cache, max-age=0, s-maxage=0, must-revalidate, private',
    );
    res.setHeader(
      'Cloudflare-CDN-Cache-Control',
      'no-store, no-cache, max-age=0, s-maxage=0, must-revalidate, private',
    );
    res.setHeader(
      'Surrogate-Control',
      'no-store, no-cache, max-age=0, s-maxage=0, must-revalidate, private',
    );
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return {
      props: { hasError: true, chaptersData: {} },
    };
  }
};

export default ChapterInfo;
