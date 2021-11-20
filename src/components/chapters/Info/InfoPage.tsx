import React from 'react';

import useTranslation from 'next-translate/useTranslation';

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
  const { t } = useTranslation('common');
  if (hasError) {
    return <Error statusCode={500} />;
  }
  return (
    <>
      <NextSeoWrapper
        title={`${t('surah')} ${chapterResponse.chapter.translatedName} - 1-${
          chapterResponse.chapter.versesCount
        }`}
      />
      <Info chapter={chapterResponse.chapter} chapterInfo={chapterInfoResponse.chapterInfo} />
    </>
  );
};

export default InfoPage;
