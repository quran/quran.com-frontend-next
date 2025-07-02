import React from 'react';

import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import { getHizbVerses, getPagesLookup } from '@/api';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import QuranReader from '@/components/QuranReader';
import { logErrorToSentry } from '@/lib/sentry';
import { getQuranReaderStylesInitialState } from '@/redux/defaultSettings/util';
import { QuranReaderDataType } from '@/types/QuranReader';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates, toLocalizedNumber } from '@/utils/locale';
import { getCanonicalUrl, getHizbNavigationUrl } from '@/utils/navigation';
import { formatStringNumber } from '@/utils/number';
import { getPageOrJuzMetaDescription } from '@/utils/seo';
import { isValidHizbId } from '@/utils/validator';
import { generateVerseKeysBetweenTwoVerseKeys } from '@/utils/verseKeys';
import withSsrRedux from '@/utils/withSsrRedux';
import { VersesResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';

interface HizbPageProps {
  hizbVerses?: VersesResponse;
  chaptersData: ChaptersData;
}

const HizbPage: NextPage<HizbPageProps> = ({ hizbVerses }) => {
  const { t, lang } = useTranslation('common');
  const {
    query: { hizbId },
  } = useRouter();

  const path = getHizbNavigationUrl(Number(hizbId));
  return (
    <>
      <NextSeoWrapper
        title={`${t('hizb')} ${toLocalizedNumber(Number(hizbId), lang)}`}
        description={getPageOrJuzMetaDescription(hizbVerses)}
        canonical={getCanonicalUrl(lang, path)}
        languageAlternates={getLanguageAlternates(path)}
      />
      <QuranReader
        initialData={hizbVerses}
        id={String(hizbId)}
        quranReaderDataType={QuranReaderDataType.Hizb}
      />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = withSsrRedux(
  '/hizb/[hizbId]',
  async (context) => {
    const { params, locale } = context;
    const hizbId = String(params.hizbId);
    const chaptersData = await getAllChaptersData(locale);
    if (!isValidHizbId(chaptersData, hizbId)) {
      return {
        notFound: true,
      };
    }
    try {
      const hizbVerses = await getHizbVerses(locale, hizbId);
      return {
        props: {
          chaptersData,
          hizbVerses,
        },
      };
    } catch (error) {
      return {
        notFound: true,
      };
    }
  },
);

export default HizbPage;
