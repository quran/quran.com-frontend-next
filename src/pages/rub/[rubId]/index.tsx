import React from 'react';

import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import { getRubVerses, getPagesLookup } from '@/api';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import QuranReader from '@/components/QuranReader';
import { getQuranReaderStylesInitialState } from '@/redux/defaultSettings/util';
import Language from '@/types/Language';
import { QuranReaderDataType } from '@/types/QuranReader';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates, toLocalizedNumber } from '@/utils/locale';
import { getCanonicalUrl, getRubNavigationUrl } from '@/utils/navigation';
import { getPageOrJuzMetaDescription } from '@/utils/seo';
import { isValidRubId } from '@/utils/validator';
import { generateVerseKeysBetweenTwoVerseKeys } from '@/utils/verseKeys';
import withSsrRedux from '@/utils/withSsrRedux';
import { VersesResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';

interface RubPageProps {
  rubVerses?: VersesResponse;
  chaptersData: ChaptersData;
}

const RubPage: NextPage<RubPageProps> = ({ rubVerses }) => {
  const { t, lang } = useTranslation('common');
  const {
    query: { rubId },
  } = useRouter();

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

const buildRubPageProps = async (
  locale: string,
  rubId: string,
  chaptersData: ChaptersData,
): Promise<{ props: RubPageProps }> => {
  const quranReaderStyles = getQuranReaderStylesInitialState(locale as Language);
  const { mushaf } = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines);
  // Get pages lookup to determine the range of verses in the rub
  const pagesLookup = await getPagesLookup({ mushaf, rubElHizbNumber: Number(rubId) });
  const numberOfVerses = generateVerseKeysBetweenTwoVerseKeys(
    chaptersData,
    pagesLookup.lookupRange.from,
    pagesLookup.lookupRange.to,
  ).length;
  const firstPageOfRub = Object.keys(pagesLookup.pages)[0];
  const firstPageOfRubLookup = pagesLookup.pages[firstPageOfRub];

  const rubVerses = await getRubVerses(rubId, locale, {
    ...getDefaultWordFields(quranReaderStyles.quranFont),
    mushaf,
    perPage: 'all',
    from: firstPageOfRubLookup.from,
    to: firstPageOfRubLookup.to,
  });
  rubVerses.pagesLookup = pagesLookup;
  rubVerses.metaData = {
    ...(rubVerses.metaData || {}),
    numberOfVerses,
    from: pagesLookup.lookupRange.from,
    to: pagesLookup.lookupRange.to,
  };

  return {
    props: {
      chaptersData,
      rubVerses,
    },
  };
};

// eslint-disable-next-line react-func/max-lines-per-function
export const getServerSideProps: GetServerSideProps<RubPageProps> = withSsrRedux(
  '/rub/[rubId]',
  async (context) => {
    const { params, locale } = context;
    const rubId = String(params.rubId);
    const chaptersData = await getAllChaptersData(locale);
    if (!isValidRubId(rubId)) {
      return {
        notFound: true,
      };
    }
    try {
      return await buildRubPageProps(locale, rubId, chaptersData);
    } catch (error) {
      return {
        notFound: true,
      };
    }
  },
);

export default RubPage;
