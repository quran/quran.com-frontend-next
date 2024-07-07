import { Mushaf } from '@/types/QuranReader';

const getPageVersesParams = (mushafId: Mushaf, wordFields: { wordFields: string }) => {
  return {
    perPage: 'all',
    mushaf: mushafId,
    filterPageWords: true,
    ...wordFields,
  };
};

export default getPageVersesParams;
