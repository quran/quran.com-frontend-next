import { GetServerSideProps, NextPage } from 'next';
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
import { isValidPageNumber } from '@/utils/validator';
import withSsrRedux from '@/utils/withSsrRedux';
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

export const getServerSideProps: GetServerSideProps = withSsrRedux(
  '/page/[pageId]',
  async (context) => {
    const { params, locale } = context;
    const pageId = String(params.pageId);
    const chaptersData = await getAllChaptersData(locale);
    if (!isValidPageNumber(chaptersData, pageId)) {
      return {
        notFound: true,
      };
    }
    try {
      const pageVerses = await getPageVerses(locale, pageId);
      return {
        props: {
          chaptersData,
          pageVerses,
        },
      };
    } catch (error) {
      return {
        notFound: true,
      };
    }
  },
);

export default QuranicPage;
