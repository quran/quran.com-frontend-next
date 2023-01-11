import React from 'react';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import Info from '.';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import { getLanguageAlternates, toLocalizedNumber } from '@/utils/locale';
import { getCanonicalUrl, getSurahInfoNavigationUrl } from '@/utils/navigation';
import DataContext from 'src/contexts/DataContext';
import Error from 'src/pages/_error';
import { ChapterInfoResponse, ChapterResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';

interface Props {
  chapterResponse?: ChapterResponse;
  chapterInfoResponse?: ChapterInfoResponse;
  hasError?: boolean;
  chaptersData: ChaptersData;
}
const InfoPage: React.FC<Props> = ({
  hasError,
  chapterInfoResponse,
  chapterResponse,
  chaptersData,
}) => {
  const { t } = useTranslation('common');
  const { locale } = useRouter();

  if (hasError) {
    return <Error statusCode={500} />;
  }
  const navigationUrl = getSurahInfoNavigationUrl(chapterResponse.chapter.slug);
  return (
    <DataContext.Provider value={chaptersData}>
      <NextSeoWrapper
        title={`${t('surah')} ${chapterResponse.chapter.transliteratedName} - ${toLocalizedNumber(
          1,
          locale,
        )}-${toLocalizedNumber(chapterResponse.chapter.versesCount, locale)}`}
        canonical={getCanonicalUrl(locale, navigationUrl)}
        languageAlternates={getLanguageAlternates(navigationUrl)}
        description={chapterInfoResponse.chapterInfo.shortText}
      />
      <Info chapter={chapterResponse.chapter} chapterInfo={chapterInfoResponse.chapterInfo} />
    </DataContext.Provider>
  );
};

export default InfoPage;
