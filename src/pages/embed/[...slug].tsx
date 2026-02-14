import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

import { parseVersesParam } from '@/components/AyahWidget/queryParsing';

type RedirectProps = Record<string, never>;

const EmbedRedirect = (): null => null;

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<RedirectProps>> => {
  const slugParam = context.params?.slug;
  const segments = Array.isArray(slugParam) ? slugParam : [];

  if (segments.length < 2) {
    return {
      redirect: {
        destination: '/embed',
        permanent: false,
      },
    };
  }

  const [chapter, versePart] = segments;
  const versesParam = `${chapter}:${versePart}`;

  try {
    parseVersesParam(versesParam);
  } catch (error) {
    return {
      redirect: {
        destination: '/embed',
        permanent: false,
      },
    };
  }

  return {
    redirect: {
      destination: `/embed?verses=${encodeURIComponent(versesParam)}`,
      permanent: false,
    },
  };
};

export default EmbedRedirect;
