import Verse from 'types/Verse';

const getSampleVerse = async (): Promise<Verse> => {
  // @ts-ignore
  return import('@/utils/sample-verse.json').then((data) => data.default as Verse);
};

export default getSampleVerse;
