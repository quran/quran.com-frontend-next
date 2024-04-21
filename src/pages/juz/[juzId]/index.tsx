import React from 'react';

import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import { getJuzVerses, getPagesLookup } from '@/api';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import QuranReader from '@/components/QuranReader';
import Error from '@/pages/_error';
import { getQuranReaderStylesInitialState } from '@/redux/defaultSettings/util';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates, toLocalizedNumber } from '@/utils/locale';
import { getCanonicalUrl, getJuzNavigationUrl } from '@/utils/navigation';
import { formatStringNumber } from '@/utils/number';
import { getPageOrJuzMetaDescription } from '@/utils/seo';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from '@/utils/staticPageGeneration';
import { isValidJuzId } from '@/utils/validator';
import { generateVerseKeysBetweenTwoVerseKeys } from '@/utils/verseKeys';
import { VersesResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';
import { QuranReaderDataType } from 'types/QuranReader';

interface JuzPageProps {
  juzVerses?: VersesResponse;
  hasError?: boolean;
  chaptersData: ChaptersData;
}

const JuzPage: NextPage<JuzPageProps> = ({ hasError, juzVerses }) => {
  const { t, lang } = useTranslation('common');
  const {
    query: { juzId },
  } = useRouter();
  if (hasError) {
    return <Error statusCode={500} />;
  }

  const path = getJuzNavigationUrl(Number(juzId));
  return (
    <>
      <NextSeoWrapper
        title={`${t('juz')} ${toLocalizedNumber(Number(juzId), lang)}`}
        description={getPageOrJuzMetaDescription(juzVerses)}
        canonical={getCanonicalUrl(lang, path)}
        languageAlternates={getLanguageAlternates(path)}
      />
      <QuranReader
        initialData={juzVerses}
        id={String(juzId)}
        quranReaderDataType={QuranReaderDataType.Juz}
      />
    </>
  );
};

// eslint-disable-next-line react-func/max-lines-per-function
export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  let juzId = String(params.juzId);
  // we need to validate the chapterId and verseId first to save calling BE since we haven't set the valid paths inside getStaticPaths to avoid pre-rendering them at build time.
  if (!isValidJuzId(juzId)) {
    return {
      notFound: true,
    };
  }
  const chaptersData = await getAllChaptersData(locale);
  juzId = formatStringNumber(juzId);

  const defaultMushafId = getMushafId(
    getQuranReaderStylesInitialState(locale).quranFont,
    getQuranReaderStylesInitialState(locale).mushafLines,
  ).mushaf;
  try {
    const pagesLookupResponse = await getPagesLookup({
      juzNumber: Number(juzId),
      mushaf: defaultMushafId,
    });
    const firstPageOfJuz = Object.keys(pagesLookupResponse.pages)[0];
    const firstPageOfJuzLookup = pagesLookupResponse.pages[firstPageOfJuz];
    const numberOfVerses = generateVerseKeysBetweenTwoVerseKeys(
      chaptersData,
      pagesLookupResponse.lookupRange.from,
      pagesLookupResponse.lookupRange.to,
    ).length;
    const juzVersesResponse = await getJuzVerses(juzId, locale, {
      ...getDefaultWordFields(getQuranReaderStylesInitialState(locale).quranFont),
      mushaf: defaultMushafId,
      perPage: 'all',
      from: firstPageOfJuzLookup.from,
      to: firstPageOfJuzLookup.to,
    });
    const metaData = { numberOfVerses };
    juzVersesResponse.metaData = metaData;
    juzVersesResponse.pagesLookup = pagesLookupResponse;
    return {
      props: {
        chaptersData,
        juzVerses: juzVersesResponse,
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
  paths: [], // no pre-rendered chapters at build time.
  fallback: 'blocking', // will server-render pages on-demand if the path doesn't exist.
});

export default JuzPage;
