import { shallowEqual, useSelector } from 'react-redux';

import { selectQuranFont, selectQuranMushafLines } from '@/redux/slices/QuranReader/styles';
import { Mushaf } from '@/types/QuranReader';
import { getMushafId } from '@/utils/api';

/**
 * Instead of repeating using multiple selectors to get the MushafId
 * in multiple components, we are introducing this hook to keep it DRY.
 *
 * TODO: apply it to everywhere using the mushafId
 *
 * @returns {Mushaf}
 */
const useGetMushaf = (): Mushaf => {
  const quranFont = useSelector(selectQuranFont, shallowEqual);
  const mushafLines = useSelector(selectQuranMushafLines, shallowEqual);
  const { mushaf } = getMushafId(quranFont, mushafLines);
  return mushaf;
};

export default useGetMushaf;
