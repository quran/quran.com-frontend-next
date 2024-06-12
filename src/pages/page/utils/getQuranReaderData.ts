import { VersesResponse } from '@/types/ApiResponses';
import LookupRange from '@/types/LookupRange';

const getQuranReaderData = (pagesLookupData: LookupRange, pageVersesData: VersesResponse) => {
  return {
    ...pageVersesData,
    pageVerses: { pagesLookup: pagesLookupData },
    metaData: { numberOfVerses: pageVersesData.verses.length },
  };
};

export default getQuranReaderData;
