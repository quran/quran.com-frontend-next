import React from 'react';

import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import { getPagesLookup, getPageVerses } from '@/api';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import QuranReader from '@/components/QuranReader';
import Error from '@/pages/_error';
import { getQuranReaderStylesInitialState } from '@/redux/defaultSettings/util';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates, toLocalizedNumber } from '@/utils/locale';
import { getCanonicalUrl, getPageNavigationUrl } from '@/utils/navigation';
import { getPageOrJuzMetaDescription } from '@/utils/seo';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from '@/utils/staticPageGeneration';
import { isValidPageId } from '@/utils/validator';
import { VersesResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';
import { QuranReaderDataType } from 'types/QuranReader';

interface Props {
  pageVerses: VersesResponse;
  hasError?: boolean;
  chaptersData: ChaptersData;
}

const QuranicPage: NextPage<Props> = ({ hasError, pageVerses }) => {
  const { t, lang } = useTranslation('common');
  const {
    query: { pageId },
  } = useRouter();
  if (hasError) {
    return <Error statusCode={500} />;
  }

  const path = getPageNavigationUrl(Number(pageId));
  return (
    <>
      <NextSeoWrapper
        title={`${t('page')} ${toLocalizedNumber(Number(pageId), lang)}`}
        description={getPageOrJuzMetaDescription(pageVerses)}
        canonical={getCanonicalUrl(lang, path)}
        languageAlternates={getLanguageAlternates(path)}
      />
      <QuranReader
        initialData={pageVerses}
        id={String(pageId)}
        quranReaderDataType={QuranReaderDataType.Page}
      />
    </>
  );
};

// eslint-disable-next-line react-func/max-lines-per-function
export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const pageId = String(params.pageId);
  // we need to validate the pageId first to save calling BE since we haven't set the valid paths inside getStaticPaths to avoid pre-rendering them at build time.
  if (!isValidPageId(pageId)) {
    return {
      notFound: true,
    };
  }
  const defaultMushafId = getMushafId(
    getQuranReaderStylesInitialState(locale).quranFont,
    getQuranReaderStylesInitialState(locale).mushafLines,
  ).mushaf;
  try {
    const pageVersesResponse = await getPageVerses(pageId, locale, {
      perPage: 'all',
      mushaf: defaultMushafId,
      filterPageWords: true,
      ...getDefaultWordFields(getQuranReaderStylesInitialState(locale).quranFont),
    });
    const pagesLookupResponse = await getPagesLookup({
      pageNumber: Number(pageId),
      mushaf: defaultMushafId,
    });
    const chaptersData = await getAllChaptersData(locale);
    return {
      props: {
        chaptersData,
        pageVerses: {
          ...pageVersesResponse,
          pagesLookup: pagesLookupResponse,
          metaData: { numberOfVerses: pageVersesResponse.verses.length },
        },
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
