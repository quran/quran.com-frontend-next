/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import React from 'react';

import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { SWRConfig } from 'swr';

import { fetcher, getPagesLookup } from '@/api';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import QuranReader from '@/components/QuranReader';
import { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';
import StudyModeSSRPage from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeSSRPage';
import { getChapterOgImageUrl } from '@/lib/og';
import { logErrorToSentry } from '@/lib/sentry';
import {
  getQuranReaderStylesInitialState,
  getTranslationsInitialState,
} from '@/redux/defaultSettings/util';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { makeByVerseKeyUrl } from '@/utils/apiPaths';
import { getChapterData, getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates, toLocalizedNumber } from '@/utils/locale';
import { getCanonicalUrl, getVerseReflectionNavigationUrl } from '@/utils/navigation';
import {
  getAyahReflections,
  makeAyahReflectionsUrl,
  REFLECTION_POST_TYPE_ID,
} from '@/utils/quranReflect/apiPaths';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from '@/utils/staticPageGeneration';
import { QuranReaderDataType } from '@/types/QuranReader';
import { isValidVerseKey } from '@/utils/validator';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';
import { generateVerseKeysBetweenTwoVerseKeys } from '@/utils/verseKeys';
import { ChapterResponse, VerseResponse, VersesResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';
import Verse from 'types/Verse';

type AyahReflectionProp = {
  chapter?: ChapterResponse;
  verseNumber?: string;
  chapterId?: string;
  chaptersData: ChaptersData;
  fallback?: Record<string, unknown>;
  verse?: Verse;
  versesResponse?: VersesResponse;
};

const ReflectionsPage: NextPage<AyahReflectionProp> = ({
  chapter,
  verseNumber,
  chapterId,
  fallback,
  verse,
  versesResponse,
}) => {
  const { t, lang } = useTranslation('quran-reader');

  const navigationUrl = getVerseReflectionNavigationUrl(`${chapterId}:${verseNumber}`);
  return (
    <>
      <NextSeoWrapper
        title={`${chapter.chapter.transliteratedName} - ${toLocalizedNumber(
          Number(verseNumber),
          lang,
        )} ${t('common:reflections')} `}
        image={getChapterOgImageUrl({
          chapterId,
          verseNumber,
          locale: lang,
        })}
        imageWidth={1200}
        imageHeight={630}
        canonical={getCanonicalUrl(lang, navigationUrl)}
        languageAlternates={getLanguageAlternates(navigationUrl)}
        description={t('reflections-desc', {
          ayahNumber: verseNumber,
          surahName: chapter.chapter.transliteratedName,
        })}
      />
      {/* @ts-ignore */}
      <SWRConfig value={{ fallback }}>
        <StudyModeSSRPage
          initialTab={StudyModeTabId.REFLECTIONS}
          chapterId={chapterId}
          verseNumber={verseNumber}
          verse={verse}
          locale={lang}
        />
      </SWRConfig>

      <QuranReader
        initialData={versesResponse}
        id={chapterId}
        quranReaderDataType={QuranReaderDataType.Chapter}
      />
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const { chapterId } = params;
  const verseKey = String(chapterId);
  const chaptersData = await getAllChaptersData(locale);
  if (!isValidVerseKey(chaptersData, verseKey)) {
    return { notFound: true };
  }
  const [chapterNumber, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
  const { quranFont, mushafLines } = getQuranReaderStylesInitialState(locale);
  const translations = getTranslationsInitialState(locale).selectedTranslations;
  const defaultMushafId = getMushafId(quranFont, mushafLines).mushaf;

  try {
    const verseReflectionUrl = makeAyahReflectionsUrl({
      surahId: chapterNumber,
      ayahNumber: verseNumber,
      locales: [locale],
      postTypeIds: [REFLECTION_POST_TYPE_ID],
    });

    // Fetch verse data for StudyModeBody
    const verseUrl = makeByVerseKeyUrl(verseKey, {
      words: true,
      translationFields: 'resource_name,language_id',
      translations: translations.join(','),
      ...getDefaultWordFields(quranFont),
      ...getMushafId(quranFont, mushafLines),
      wordTranslationLanguage: 'en',
      wordTransliteration: 'true',
    });

    // Fetch pagesLookup for QuranReader background
    const pagesLookupResponse = await getPagesLookup({
      chapterNumber: Number(chapterNumber),
      mushaf: defaultMushafId,
    });

    const numberOfVerses = generateVerseKeysBetweenTwoVerseKeys(
      chaptersData,
      pagesLookupResponse.lookupRange.from,
      pagesLookupResponse.lookupRange.to,
    ).length;

    // Create minimal versesResponse for QuranReader (similar to SurahInfo pattern)
    const versesResponse: VersesResponse = {
      metaData: { numberOfVerses },
      pagesLookup: pagesLookupResponse,
      verses: [],
      pagination: {
        perPage: 10,
        currentPage: 1,
        nextPage: null,
        totalRecords: numberOfVerses,
        totalPages: Math.ceil(numberOfVerses / 10),
      },
    };

    const [verseReflectionsData, verseData] = await Promise.all([
      getAyahReflections(verseReflectionUrl),
      fetcher(verseUrl) as Promise<VerseResponse>,
    ]);

    const fallback = {
      [verseReflectionUrl]: verseReflectionsData,
      [verseUrl]: verseData,
    };

    return {
      props: {
        chaptersData,
        chapterId: chapterNumber,
        chapter: { chapter: getChapterData(chaptersData, chapterNumber) },
        verseNumber,
        fallback,
        verse: verseData.verse,
        versesResponse,
      },
      revalidate: ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
    };
  } catch (error) {
    logErrorToSentry(error, {
      transactionName: 'getStaticProps-ReflectionsPage',
      metadata: {
        chapterIdOrSlug: String(params.chapterId),
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

export default ReflectionsPage;
