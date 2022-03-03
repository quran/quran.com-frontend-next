/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import React from 'react';

import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import useTranslation from 'next-translate/useTranslation';

import { getChapterIdBySlug, getChapterVerses, getPagesLookup } from 'src/api';
import NextSeoWrapper from 'src/components/NextSeoWrapper';
import QuranReader from 'src/components/QuranReader';
import Error from 'src/pages/_error';
import { getQuranReaderStylesInitialState } from 'src/redux/defaultSettings/util';
import { getDefaultWordFields, getMushafId } from 'src/utils/api';
import { getChapterData } from 'src/utils/chapter';
import { toLocalizedNumber, getLocaleName, getLanguageAlternates } from 'src/utils/locale';
import {
  getCanonicalUrl,
  getSurahNavigationUrl,
  getVerseNavigationUrl,
} from 'src/utils/navigation';
import { formatStringNumber } from 'src/utils/number';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from 'src/utils/staticPageGeneration';
import { isValidChapterId, isValidVerseKey } from 'src/utils/validator';
import { getVerseAndChapterNumbersFromKey } from 'src/utils/verse';
import { generateVerseKeysBetweenTwoVerseKeys } from 'src/utils/verseKeys';
import { ChapterResponse, VersesResponse } from 'types/ApiResponses';
import { QuranReaderDataType } from 'types/QuranReader';

type ChapterProps = {
  chapterResponse?: ChapterResponse;
  versesResponse?: VersesResponse;
  hasError?: boolean;
  isChapter?: boolean;
};

const isAyatulKursi = (chapterId: string, verseNumber: number): boolean =>
  chapterId === '2' && verseNumber === 255;

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
  const getTitle = () => {
    if (isChapter) {
      return `${toLocalizedNumber(1, lang)}-${toLocalizedNumber(
        chapterResponse.chapter.versesCount,
        lang,
      )}`;
    }
    const { verseNumber } = versesResponse.verses[0];
    // if it's Ayatul Kursi
    if (isAyatulKursi(chapterResponse.chapter.id as string, verseNumber)) {
      return t('quran-reader:ayatul-kursi');
    }
    return `${toLocalizedNumber(verseNumber, lang)}`;
  };

  const getPath = () => {
    if (isChapter) {
      return getSurahNavigationUrl(chapterResponse.chapter.slug);
    }
    const { verseNumber } = versesResponse.verses[0];
    // if it's Ayatul Kursi
    if (isAyatulKursi(chapterResponse.chapter.id as string, verseNumber)) {
      return '/ayatul-kursi';
    }
    return getVerseNavigationUrl(chapterResponse.chapter.slug, verseNumber.toString());
  };
  const path = getPath();
  const getCanonicalUrlValue = () => {
    if (isChapter) {
      return getCanonicalUrl(lang, path);
    }
    const { verseNumber } = versesResponse.verses[0];
    // if it's Ayatul Kursi
    if (isAyatulKursi(chapterResponse.chapter.id as string, verseNumber)) {
      return getCanonicalUrl(lang, path);
    }
    return getCanonicalUrl(lang, path);
  };

  return (
    <>
      <NextSeoWrapper
        title={`${t('surah')} ${chapterResponse.chapter.transliteratedName} - ${getTitle()}`}
        canonical={getCanonicalUrlValue()}
        description={
          !isChapter
            ? versesResponse.verses[0].textImlaeiSimple
            : t('chapter:meta-description', {
                transliteratedName: chapterResponse.chapter.transliteratedName,
                translatedName: chapterResponse.chapter.translatedName as string,
                revelationPlace: t(`surah-info:${chapterResponse.chapter.revelationPlace}`),
                chapterOrder: toLocalizedNumber(Number(chapterResponse.chapter.id), lang),
                localeName: getLocaleName(lang),
                versesCount: toLocalizedNumber(chapterResponse.chapter.versesCount, lang),
              })
        }
        languageAlternates={getLanguageAlternates(path)}
      />
      <QuranReader
        initialData={versesResponse}
        id={chapterResponse.chapter.id}
        quranReaderDataType={isChapter ? QuranReaderDataType.Chapter : QuranReaderDataType.Verse}
      />
    </>
  );
};

// TODO: this needs to be localized and also reflected in next-sitemap.js
const AYAH_KURSI_SLUGS = ['ayatul-kursi', 'آیت الکرسی'];

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  let chapterIdOrVerseKeyOrSlug = String(params.chapterId);
  let isChapter = isValidChapterId(chapterIdOrVerseKeyOrSlug);
  // initialize the value as if it's chapter
  let chapterId = chapterIdOrVerseKeyOrSlug;
  // if it's not a valid chapter id and it's not a valid verse key, will check if it's Ayat Al kursi or if it's a Surah slug
  if (!isChapter && !isValidVerseKey(chapterIdOrVerseKeyOrSlug)) {
    // if the value is a slug of Ayatul Kursi
    if (AYAH_KURSI_SLUGS.includes(chapterIdOrVerseKeyOrSlug.toLowerCase())) {
      chapterIdOrVerseKeyOrSlug = '2:255';
    } else {
      const sluggedChapterId = await getChapterIdBySlug(chapterIdOrVerseKeyOrSlug, locale);
      // if it's not a valid slug
      if (!sluggedChapterId) {
        return { notFound: true };
      }
      chapterId = sluggedChapterId;
      isChapter = true;
    }
  }
  const defaultMushafId = getMushafId(
    getQuranReaderStylesInitialState(locale).quranFont,
    getQuranReaderStylesInitialState(locale).mushafLines,
  ).mushaf;
  // common API params between a chapter and the verse key.
  let apiParams = {
    ...getDefaultWordFields(getQuranReaderStylesInitialState(locale).quranFont),
    mushaf: defaultMushafId,
  };
  let numberOfVerses = 1;
  let pagesLookupResponse = null;
  try {
    // if it's a verseKey
    if (!isChapter) {
      const [extractedChapterId, verseNumber] =
        getVerseAndChapterNumbersFromKey(chapterIdOrVerseKeyOrSlug);
      chapterId = extractedChapterId;
      // only get 1 verse
      apiParams = { ...apiParams, ...{ page: verseNumber, perPage: 1 } };
      pagesLookupResponse = await getPagesLookup({
        chapterNumber: Number(chapterId),
        mushaf: defaultMushafId,
        from: chapterIdOrVerseKeyOrSlug,
        to: chapterIdOrVerseKeyOrSlug,
      });
    } else {
      pagesLookupResponse = await getPagesLookup({
        chapterNumber: Number(chapterId),
        mushaf: defaultMushafId,
      });
      numberOfVerses = generateVerseKeysBetweenTwoVerseKeys(
        pagesLookupResponse.lookupRange.from,
        pagesLookupResponse.lookupRange.to,
      ).length;

      const firstPageOfChapter = Object.keys(pagesLookupResponse.pages)[0];
      const firstPageOfChapterLookup = pagesLookupResponse.pages[firstPageOfChapter];
      apiParams = {
        ...apiParams,
        ...{
          perPage: 'all',
          from: firstPageOfChapterLookup.from,
          to: firstPageOfChapterLookup.to,
        },
      };
    }
    const versesResponse = await getChapterVerses(formatStringNumber(chapterId), locale, apiParams);
    const metaData = { numberOfVerses };
    versesResponse.metaData = metaData;
    versesResponse.pagesLookup = pagesLookupResponse;
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
