import React from 'react';

import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import { getJuzVerses, getPagesLookup } from '@/api';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import QuranReader from '@/components/QuranReader';
import { logErrorToSentry } from '@/lib/sentry';
import { QuranReaderDataType } from '@/types/QuranReader';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates, toLocalizedNumber } from '@/utils/locale';
import { getCanonicalUrl, getJuzNavigationUrl } from '@/utils/navigation';
import { formatStringNumber } from '@/utils/number';
import { getPageOrJuzMetaDescription } from '@/utils/seo';
import { isValidJuzId } from '@/utils/validator';
import { generateVerseKeysBetweenTwoVerseKeys } from '@/utils/verseKeys';
import withSsrRedux from '@/utils/withSsrRedux';
import { VersesResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';

interface JuzPageProps {
  juzVerses?: VersesResponse;
  chaptersData: ChaptersData;
}

const JuzPage: NextPage<JuzPageProps> = ({ juzVerses }) => {
  const { t, lang } = useTranslation('common');
  const {
    query: { juzId },
  } = useRouter();

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
export const getServerSideProps: GetServerSideProps = withSsrRedux(
  '/juz/[juzId]',
  // eslint-disable-next-line react-func/max-lines-per-function
  async ({ params, locale, store }) => {
    let juzId = String(params.juzId);
    // we need to validate the chapterId and verseId first to save calling BE since we haven't set the valid paths inside getStaticPaths to avoid pre-rendering them at build time.
    if (!isValidJuzId(juzId)) {
      return { notFound: true };
    }
    const chaptersData = await getAllChaptersData(locale);
    juzId = formatStringNumber(juzId);

    const { quranReaderStyles } = store.getState();
    const defaultMushafId = getMushafId(
      quranReaderStyles.quranFont,
      quranReaderStyles.mushafLines,
    ).mushaf;
    try {
      const pagesLookupResponse = await getPagesLookup({
        juzNumber: Number(juzId),
        mushaf: defaultMushafId,
      });
      const numberOfVerses = generateVerseKeysBetweenTwoVerseKeys(
        chaptersData,
        pagesLookupResponse.lookupRange.from,
        pagesLookupResponse.lookupRange.to,
      ).length;
      const firstPageOfJuz = Object.keys(pagesLookupResponse.pages)[0];
      const firstPageOfJuzLookup = pagesLookupResponse.pages[firstPageOfJuz];

      const juzVersesResponse = await getJuzVerses(juzId, locale, {
        ...getDefaultWordFields(quranReaderStyles.quranFont),
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
      };
    } catch (error) {
      logErrorToSentry(error, {
        transactionName: 'getServerSideProps-JuzPage',
        metadata: {
          juzId: String(params.juzId),
          locale,
        },
      });
      return { notFound: true };
    }
  },
);

export default JuzPage;
