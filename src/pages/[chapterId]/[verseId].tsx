import Error from 'next/error';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { isValidChapterId, isValidVerseId } from 'src/utils/validator';
import { getVerseByKey } from 'src/api';
import { VerseResponse } from 'types/APIResponses';
import VerseReader from 'src/components/QuranReader/VerseReader';
import { QuranFont } from 'src/components/QuranReader/types';

type VerseProps = {
  hasError?: boolean;
  verseResponse?: VerseResponse;
};

const Verse: NextPage<VerseProps> = ({ hasError, verseResponse }) => {
  if (hasError) {
    return <Error statusCode={500} />;
  }
  return <VerseReader initialData={verseResponse.verse} />;
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

  const verseResponse = await getVerseByKey(chapterId, verseId, {
    wordFields: `location, ${QuranFont.QPCHafs}`,
  });

  if (verseResponse.status === 500) {
    return {
      props: {
        hasError: true,
      },
      revalidate: 35, // 35 seconds will be enough time before we re-try generating the page again.
    };
  }
  return {
    props: {
      verseResponse,
    },
    revalidate: 604800, // verses will be generated at runtime if not found in the cache, then cached for subsequent requests for 7 days.
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [], // no pre-rendered chapters at build time.
    fallback: 'blocking', // will server-render pages on-demand if the path doesn't exist.
  };
};

export default Verse;
