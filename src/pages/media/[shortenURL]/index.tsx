import { GetServerSideProps } from 'next';

import { getFullUrlById } from '@/utils/auth/api';

const ShortenURL = () => {};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { shortenURL } = context.query;

  if (shortenURL) {
    const response = await getFullUrlById(shortenURL as string);
    if (response.url) {
      return {
        redirect: {
          destination: response.url,
          permanent: false,
        },
      };
    }
  }

  return {
    redirect: {
      destination: '/media',
      permanent: false,
    },
  };
};

export default ShortenURL;
