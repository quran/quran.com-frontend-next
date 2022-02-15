import React from 'react';

import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import { getPageVerses } from 'src/api';
import NextSeoWrapper from 'src/components/NextSeoWrapper';
import QuranReader from 'src/components/QuranReader';
import Error from 'src/pages/_error';
import { getQuranReaderStylesInitialState } from 'src/redux/defaultSettings/util';
import { getDefaultWordFields, getMushafId } from 'src/utils/api';
import { getLanguageAlternates, toLocalizedNumber } from 'src/utils/locale';
import { getCanonicalUrl, getPageNavigationUrl } from 'src/utils/navigation';
import { getPageOrJuzMetaDescription } from 'src/utils/seo';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from 'src/utils/staticPageGeneration';
import { isValidPageId } from 'src/utils/validator';
import { VersesResponse } from 'types/ApiResponses';
import { QuranReaderDataType } from 'types/QuranReader';

interface Props {
  pageVerses: VersesResponse;
  hasError?: boolean;
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
  try {
    const pageVersesResponse = await getPageVerses(pageId, locale, {
      perPage: 'all',
      ...getDefaultWordFields(getQuranReaderStylesInitialState(locale).quranFont),
      ...getMushafId(
        getQuranReaderStylesInitialState(locale).quranFont,
        getQuranReaderStylesInitialState(locale).mushafLines,
      ),
    });
    return {
      props: {
        pageVerses: {
          ...pageVersesResponse,
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
