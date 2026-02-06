/* eslint-disable react-func/max-lines-per-function */
import React from 'react';

import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import { getHizbVerses, getPagesLookup } from '@/api';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import QuranReader from '@/components/QuranReader';
import { getQuranReaderStylesInitialState } from '@/redux/defaultSettings/util';
import Language from '@/types/Language';
import { QuranReaderDataType } from '@/types/QuranReader';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates, toLocalizedNumber } from '@/utils/locale';
import { getCanonicalUrl, getHizbNavigationUrl } from '@/utils/navigation';
import { getPageOrJuzMetaDescription } from '@/utils/seo';
import { isValidHizbId } from '@/utils/validator';
import { generateVerseKeysBetweenTwoVerseKeys } from '@/utils/verseKeys';
import withSsrRedux from '@/utils/withSsrRedux';
import { VersesResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';

interface HizbPageProps {
  hizbVerses?: VersesResponse;
  chaptersData: ChaptersData;
}

const HizbPage: NextPage<HizbPageProps> = ({ hizbVerses }) => {
  const { t, lang } = useTranslation('common');
  const {
    query: { hizbId },
  } = useRouter();

  const path = getHizbNavigationUrl(Number(hizbId));
  return (
    <>
      <NextSeoWrapper
        title={`${t('hizb')} ${toLocalizedNumber(Number(hizbId), lang)}`}
        description={getPageOrJuzMetaDescription(hizbVerses)}
        canonical={getCanonicalUrl(lang, path)}
        languageAlternates={getLanguageAlternates(path)}
      />
      <QuranReader
        initialData={hizbVerses}
        id={String(hizbId)}
        quranReaderDataType={QuranReaderDataType.Hizb}
      />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = withSsrRedux(
  '/hizb/[hizbId]',
  async (context) => {
    const { params, locale } = context;
    const hizbId = String(params.hizbId);
    const chaptersData = await getAllChaptersData(locale);
    if (!isValidHizbId(hizbId)) {
      return {
        notFound: true,
      };
    }

    try {
      // Validate locale against Language enum; use Language.EN if invalid
      const validLocale = Object.values(Language).includes(locale as Language)
        ? (locale as Language)
        : Language.EN;
      const quranReaderStyles = getQuranReaderStylesInitialState(validLocale);
      const { mushaf } = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines);

      // Get pages lookup to determine the range of verses in the hizb
      const pagesLookup = await getPagesLookup({ mushaf, hizbNumber: Number(hizbId) });

      const numberOfVerses = generateVerseKeysBetweenTwoVerseKeys(
        chaptersData,
        pagesLookup.lookupRange.from,
        pagesLookup.lookupRange.to,
      ).length;
      const firstPageOfHizb = Object.keys(pagesLookup.pages)[0];
      const firstPageOfHizbLookup = pagesLookup.pages[firstPageOfHizb];

      const hizbVerses = await getHizbVerses(hizbId, locale, {
        ...getDefaultWordFields(quranReaderStyles.quranFont),
        mushaf,
        perPage: 'all',
        from: firstPageOfHizbLookup.from,
        to: firstPageOfHizbLookup.to,
      });
      hizbVerses.pagesLookup = pagesLookup;
      hizbVerses.metaData = {
        ...(hizbVerses.metaData || {}),
        numberOfVerses,
        from: pagesLookup.lookupRange.from,
        to: pagesLookup.lookupRange.to,
      };

      return {
        props: {
          hizbVerses,
          chaptersData,
        },
      };
    } catch (error) {
      return {
        notFound: true,
      };
    }
  },
);

export default HizbPage;
