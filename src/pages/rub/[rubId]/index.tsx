import React from 'react';

import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import { getRubVerses, getPagesLookup } from '@/api';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import QuranReader from '@/components/QuranReader';
import { logErrorToSentry } from '@/lib/sentry';
import { getQuranReaderStylesInitialState } from '@/redux/defaultSettings/util';
import { QuranReaderDataType } from '@/types/QuranReader';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates, toLocalizedNumber } from '@/utils/locale';
import { getCanonicalUrl, getRubNavigationUrl } from '@/utils/navigation';
import { formatStringNumber } from '@/utils/number';
import { getPageOrJuzMetaDescription } from '@/utils/seo';
import { isValidRubId } from '@/utils/validator';
import { generateVerseKeysBetweenTwoVerseKeys } from '@/utils/verseKeys';
import withSsrRedux from '@/utils/withSsrRedux';
import { VersesResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';

interface RubPageProps {
  rubVerses?: VersesResponse;
  chaptersData: ChaptersData;
}

const RubPage: NextPage<RubPageProps> = ({ rubVerses }) => {
  const { t, lang } = useTranslation('common');
  const {
    query: { rubId },
  } = useRouter();

  const path = getRubNavigationUrl(Number(rubId));
  return (
    <>
      <NextSeoWrapper
        title={`${t('rub')} ${toLocalizedNumber(Number(rubId), lang)}`}
        description={getPageOrJuzMetaDescription(rubVerses)}
        canonical={getCanonicalUrl(lang, path)}
        languageAlternates={getLanguageAlternates(path)}
      />
      <QuranReader
        initialData={rubVerses}
        id={String(rubId)}
        quranReaderDataType={QuranReaderDataType.Rub}
      />
    </>
  );
};

// eslint-disable-next-line react-func/max-lines-per-function
export const getServerSideProps: GetServerSideProps = withSsrRedux(
  '/rub/[rubId]',
  async (context) => {
    const { params, locale } = context;
    const rubId = String(params.rubId);
    const chaptersData = await getAllChaptersData(locale);
    if (!isValidRubId(chaptersData, rubId)) {
      return {
        notFound: true,
      };
    }
    try {
      const rubVerses = await getRubVerses(locale, rubId);
      return {
        props: {
          chaptersData,
          rubVerses,
        },
      };
    } catch (error) {
      return {
        notFound: true,
      };
    }
  },
);

export default RubPage;
