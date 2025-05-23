import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import { getPagesLookup, getPageVerses } from '@/api';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import QuranReader from '@/components/QuranReader';
import useFetchPagesLookup from '@/components/QuranReader/hooks/useFetchPagesLookup';
import useFetchPageVerses from '@/components/QuranReader/hooks/useFetchPageVerses';
import Spinner from '@/dls/Spinner/Spinner';
import useGetMushaf from '@/hooks/useGetMushaf';
import { logErrorToSentry } from '@/lib/sentry';
import Error from '@/pages/_error';
import { getQuranReaderStylesInitialState } from '@/redux/defaultSettings/util';
import {
  selectIsUsingDefaultFont,
  selectQuranReaderStyles,
} from '@/redux/slices/QuranReader/styles';
import { VersesResponse } from '@/types/ApiResponses';
import { Mushaf, QuranReaderDataType } from '@/types/QuranReader';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates, toLocalizedNumber } from '@/utils/locale';
import { getCanonicalUrl, getPageNavigationUrl } from '@/utils/navigation';
import { PAGES_MUSHAF_MAP } from '@/utils/page';
import getPageVersesParams from '@/utils/pages/getPageVersesParams';
import getQuranReaderData from '@/utils/pages/getQuranReaderData';
import { getPageOrJuzMetaDescription } from '@/utils/seo';
import {
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
} from '@/utils/staticPageGeneration';
import { isValidPageNumber } from '@/utils/validator';
import ChaptersData from 'types/ChaptersData';

interface Props {
  pageVerses: VersesResponse;
  chaptersData: ChaptersData;
}

const QuranicPage: NextPage<Props> = ({ pageVerses: initialData }) => {
  const { t, lang } = useTranslation('common');
  const {
    query: { pageId },
  } = useRouter();

  const mushafId = useGetMushaf();
  const {
    data: pageVersesData,
    isLoading: isPageVersesLoading,
    error: pageVersesError,
  } = useFetchPageVerses(String(pageId), initialData);

  const isUsingDefaultFont = useSelector(selectIsUsingDefaultFont);
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);

  const {
    data: pagesLookupData,
    isLoading: isPagesLookupLoading,
    hasError: pagesLookupError,
  } = useFetchPagesLookup(
    String(pageId),
    QuranReaderDataType.Page,
    initialData,
    quranReaderStyles,
    isUsingDefaultFont,
  );

  if (pageId > PAGES_MUSHAF_MAP[Number(mushafId)] || pagesLookupError || pageVersesError) {
    return <Error statusCode={500} />;
  }

  if (isPageVersesLoading || isPagesLookupLoading) {
    return <Spinner />;
  }

  const path = getPageNavigationUrl(Number(pageId));
  const data = getQuranReaderData(pagesLookupData, pageVersesData);

  return (
    <>
      <NextSeoWrapper
        title={`${t('page')} ${toLocalizedNumber(Number(pageId), lang)}`}
        description={getPageOrJuzMetaDescription(data)}
        canonical={getCanonicalUrl(lang, path)}
        languageAlternates={getLanguageAlternates(path)}
      />
      <QuranReader
        initialData={data}
        id={String(pageId)}
        quranReaderDataType={QuranReaderDataType.Page}
      />
    </>
  );
};

// eslint-disable-next-line react-func/max-lines-per-function
export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const pageIdNumber = Number(params.pageId);
  const defaultMushafId = getMushafId(
    getQuranReaderStylesInitialState(locale).quranFont,
    getQuranReaderStylesInitialState(locale).mushafLines,
  ).mushaf;
  const LONGEST_MUSHAF_ID = Mushaf.Indopak15Lines;

  // we need to validate the pageId first to save calling BE since we haven't set the valid paths inside getStaticPaths to avoid pre-rendering them at build time.
  if (!isValidPageNumber(pageIdNumber, LONGEST_MUSHAF_ID)) {
    return {
      notFound: true,
    };
  }

  // The defaultMushafId is 2 representing the Madinah Mushaf
  // PAGES_MUSHAF_MAP will return the mushaf total number of pages when passed a mushafId
  // Mushaf ID: 2 (Madinah) -> Pages Count: 604 pages
  const defaultMushafPagesCount = PAGES_MUSHAF_MAP[defaultMushafId];
  // In case the requested page/[pageId] is greater than the SSR loaded default mushaf total pages count
  // we set the pageId to the last available page, otherwise we load the passed pageID
  const pageId =
    pageIdNumber > defaultMushafPagesCount
      ? String(defaultMushafPagesCount)
      : String(params.pageId);

  try {
    const pageVersesResponse = await getPageVerses(
      pageId,
      locale,
      getPageVersesParams(
        defaultMushafId,
        getDefaultWordFields(getQuranReaderStylesInitialState(locale).quranFont),
      ),
    );
    const pagesLookupResponse = await getPagesLookup({
      pageNumber: Number(pageId),
      mushaf: defaultMushafId,
    });
    const chaptersData = await getAllChaptersData(locale);
    return {
      props: {
        chaptersData,
        pageVerses: getQuranReaderData(pagesLookupResponse, pageVersesResponse),
      },
      revalidate: ONE_WEEK_REVALIDATION_PERIOD_SECONDS, // verses will be generated at runtime if not found in the cache, then cached for subsequent requests for 7 days.
    };
  } catch (error) {
    logErrorToSentry(error, {
      transactionName: 'getStaticProps-QuranPage',
      metadata: {
        pageId: String(params.pageId),
        locale,
      },
    });

    return {
      notFound: true,
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS,
    };
  }
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [], // no pre-rendered chapters at build time.
  fallback: 'blocking', // will server-render pages on-demand if the path doesn't exist.
});

export default QuranicPage;
