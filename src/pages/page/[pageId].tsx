import React from 'react';

import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Error from 'next/error';
import { useRouter } from 'next/router';

import { getPageVerses } from 'src/api';
import NextSeoHead from 'src/components/NextSeoHead';
import QuranReader from 'src/components/QuranReader';
import { QuranReaderDataType } from 'src/components/QuranReader/types';
import { getDefaultWordFields, getMushafId } from 'src/utils/api';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from 'src/utils/staticPageGeneration';
import { isValidPageId } from 'src/utils/validator';
import { VersesResponse } from 'types/ApiResponses';

interface Props {
  pageVerses: VersesResponse;
  hasError?: boolean;
}

const QuranicPage: NextPage<Props> = ({ hasError, pageVerses }) => {
  const {
    query: { pageId },
  } = useRouter();
  if (hasError) {
    return <Error statusCode={500} />;
  }
  return (
    <>
      <NextSeoHead title={`Page ${pageId}`} />
      <QuranReader
        initialData={pageVerses}
        id={String(pageId)}
        quranReaderDataType={QuranReaderDataType.Page}
      />
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const pageId = String(params.pageId);
  // we need to validate the pageId first to save calling BE since we haven't set the valid paths inside getStaticPaths to avoid pre-rendering them at build time.
  if (!isValidPageId(pageId)) {
    return {
      notFound: true,
    };
  }
  try {
    const pageVersesResponse = await getPageVerses(pageId, {
      ...getDefaultWordFields(),
      ...getMushafId(),
    });
    return {
      props: {
        pageVerses: pageVersesResponse,
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

export default QuranicPage;
