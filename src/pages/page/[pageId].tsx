import Error from 'next/error';
import React from 'react';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import NextSeoHead from 'src/components/NextSeoHead';
import { isValidPageId } from 'src/utils/validator';
import { getPageVerses } from 'src/api';
import { QuranFont, QuranReaderDataType } from 'src/components/QuranReader/types';
import { VersesResponse } from 'types/APIResponses';
import { useRouter } from 'next/router';
import QuranReader from 'src/components/QuranReader';

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

  const pageVersesResponse = await getPageVerses(pageId, {
    wordFields: `verse_key, verse_id, page_number, location, ${QuranFont.QPCHafs}`,
  });
  // if the API failed due to internal server error, we will still receive a response but the body will be something like {"status":500,"error":"Internal Server Error"}.
  if (pageVersesResponse.status === 500) {
    return {
      props: {
        hasError: true,
      },
      revalidate: 35, // 35 seconds will be enough time before we re-try generating the page again.
    };
  }

  return {
    props: {
      pageVerses: pageVersesResponse,
    },
    revalidate: 604800, // verses will be generated at runtime if not found in the cache, then cached for subsequent requests for 7 days.
  };
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [], // no pre-rendered chapters at build time.
  fallback: 'blocking', // will server-render pages on-demand if the path doesn't exist.
});

export default QuranicPage;
