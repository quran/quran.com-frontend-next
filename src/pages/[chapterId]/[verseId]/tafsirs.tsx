import Error from 'next/error';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { isValidChapterId, isValidVerseId } from 'src/utils/validator';
import { getChapter, getChapterVerses } from 'src/api';
import { ChapterResponse, VersesResponse } from 'types/APIResponses';
import NextSeoHead from 'src/components/NextSeoHead';
import { DEFAULT_TAFSIRS } from 'src/redux/slices/QuranReader/tafsirs';
import QuranReader from 'src/components/QuranReader';
import { QuranReaderDataType } from 'src/components/QuranReader/types';
import {
  REVALIDATION_PERIOD_ON_ERROR_SECONDS,
  ONE_WEEK_REVALIDATION_PERIOD_SECONDS,
} from 'src/utils/staticPageGeneration';

type AyahTafsirProp = {
  chapter?: ChapterResponse;
  verses?: VersesResponse;
  hasError?: boolean;
};

const AyahTafsir: NextPage<AyahTafsirProp> = ({ hasError, chapter, verses }) => {
  const {
    query: { verseId },
  } = useRouter();
  if (hasError) {
    return <Error statusCode={500} />;
  }
  return (
    <>
      <NextSeoHead title={`Tafsir Surah ${chapter.chapter.nameSimple} - ${verseId}`} />
      <QuranReader
        initialData={verses}
        id={chapter.chapter.id}
        quranReaderDataType={QuranReaderDataType.Tafsir}
      />
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const chapterId = String(params.chapterId);
  const verseId = String(params.verseId);
  // we need to validate the chapterId and verseId first to save calling BE since we haven't set the valid paths inside getStaticPaths to avoid pre-rendering them at build time.
  if (!isValidChapterId(chapterId) || !isValidVerseId(chapterId, verseId)) {
    return {
      notFound: true,
    };
  }

  const [chapterResponse, versesResponse] = await Promise.all([
    getChapter(chapterId, locale),
    getChapterVerses(chapterId, {
      page: verseId, // we pass the verse id as a the page and then fetch only 1 verse per page.
      perPage: 1, // only 1 verse per page
      translations: null,
      tafsirs: DEFAULT_TAFSIRS,
      wordFields: 'location, verse_key, text_uthmani',
      tafsirFields: 'resource_name',
    }),
  ]);
  // if the chapter or verses APIs failed
  if (chapterResponse.status === 500 || versesResponse.status === 500) {
    return {
      props: {
        hasError: true,
      },
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS, // 35 seconds will be enough time before we re-try generating the page again.
    };
  }
  return {
    props: {
      chapter: chapterResponse,
      verses: versesResponse,
    },
    revalidate: ONE_WEEK_REVALIDATION_PERIOD_SECONDS, // verses will be generated at runtime if not found in the cache, then cached for subsequent requests for 7 days.
  };
};
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [], // no pre-rendered chapters at build time.
  fallback: 'blocking', // will server-render pages on-demand if the path doesn't exist.
});

export default AyahTafsir;
