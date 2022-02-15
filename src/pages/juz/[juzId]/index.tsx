import React from 'react';

import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import { getJuzVerses, getPagesLookup } from 'src/api';
import NextSeoWrapper from 'src/components/NextSeoWrapper';
import QuranReader from 'src/components/QuranReader';
import Error from 'src/pages/_error';
import { getQuranReaderStylesInitialState } from 'src/redux/defaultSettings/util';
import { getDefaultWordFields, getMushafId } from 'src/utils/api';
import { getLanguageAlternates, toLocalizedNumber } from 'src/utils/locale';
import { getCanonicalUrl, getJuzNavigationUrl } from 'src/utils/navigation';
import { getPageOrJuzMetaDescription } from 'src/utils/seo';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from 'src/utils/staticPageGeneration';
import { isValidJuzId } from 'src/utils/validator';
import { generateVerseKeysBetweenTwoVerseKeys } from 'src/utils/verseKeys';
import { VersesResponse } from 'types/ApiResponses';
import { QuranReaderDataType } from 'types/QuranReader';

interface JuzPageProps {
  juzVerses?: VersesResponse;
  hasError?: boolean;
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
  const juzId = String(params.juzId);
  // we need to validate the chapterId and verseId first to save calling BE since we haven't set the valid paths inside getStaticPaths to avoid pre-rendering them at build time.
  if (!isValidJuzId(juzId)) {
    return {
      notFound: true,
    };
  }
  const defaultMushafId = getMushafId(
    getQuranReaderStylesInitialState(locale).quranFont,
    getQuranReaderStylesInitialState(locale).mushafLines,
  ).mushaf;
  try {
    const pagesLookupResponse = await getPagesLookup({
      juzNumber: Number(juzId),
      mushaf: defaultMushafId,
    });
    const numberOfVerses = generateVerseKeysBetweenTwoVerseKeys(
      pagesLookupResponse.lookupRange.from,
      pagesLookupResponse.lookupRange.to,
    ).length;
    const juzVersesResponse = await getJuzVerses(juzId, locale, {
      ...getDefaultWordFields(getQuranReaderStylesInitialState(locale).quranFont),
      mushaf: defaultMushafId,
    });
    const metaData = { numberOfVerses };
    juzVersesResponse.metaData = metaData;
    return {
      props: {
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
