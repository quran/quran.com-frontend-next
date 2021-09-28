import React from 'react';

import Error from 'next/error';

import Info from '.';

import NextSeoHead from 'src/components/NextSeoHead';
import { ChapterInfoResponse, ChapterResponse } from 'types/ApiResponses';

interface Props {
  chapterResponse?: ChapterResponse;
  chapterInfoResponse?: ChapterInfoResponse;
  hasError?: boolean;
}
const InfoPage: React.FC<Props> = ({ hasError, chapterInfoResponse, chapterResponse }) => {
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

export default InfoPage;
