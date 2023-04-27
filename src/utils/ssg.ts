/* eslint-disable import/prefer-default-export */
import { GetStaticProps } from 'next';

import { getAllChaptersData } from './chapter';

export const chaptersDataGetStaticProps: GetStaticProps = async ({ locale }) => {
  const allChaptersData = await getAllChaptersData(locale);

  return {
    props: {
      chaptersData: allChaptersData,
    },
  };
};
