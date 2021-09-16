import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Error from 'next/error';
import { useRouter } from 'next/router';

import { getChapterVerses } from 'src/api';
import NextSeoHead from 'src/components/NextSeoHead';
import QuranReader from 'src/components/QuranReader';
import { QuranReaderDataType } from 'src/components/QuranReader/types';
import { getDefaultWordFields } from 'src/utils/api';
import { getChapterData } from 'src/utils/chapter';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from 'src/utils/staticPageGeneration';
import {
  getToAndFromFromRange,
  isValidChapterId,
  isValidVerseRange,
  isValidVerseId,
  isValidVerseNumber,
} from 'src/utils/validator';
import { ChapterResponse, VersesResponse } from 'types/APIResponses';

type VerseProps = {
  chapterResponse?: ChapterResponse;
  versesResponse?: VersesResponse;
  isVerse?: boolean;
  hasError?: boolean;
};

const Verse: NextPage<VerseProps> = ({ chapterResponse, versesResponse, hasError, isVerse }) => {
  const {
    query: { verseId },
  } = useRouter();
  if (hasError) {
    return <Error statusCode={500} />;
  }
  return (
    <>
      <NextSeoHead title={`Surah ${chapterResponse.chapter.nameSimple} - ${verseId}`} />
      <QuranReader
        initialData={versesResponse}
        id={chapterResponse.chapter.id}
        quranReaderDataType={isVerse ? QuranReaderDataType.Verse : QuranReaderDataType.Range}
      />
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const chapterId = String(params.chapterId);
  const verseIdOrRange = String(params.verseId);
  /*
    we need to validate the chapterId and verseId and range first to save
    calling BE since we haven't set the valid paths inside getStaticPaths
    to avoid pre-rendering them at build time.
  */
  if (
    !isValidChapterId(chapterId) ||
    (!isValidVerseId(chapterId, verseIdOrRange) && !isValidVerseRange(chapterId, verseIdOrRange))
  ) {
    return {
      notFound: true,
    };
  }

  /*
    Since we already validated the value, if the verseIdOrRange is a number it means we are
    viewing the verse's page otherwise it's a range page.
  */
  const isVerse = isValidVerseNumber(verseIdOrRange);
  // common API params between a single verse and range of verses.
  let apiParams = {
    ...getDefaultWordFields(),
  };
  let [from, to] = [null, null];
  if (isVerse) {
    apiParams = { ...apiParams, ...{ page: verseIdOrRange, perPage: 1 } };
  } else {
    [from, to] = getToAndFromFromRange(verseIdOrRange);
    apiParams = { ...apiParams, ...{ from, to } };
  }
  const versesResponse = await getChapterVerses(chapterId, apiParams);
  // if any of the APIs have failed due to internal server error, we will still receive a response but the body will be something like {"status":500,"error":"Internal Server Error"}.

  const chapterData = getChapterData(chapterId, locale);

  if (versesResponse.status === 500 || !chapterData) {
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
        chapter: chapterData,
      },
      versesResponse: {
        ...versesResponse,
        ...(!isVerse && {
          // when it's range, attach metaData so that it can be used inside the QuranReader's useSWRInfinite fetcher.
          metaData: {
            from,
            to,
          },
        }),
      },
      isVerse,
    },
    revalidate: ONE_WEEK_REVALIDATION_PERIOD_SECONDS, // verses will be generated at runtime if not found in the cache, then cached for subsequent requests for 7 days.
  };
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [], // no pre-rendered chapters at build time.
  fallback: 'blocking', // will server-render pages on-demand if the path doesn't exist.
});

export default Verse;
