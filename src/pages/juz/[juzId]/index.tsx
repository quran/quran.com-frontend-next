import React from 'react';

import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';

import { getJuzVerses } from 'src/api';
import NextSeoWrapper from 'src/components/NextSeoWrapper';
import QuranReader from 'src/components/QuranReader';
import Error from 'src/pages/_error';
import { getDefaultWordFields, getMushafId } from 'src/utils/api';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from 'src/utils/staticPageGeneration';
import { isValidJuzId } from 'src/utils/validator';
import { VersesResponse } from 'types/ApiResponses';
import { QuranReaderDataType } from 'types/QuranReader';

interface JuzPageProps {
  juzVerses?: VersesResponse;
  hasError?: boolean;
}

const JuzPage: NextPage<JuzPageProps> = ({ hasError, juzVerses }) => {
  const {
    query: { juzId },
  } = useRouter();
  if (hasError) {
    return <Error statusCode={500} />;
  }
  return (
    <>
      <NextSeoWrapper title={`Juz ${juzId}`} />
      <QuranReader
        initialData={juzVerses}
        id={String(juzId)}
        quranReaderDataType={QuranReaderDataType.Juz}
      />
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const juzId = String(params.juzId);
  // we need to validate the chapterId and verseId first to save calling BE since we haven't set the valid paths inside getStaticPaths to avoid pre-rendering them at build time.
  if (!isValidJuzId(juzId)) {
    return {
      notFound: true,
    };
  }
  try {
    const juzVersesResponse = await getJuzVerses(juzId, {
      ...getDefaultWordFields(),
      ...getMushafId(),
    });
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
