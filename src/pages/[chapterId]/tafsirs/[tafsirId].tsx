import React from 'react';

import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import Error from 'next/error';

import { getChapterVerses } from 'src/api';
import NextSeoHead from 'src/components/NextSeoHead';
import QuranReader from 'src/components/QuranReader';
import { getChapterData } from 'src/utils/chapter';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from 'src/utils/staticPageGeneration';
import { isValidTafsirId, isValidVerseKey } from 'src/utils/validator';
import { getVerseAndChapterNumbersFromKey } from 'src/utils/verse';
import { ChapterResponse, VersesResponse } from 'types/ApiResponses';
import { QuranReaderDataType } from 'types/QuranReader';

type AyahTafsirProp = {
  chapter?: ChapterResponse;
  verses?: VersesResponse;
  hasError?: boolean;
  verseNumber?: string;
  tafsirId?: string;
};

const SelectedTafsirOfAyah: NextPage<AyahTafsirProp> = ({
  hasError,
  chapter,
  verses,
  verseNumber,
  tafsirId,
}) => {
  if (hasError) {
    return <Error statusCode={500} />;
  }
  return (
    <>
      <NextSeoHead title={`Tafsir Surah ${chapter.chapter.nameSimple} - ${verseNumber}`} />
      <QuranReader
        initialData={verses}
        id={tafsirId}
        quranReaderDataType={QuranReaderDataType.SelectedTafsir}
      />
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const { chapterId, tafsirId } = params;
  const verseKey = String(chapterId);
  // if the verse key or the tafsir id is not valid
  if (!isValidVerseKey(verseKey) || !isValidTafsirId(String(tafsirId))) {
    return { notFound: true };
  }
  const [chapterNumber, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
  try {
    const versesResponse = await getChapterVerses(chapterNumber, {
      page: verseNumber, // we pass the verse id as a the page and then fetch only 1 verse per page.
      perPage: 1, // only 1 verse per page
      translations: null,
      tafsirs: tafsirId,
      wordFields: 'location, verse_key, text_uthmani',
      tafsirFields: 'resource_name',
    });
    return {
      props: {
        chapter: { chapter: getChapterData(chapterNumber, locale) },
        verses: versesResponse,
        verseNumber,
        tafsirId,
      },
      revalidate: ONE_WEEK_REVALIDATION_PERIOD_SECONDS, // verses will be generated at runtime if not found in the cache, then cached for subsequent requests for 7 days.
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

export default SelectedTafsirOfAyah;
