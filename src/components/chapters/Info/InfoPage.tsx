import React from 'react';

import Info from '.';

import NextSeoWrapper from 'src/components/NextSeoWrapper';
import Error from 'src/pages/_error';
import { ChapterInfoResponse, ChapterResponse } from 'types/ApiResponses';

interface Props {
  chapterResponse?: ChapterResponse;
  chapterInfoResponse?: ChapterInfoResponse;
  hasError?: boolean;
}
const InfoPage: React.FC<Props> = ({ hasError, chapterInfoResponse, chapterResponse }) => {
  if (hasError) {
    return <Error />;
  }
  return (
    <>
      <NextSeoWrapper
        title={`Surah ${chapterResponse.chapter.nameSimple} - 1-${chapterResponse.chapter.versesCount}`}
      />
      <Info chapter={chapterResponse.chapter} chapterInfo={chapterInfoResponse.chapterInfo} />
    </>
  );
};

export default InfoPage;
