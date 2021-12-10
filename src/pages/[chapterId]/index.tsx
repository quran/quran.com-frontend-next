/* eslint-disable react-func/max-lines-per-function */
import React from 'react';

import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import useTranslation from 'next-translate/useTranslation';

import { getChapterIdBySlug, getChapterVerses } from 'src/api';
import NextSeoWrapper from 'src/components/NextSeoWrapper';
import QuranReader from 'src/components/QuranReader';
import Error from 'src/pages/_error';
import { getDefaultWordFields, getMushafId } from 'src/utils/api';
import { getChapterData } from 'src/utils/chapter';
import { toLocalizedNumber } from 'src/utils/locale';
import { getCanonicalUrl, getSurahNavigationUrl } from 'src/utils/navigation';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from 'src/utils/staticPageGeneration';
import { isValidChapterId, isValidVerseKey } from 'src/utils/validator';
import { getVerseAndChapterNumbersFromKey } from 'src/utils/verse';
import { ChapterResponse, VersesResponse } from 'types/ApiResponses';
import { QuranReaderDataType } from 'types/QuranReader';

type ChapterProps = {
  chapterResponse?: ChapterResponse;
  versesResponse?: VersesResponse;
  hasError?: boolean;
  isChapter?: boolean;
};

const Chapter: NextPage<ChapterProps> = ({
  chapterResponse,
  versesResponse,
  hasError,
  isChapter,
}) => {
  const { t, lang } = useTranslation('common');
  if (hasError) {
    return <Error statusCode={500} />;
  }
  return (
    <>
      <NextSeoWrapper
        title={`${t('surah')} ${chapterResponse.chapter.transliteratedName} - ${toLocalizedNumber(
          1,
          lang,
        )}-${toLocalizedNumber(chapterResponse.chapter.versesCount, lang)}`}
        canonical={getCanonicalUrl(lang, getSurahNavigationUrl(chapterResponse.chapter.slug))}
      />
      <QuranReader
        initialData={versesResponse}
        id={chapterResponse.chapter.id}
        quranReaderDataType={isChapter ? QuranReaderDataType.Chapter : QuranReaderDataType.Verse}
      />
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const chapterIdOrVerseKeyOrSlug = String(params.chapterId);
  let isChapter = isValidChapterId(chapterIdOrVerseKeyOrSlug);
  // initialize the value as if it's chapter
  let chapterId = chapterIdOrVerseKeyOrSlug;
  // if it's not a valid chapter id and it's not a valid verse key, we reject it.
  if (!isChapter && !isValidVerseKey(chapterIdOrVerseKeyOrSlug)) {
    const sluggedChapterId = await getChapterIdBySlug(chapterIdOrVerseKeyOrSlug, locale);
    // if it's not a valid slug
    if (!sluggedChapterId) {
      return { notFound: true };
    }
    chapterId = sluggedChapterId;
    isChapter = true;
  }
  // common API params between a chapter and the verse key.
  let apiParams = { ...getDefaultWordFields(), ...getMushafId() };
  // if it's a verseKey
  if (!isChapter) {
    const [extractedChapterId, verseNumber] =
      getVerseAndChapterNumbersFromKey(chapterIdOrVerseKeyOrSlug);
    chapterId = extractedChapterId;
    // only get 1 verse
    apiParams = { ...apiParams, ...{ page: verseNumber, perPage: 1 } };
  }
  try {
    const versesResponse = await getChapterVerses(chapterId, locale, apiParams);
    return {
      props: {
        chapterResponse: { chapter: { ...getChapterData(chapterId, locale), id: chapterId } },
        versesResponse,
        isChapter,
      },
      revalidate: ONE_WEEK_REVALIDATION_PERIOD_SECONDS, // chapters will be generated at runtime if not found in the cache, then cached for subsequent requests for 7 days.
    };
  } catch (error) {
    return {
      props: { hasError: true },
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS, // 35 seconds will be enough time before we re-try generating the page again.
    };
  }
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [], // no pre-rendered chapters at build time.
  fallback: 'blocking', // will server-render pages on-demand if the path doesn't exist.
});

export default Chapter;
