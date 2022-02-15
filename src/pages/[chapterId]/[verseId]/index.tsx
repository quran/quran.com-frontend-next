/* eslint-disable react-func/max-lines-per-function */
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import { getChapterIdBySlug, getChapterVerses } from 'src/api';
import NextSeoWrapper from 'src/components/NextSeoWrapper';
import QuranReader from 'src/components/QuranReader';
import Error from 'src/pages/_error';
import { getQuranReaderStylesInitialState } from 'src/redux/defaultSettings/util';
import { getDefaultWordFields, getMushafId } from 'src/utils/api';
import { getChapterData } from 'src/utils/chapter';
import { getLanguageAlternates, toLocalizedNumber, toLocalizedVersesRange } from 'src/utils/locale';
import { getCanonicalUrl, getVerseNavigationUrl } from 'src/utils/navigation';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from 'src/utils/staticPageGeneration';
import {
  getToAndFromFromRange,
  isValidVerseRange,
  isValidVerseId,
  isValidVerseNumber,
} from 'src/utils/validator';
import { ChapterResponse, VersesResponse } from 'types/ApiResponses';
import MetaData from 'types/MetaData';
import { QuranReaderDataType } from 'types/QuranReader';

type VerseProps = {
  chapterResponse?: ChapterResponse;
  versesResponse?: VersesResponse;
  isVerse?: boolean;
  hasError?: boolean;
};

const Verse: NextPage<VerseProps> = ({ chapterResponse, versesResponse, hasError, isVerse }) => {
  const { t, lang } = useTranslation('common');
  const {
    query: { verseId },
  } = useRouter();
  if (hasError) {
    return <Error statusCode={500} />;
  }
  const path = getVerseNavigationUrl(chapterResponse.chapter.slug, verseId as string);
  return (
    <>
      <NextSeoWrapper
        title={`${t('surah')} ${chapterResponse.chapter.transliteratedName} - ${
          isVerse
            ? toLocalizedNumber(Number(verseId), lang)
            : toLocalizedVersesRange(verseId as string, lang)
        }`}
        canonical={getCanonicalUrl(lang, path)}
        languageAlternates={getLanguageAlternates(path)}
        description={versesResponse.verses[0].textImlaeiSimple}
      />
      <QuranReader
        initialData={versesResponse}
        id={chapterResponse.chapter.id}
        quranReaderDataType={isVerse ? QuranReaderDataType.Verse : QuranReaderDataType.VerseRange}
      />
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  let chapterIdOrSlug = String(params.chapterId);
  const verseIdOrRange = String(params.verseId);
  // 1. make sure the chapter Id/slug is valid using BE since slugs are stored in BE first
  const sluggedChapterId = await getChapterIdBySlug(chapterIdOrSlug, locale);
  if (sluggedChapterId) {
    chapterIdOrSlug = sluggedChapterId;
  }
  // 2. make sure that verse id/range are valid before calling BE to get the verses.
  if (
    !isValidVerseId(chapterIdOrSlug, verseIdOrRange) &&
    !isValidVerseRange(chapterIdOrSlug, verseIdOrRange)
  ) {
    return { notFound: true };
  }
  /*
    Since we already validated the value, if the verseIdOrRange is a number it means we are
    viewing the verse's page otherwise it's a range page.
  */
  const isVerse = isValidVerseNumber(verseIdOrRange);
  const defaultMushafId = getMushafId(
    getQuranReaderStylesInitialState(locale).quranFont,
    getQuranReaderStylesInitialState(locale).mushafLines,
  ).mushaf;
  // common API params between a single verse and range of verses.
  let apiParams = {
    ...getDefaultWordFields(getQuranReaderStylesInitialState(locale).quranFont),
    mushaf: defaultMushafId,
  };
  const metaData = { numberOfVerses: 1 } as MetaData;
  let [from, to] = [null, null];
  if (isVerse) {
    apiParams = { ...apiParams, ...{ page: verseIdOrRange, perPage: 1 } };
  } else {
    const [fromVerseNumber, toVerseNumber] = getToAndFromFromRange(verseIdOrRange);
    [from, to] = getToAndFromFromRange(verseIdOrRange).map((ayah) => `${chapterIdOrSlug}:${ayah}`);
    apiParams = { ...apiParams, ...{ from, to } };
    metaData.from = from;
    metaData.to = to;
    metaData.numberOfVerses = Number(toVerseNumber) - Number(fromVerseNumber) + 1;
  }
  try {
    const versesResponse = await getChapterVerses(chapterIdOrSlug, locale, apiParams);
    // if any of the APIs have failed due to internal server error, we will still receive a response but the body will be something like {"status":500,"error":"Internal Server Error"}.
    const chapterData = getChapterData(chapterIdOrSlug, locale);
    if (!chapterData) {
      return {
        props: {
          hasError: true,
        },
        revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS, // 35 seconds will be enough time before we re-try generating the page again.
      };
    }
    return {
      props: {
        chapterResponse: {
          chapter: { ...chapterData, id: chapterIdOrSlug },
        },
        versesResponse: {
          ...versesResponse,
          metaData,
        },
        isVerse,
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

export default Verse;
