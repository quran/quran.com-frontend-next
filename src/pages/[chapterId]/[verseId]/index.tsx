import Error from 'next/error';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { isValidChapterId, isValidVerseId } from 'src/utils/validator';
import { getChapter, getChapterVerses } from 'src/api';
import { ChapterResponse, VersesResponse } from 'types/APIResponses';
import QuranReader from 'src/components/QuranReader';
import { QuranFont, ReadingMode } from 'src/components/QuranReader/types';
import NextSeoHead from 'src/components/NextSeoHead';

type VerseProps = {
  chapterResponse?: ChapterResponse;
  versesResponse?: VersesResponse;
  hasError?: boolean;
};

const Verse: NextPage<VerseProps> = ({ chapterResponse, versesResponse, hasError }) => {
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
        chapter={chapterResponse.chapter}
        readingMode={ReadingMode.VerseMode}
      />
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const chapterId = String(params.chapterId);
  const verseId = String(params.verseId);
  // we need to validate the chapterId and verseId first to save calling BE since we haven't set the valid paths inside getStaticPaths to avoid pre-rendering them at build time.
  if (!isValidChapterId(chapterId) || !isValidVerseId(chapterId, verseId)) {
    return {
      notFound: true,
    };
  }

  const [chapterResponse, versesResponse] = await Promise.all([
    getChapter(chapterId),
    getChapterVerses(chapterId, {
      page: verseId, // we pass the verse id as a the page and then fetch only 1 verse per page.
      perPage: 1, // only 1 verse per page
      wordFields: `verse_key, verse_id, page_number, location, ${QuranFont.QPCHafs}`,
    }),
  ]);

  // if any of the APIs have failed due to internal server error, we will still receive a response but the body will be something like {"status":500,"error":"Internal Server Error"}.
  if (chapterResponse.status === 500 || versesResponse.status === 500) {
    return {
      props: {
        hasError: true,
      },
      revalidate: 35, // 35 seconds will be enough time before we re-try generating the page again.
    };
  }

  return {
    props: {
      chapterResponse,
      versesResponse,
    },
    revalidate: 604800, // verses will be generated at runtime if not found in the cache, then cached for subsequent requests for 7 days.
  };
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [], // no pre-rendered chapters at build time.
  fallback: 'blocking', // will server-render pages on-demand if the path doesn't exist.
});

export default Verse;
