/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import React from 'react';

import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import useTranslation from 'next-translate/useTranslation';

import { getChapterIdBySlug, getChapterVerses, getPagesLookup, getRangeVerses } from '@/api';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import QuranReader from '@/components/QuranReader';
import { getChapterOgImageUrl } from '@/lib/og';
import { getQuranReaderStylesInitialState } from '@/redux/defaultSettings/util';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { getAllChaptersData, getChapterData } from '@/utils/chapter';
import {
  toLocalizedNumber,
  getLocaleName,
  getLanguageAlternates,
  toLocalizedVerseKey,
} from '@/utils/locale';
import {
  getCanonicalUrl,
  getRangesNavigationUrl,
  getSurahNavigationUrl,
  getVerseNavigationUrl,
} from '@/utils/navigation';
import { formatStringNumber } from '@/utils/number';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from '@/utils/staticPageGeneration';
import { isRangesStringValid, isValidChapterId, isValidVerseKey } from '@/utils/validator';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';
import { parseVerseRange, generateVerseKeysBetweenTwoVerseKeys } from '@/utils/verseKeys';
import Error from 'src/pages/_error';
import { ChapterResponse, VersesResponse, PagesLookUpResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';
import { QuranReaderDataType } from 'types/QuranReader';

type ChapterProps = {
  chapterResponse?: ChapterResponse;
  versesResponse?: VersesResponse;
  hasError?: boolean;
  quranReaderDataType: QuranReaderDataType;
  chaptersData: ChaptersData;
};

const isAyatulKursi = (chapterId: string, verseNumber: number): boolean =>
  chapterId === '2' && verseNumber === 255;

const Chapter: NextPage<ChapterProps> = ({
  chapterResponse,
  versesResponse,
  hasError,
  quranReaderDataType,
}) => {
  const isRange = quranReaderDataType === QuranReaderDataType.Ranges;
  const isChapter = quranReaderDataType === QuranReaderDataType.Chapter;
  const { t, lang } = useTranslation('common');
  if (hasError) {
    return <Error statusCode={500} />;
  }
  const getTitle = () => {
    if (isRange) {
      return `${toLocalizedVerseKey(
        versesResponse.pagesLookup.lookupRange.from,
        lang,
      )}-${toLocalizedVerseKey(versesResponse.pagesLookup.lookupRange.to, lang)}`;
    }
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
    if (isRange) {
      return getRangesNavigationUrl(
        versesResponse.pagesLookup.lookupRange.from,
        versesResponse.pagesLookup.lookupRange.to,
      );
    }
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
    if (isRange) {
      return getCanonicalUrl(lang, path);
    }
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

  const getSEOTitle = () => {
    if (isRange) {
      return getTitle();
    }
    return `${t('surah')} ${chapterResponse.chapter.transliteratedName} - ${getTitle()}`;
  };

  const getOGImage = () => {
    if (isRange) {
      return getChapterOgImageUrl({
        chapterId: versesResponse.verses[0]?.chapterId,
        verseNumber: versesResponse.verses[0]?.verseNumber,
        locale: lang,
      });
    }
    return getChapterOgImageUrl({
      chapterId: chapterResponse.chapter.id,
      verseNumber: !isChapter ? versesResponse.verses[0]?.verseNumber : undefined,
      locale: lang,
    });
  };

  const getDescription = () => {
    if (isRange) {
      return t('chapter:ranges-meta-desc', {
        rangeFrom: toLocalizedVerseKey(versesResponse.pagesLookup.lookupRange.from, lang),
        rangeTo: toLocalizedVerseKey(versesResponse.pagesLookup.lookupRange.to, lang),
      });
    }
    return !isChapter
      ? versesResponse.verses[0].textImlaeiSimple
      : t('chapter:meta-description', {
          transliteratedName: chapterResponse.chapter.transliteratedName,
          translatedName: chapterResponse.chapter.translatedName as string,
          revelationPlace: t(`surah-info:${chapterResponse.chapter.revelationPlace}`),
          chapterOrder: toLocalizedNumber(Number(chapterResponse.chapter.id), lang),
          localeName: getLocaleName(lang),
          versesCount: toLocalizedNumber(chapterResponse.chapter.versesCount, lang),
        });
  };

  return (
    <>
      <NextSeoWrapper
        title={getSEOTitle()}
        canonical={getCanonicalUrlValue()}
        image={getOGImage()}
        imageWidth={1200}
        imageHeight={630}
        description={getDescription()}
        languageAlternates={getLanguageAlternates(path)}
      />
      <QuranReader
        initialData={versesResponse}
        id={isRange ? null : chapterResponse.chapter.id}
        quranReaderDataType={quranReaderDataType}
      />
    </>
  );
};

// TODO: this needs to be localized and also reflected in next-sitemap.js
const AYAH_KURSI_SLUGS = ['ayatul-kursi', 'آیت الکرسی'];

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  let chapterIdOrVerseKeyOrSlug = String(params.chapterId);
  let isValidChapter = isValidChapterId(chapterIdOrVerseKeyOrSlug);
  const chaptersData = await getAllChaptersData(locale);
  const isValidRanges = isRangesStringValid(chaptersData, chapterIdOrVerseKeyOrSlug);
  // initialize the value as if it's chapter
  let chapterId = chapterIdOrVerseKeyOrSlug;
  if (
    !isValidRanges &&
    !isValidChapter &&
    !isValidVerseKey(chaptersData, chapterIdOrVerseKeyOrSlug)
  ) {
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
      isValidChapter = true;
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
  let pagesLookupResponse: PagesLookUpResponse | null = null;
  try {
    // if it's a range of verses e.g. 2:255-2:256
    if (isValidRanges) {
      const [{ verseKey: fromVerseKey }, { verseKey: toVerseKey }] =
        parseVerseRange(chapterIdOrVerseKeyOrSlug);
      pagesLookupResponse = await getPagesLookup({
        mushaf: defaultMushafId,
        from: fromVerseKey,
        to: toVerseKey,
      });
      numberOfVerses = generateVerseKeysBetweenTwoVerseKeys(
        chaptersData,
        pagesLookupResponse.lookupRange.from,
        pagesLookupResponse.lookupRange.to,
      ).length;
      const firstPageOfRange = Object.keys(pagesLookupResponse.pages)[0];
      const firstPageOfChapterLookup = pagesLookupResponse.pages[firstPageOfRange];
      const versesResponse = await getRangeVerses(locale, {
        ...apiParams,
        ...{
          perPage: 'all',
          from: firstPageOfChapterLookup.from,
          to: firstPageOfChapterLookup.to,
        },
      });
      const metaData = { numberOfVerses };

      versesResponse.metaData = metaData;
      versesResponse.pagesLookup = pagesLookupResponse;

      return {
        props: {
          chaptersData,
          versesResponse,
          quranReaderDataType: QuranReaderDataType.Ranges,
        },
        revalidate: ONE_WEEK_REVALIDATION_PERIOD_SECONDS, // chapters will be generated at runtime if not found in the cache, then cached for subsequent requests for 7 days.
      };
    }
    // if it's a verseKey
    if (!isValidChapter) {
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
      // if it's a chapter
      pagesLookupResponse = await getPagesLookup({
        chapterNumber: Number(chapterId),
        mushaf: defaultMushafId,
      });
      numberOfVerses = generateVerseKeysBetweenTwoVerseKeys(
        chaptersData,
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
        chaptersData,
        chapterResponse: { chapter: { ...getChapterData(chaptersData, chapterId), id: chapterId } },
        versesResponse,
        quranReaderDataType: isValidChapter
          ? QuranReaderDataType.Chapter
          : QuranReaderDataType.Verse,
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
