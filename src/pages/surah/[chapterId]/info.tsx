import React from 'react';

import { GetServerSideProps, NextPage } from 'next';

import { getChapterInfo } from '@/api';
import SurahInfoModal from '@/components/chapters/Info/SurahInfoModal';
import { logErrorToSentry } from '@/lib/sentry';
import ChapterPage, {
  getServerSideProps as getChapterPageServerSideProps,
} from '@/pages/[chapterId]/index';
import Language from '@/types/Language';
import { QuranReaderDataType } from '@/types/QuranReader';
import { ChapterResponse, VersesResponse } from 'types/ApiResponses';
import ChapterInfo from 'types/ChapterInfo';
import ChaptersData from 'types/ChaptersData';

type SurahInfoPageProps = {
  chapterId: string;
  chaptersData: ChaptersData;
  chapterInfo: ChapterInfo | null;
  chapterResponse?: ChapterResponse;
  versesResponse?: VersesResponse;
  quranReaderDataType: QuranReaderDataType;
};

const SurahInfoPage: NextPage<SurahInfoPageProps> = ({
  chapterId,
  chaptersData,
  chapterInfo,
  chapterResponse,
  versesResponse,
  quranReaderDataType,
}) => {
  return (
    <>
      <ChapterPage
        chapterResponse={chapterResponse}
        versesResponse={versesResponse}
        quranReaderDataType={quranReaderDataType}
        chaptersData={chaptersData}
      />
      <noscript suppressHydrationWarning>
        <SurahInfoModal chapterId={chapterId} initialChapterInfo={chapterInfo} />
      </noscript>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const chapterPageResult = await getChapterPageServerSideProps(context);
  if (!('props' in chapterPageResult)) return chapterPageResult;

  const { params, locale } = context;
  const chapterId = String(params?.chapterId);

  try {
    const chapterInfoResponse = await getChapterInfo(chapterId, locale as Language);
    return {
      props: {
        ...chapterPageResult.props,
        chapterId,
        chapterInfo: chapterInfoResponse?.chapterInfo ?? null,
      },
    };
  } catch (error) {
    logErrorToSentry(error, {
      transactionName: 'getServerSideProps-SurahInfoPage',
      metadata: {
        chapterId,
        locale,
      },
    });
    return {
      props: {
        ...chapterPageResult.props,
        chapterId,
        chapterInfo: null,
      },
    };
  }
};

export default SurahInfoPage;
