import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';
import useSWR from 'swr/immutable';

import useQcfFont from '@/hooks/useQcfFont';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { makeVersesUrl } from '@/utils/apiPaths';
import { areArraysEqual } from '@/utils/array';
import { fetcher } from 'src/api';
import { VersesResponse } from 'types/ApiResponses';

interface Props {
  chapter: number;
  from: number;
  to: number;
}

const useVerseAndTranslation = ({ chapter, from, to }: Props) => {
  const { lang } = useTranslation();
  const translations = useSelector(selectSelectedTranslations, areArraysEqual);
  const { quranFont, mushafLines, translationFontScale } = useSelector(
    selectQuranReaderStyles,
    shallowEqual,
  );

  const mushafId = getMushafId(quranFont, mushafLines).mushaf;
  const apiParams = {
    ...getDefaultWordFields(quranFont),
    translationFields: 'resource_name,language_id',
    translations: translations.join(','),
    mushaf: mushafId,
    from: `${chapter}:${from}`,
    to: `${chapter}:${to}`,
  };

  const shouldFetchData = !!from;

  const { data, error, mutate } = useSWR<VersesResponse>(
    shouldFetchData ? makeVersesUrl(chapter, lang, apiParams) : null,
    fetcher,
  );

  useQcfFont(quranFont, data?.verses ? data.verses : []);

  return {
    data,
    error,
    mutate,
    translations,
    translationFontScale,
    quranFont,
  };
};

export default useVerseAndTranslation;
