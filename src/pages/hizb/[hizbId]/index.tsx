import React from 'react';

import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import { getHizbVerses, getPagesLookup } from '@/api';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import QuranReader from '@/components/QuranReader';
import Error from '@/pages/_error';
import { getQuranReaderStylesInitialState } from '@/redux/defaultSettings/util';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates, toLocalizedNumber } from '@/utils/locale';
import { getCanonicalUrl, getHizbNavigationUrl } from '@/utils/navigation';
import { formatStringNumber } from '@/utils/number';
import { getPageOrJuzMetaDescription } from '@/utils/seo';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from '@/utils/staticPageGeneration';
import { isValidHizbId } from '@/utils/validator';
import { generateVerseKeysBetweenTwoVerseKeys } from '@/utils/verseKeys';
import { VersesResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';
import { QuranReaderDataType } from 'types/QuranReader';

interface HizbPageProps {
  hizbVerses?: VersesResponse;
  hasError?: boolean;
  chaptersData: ChaptersData;
}

const HizbPage: NextPage<HizbPageProps> = ({ hasError, hizbVerses }) => {
  const { t, lang } = useTranslation('common');
  const {
    query: { hizbId },
  } = useRouter();

  if (hasError) return <Error statusCode={500} />;

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

// eslint-disable-next-line react-func/max-lines-per-function
export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  let hizbId = String(params.hizbId);
  // we need to validate the hizbId first to save calling BE since we haven't set the valid paths inside getStaticPaths to avoid pre-rendering them at build time.
  if (!isValidHizbId(hizbId)) return { notFound: true };

  const chaptersData = await getAllChaptersData(locale);
  hizbId = formatStringNumber(hizbId);

  const defaultMushafId = getMushafId(
    getQuranReaderStylesInitialState(locale).quranFont,
    getQuranReaderStylesInitialState(locale).mushafLines,
  ).mushaf;

  try {
    const pagesLookupResponse = await getPagesLookup({
      hizbNumber: Number(hizbId),
      mushaf: defaultMushafId,
    });
    const firstPageOfHizb = Object.keys(pagesLookupResponse.pages)[0];
    const firstPageOfHizbLookup = pagesLookupResponse.pages[firstPageOfHizb];
    const numberOfVerses = generateVerseKeysBetweenTwoVerseKeys(
      chaptersData,
      pagesLookupResponse.lookupRange.from,
      pagesLookupResponse.lookupRange.to,
    ).length;
    const hizbVersesResponse = await getHizbVerses(hizbId, locale, {
      ...getDefaultWordFields(getQuranReaderStylesInitialState(locale).quranFont),
      mushaf: defaultMushafId,
      perPage: 'all',
      from: firstPageOfHizbLookup.from,
      to: firstPageOfHizbLookup.to,
    });
    const metaData = { numberOfVerses };
    hizbVersesResponse.metaData = metaData;
    hizbVersesResponse.pagesLookup = pagesLookupResponse;
    return {
      props: {
        chaptersData,
        hizbVerses: hizbVersesResponse,
      },
      revalidate: ONE_WEEK_REVALIDATION_PERIOD_SECONDS, // verses will be generated at runtime if not found in the cache, then cached for subsequent requests for 7 days.
    };
  } catch (error) {
    return {
      props: {
        hasError: true,
      },
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS, // 35 seconds will be enough time before we re-try generating the page again.
    };
  }
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [], // no pre-rendered hizbs at build time.
  fallback: 'blocking', // will server-render pages on-demand if the path doesn't exist.
});

export default HizbPage;
