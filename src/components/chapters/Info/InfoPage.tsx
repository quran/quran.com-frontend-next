import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import Info from '.';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import { getChapterOgImageUrl } from '@/lib/og';
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
  const { t, lang } = useTranslation('common');
  if (hasError) {
    return <Error statusCode={500} />;
  }
  const navigationUrl = getSurahInfoNavigationUrl(chapterResponse.chapter.slug);
  return (
    <DataContext.Provider value={chaptersData}>
      <NextSeoWrapper
        title={`${t('surah')} ${chapterResponse.chapter.transliteratedName} - ${toLocalizedNumber(
          1,
          lang,
        )}-${toLocalizedNumber(chapterResponse.chapter.versesCount, lang)}`}
        image={getChapterOgImageUrl({
          chapterId: chapterInfoResponse.chapterInfo.id,
          locale: lang,
        })}
        imageWidth={1200}
        imageHeight={630}
        canonical={getCanonicalUrl(lang, navigationUrl)}
        languageAlternates={getLanguageAlternates(navigationUrl)}
        description={chapterInfoResponse.chapterInfo.shortText}
      />
      <Info chapter={chapterResponse.chapter} chapterInfo={chapterInfoResponse.chapterInfo} />
    </DataContext.Provider>
  );
};

export default InfoPage;
