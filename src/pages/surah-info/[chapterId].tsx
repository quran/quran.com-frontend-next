import { GetStaticPaths, GetStaticProps, NextPage } from 'next';

import { getSurahInfoNavigationUrl } from 'src/utils/navigation';
import { isValidChapterId } from 'src/utils/validator';

const ChapterInfo: NextPage = () => {
  return <></>;
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const chapterId = String(params.chapterId);
  // we need to validate the chapterId first to save calling BE since we haven't set the valid paths inside getStaticPaths to avoid pre-rendering them at build time.
  if (!isValidChapterId(chapterId)) {
    return {
      notFound: true,
    };
  }
  return {
    redirect: { destination: getSurahInfoNavigationUrl(chapterId), permanent: true },
  };
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [], // no pre-rendered chapters at build time.
  fallback: 'blocking', // will server-render pages on-demand if the path doesn't exist.
});

export default ChapterInfo;
