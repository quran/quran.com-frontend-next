/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import React from 'react';

import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { SWRConfig } from 'swr';

import { fetcher } from '@/api';
import NextSeoWrapper from '@/components/NextSeoWrapper';
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
import { isValidVerseKey } from '@/utils/validator';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';
import { ChapterResponse, VerseResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';
import Verse from 'types/Verse';

type AyahReflectionProp = {
  chapter?: ChapterResponse;
  verseNumber?: string;
  chapterId?: string;
  chaptersData: ChaptersData;
  fallback?: Record<string, unknown>;
  verse?: Verse;
};

const ReflectionsPage: NextPage<AyahReflectionProp> = ({
  chapter,
  verseNumber,
  chapterId,
  fallback,
  verse,
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
        />
      </SWRConfig>
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
