import React from 'react';

import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import { getRubVerses, getPagesLookup } from '@/api';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import QuranReader from '@/components/QuranReader';
import Error from '@/pages/_error';
import { getQuranReaderStylesInitialState } from '@/redux/defaultSettings/util';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates, toLocalizedNumber } from '@/utils/locale';
import { getCanonicalUrl, getRubNavigationUrl } from '@/utils/navigation';
import { formatStringNumber } from '@/utils/number';
import { getPageOrJuzMetaDescription } from '@/utils/seo';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from '@/utils/staticPageGeneration';
import { isValidRubId } from '@/utils/validator';
import { generateVerseKeysBetweenTwoVerseKeys } from '@/utils/verseKeys';
import { VersesResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';
import { QuranReaderDataType } from 'types/QuranReader';

interface RubPageProps {
  rubVerses?: VersesResponse;
  hasError?: boolean;
  chaptersData: ChaptersData;
}

const RubPage: NextPage<RubPageProps> = ({ hasError, rubVerses }) => {
  const { t, lang } = useTranslation('common');
  const {
    query: { rubId },
  } = useRouter();

  if (hasError) return <Error statusCode={500} />;

  const path = getRubNavigationUrl(Number(rubId));
  return (
    <>
      <NextSeoWrapper
        title={`${t('rub')} ${toLocalizedNumber(Number(rubId), lang)}`}
        description={getPageOrJuzMetaDescription(rubVerses)}
        canonical={getCanonicalUrl(lang, path)}
        languageAlternates={getLanguageAlternates(path)}
      />
      <QuranReader
        initialData={rubVerses}
        id={String(rubId)}
        quranReaderDataType={QuranReaderDataType.Rub}
      />
    </>
  );
};

// eslint-disable-next-line react-func/max-lines-per-function
export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  let rubId = String(params.rubId);

  // we need to validate the chapterId and rubId first to save calling BE since we haven't set the valid paths inside getStaticPaths to avoid pre-rendering them at build time.
  if (!isValidRubId(rubId)) return { notFound: true };

  const chaptersData = await getAllChaptersData(locale);
  rubId = formatStringNumber(rubId);

  const defaultMushafId = getMushafId(
    getQuranReaderStylesInitialState(locale).quranFont,
    getQuranReaderStylesInitialState(locale).mushafLines,
  ).mushaf;

  try {
    const pagesLookupResponse = await getPagesLookup({
      rubElHizbNumber: Number(rubId),
      mushaf: defaultMushafId,
    });

    const firstPageOfRub = Object.keys(pagesLookupResponse.pages)[0];
    const firstPageOfRubLookup = pagesLookupResponse.pages[firstPageOfRub];

    const numberOfVerses = generateVerseKeysBetweenTwoVerseKeys(
      chaptersData,
      pagesLookupResponse.lookupRange.from,
      pagesLookupResponse.lookupRange.to,
    ).length;

    const rubVersesResponse = await getRubVerses(rubId, locale, {
      ...getDefaultWordFields(getQuranReaderStylesInitialState(locale).quranFont),
      mushaf: defaultMushafId,
      perPage: 'all',
      from: firstPageOfRubLookup.from,
      to: firstPageOfRubLookup.to,
    });

    const metaData = { numberOfVerses };
    rubVersesResponse.metaData = metaData;
    rubVersesResponse.pagesLookup = pagesLookupResponse;
    return {
      props: {
        chaptersData,
        rubVerses: rubVersesResponse,
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

export default RubPage;
