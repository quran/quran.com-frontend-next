import React, { useMemo } from 'react';

import { shallowEqual, useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import { fetcher } from '@/api';
import Loader from '@/components/QuranReader/Loader';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { VersesResponse } from '@/types/ApiResponses';
import { WordVerse } from '@/types/Word';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { makeVersesUrl } from '@/utils/apiPaths';

type Props = {
  verse: WordVerse;
  lang: string;
  selectedTranslationId: string;
};

const TranslationPreview: React.FC<Props> = ({ verse, lang, selectedTranslationId }) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const shouldFetch = Boolean(selectedTranslationId);

  const { data: verseResponse, isValidating: isLoadingTranslation } =
    useSWRImmutable<VersesResponse>(
      shouldFetch
        ? makeVersesUrl(verse.chapterId, lang, {
            ...getDefaultWordFields(quranReaderStyles.quranFont),
            translationFields: 'resource_name,language_id',
            translations: selectedTranslationId,
            mushaf: getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf,
            from: verse.verseKey,
            to: verse.verseKey,
          })
        : null,
      fetcher,
    );

  const selectedTranslationText = useMemo(() => {
    if (!verseResponse?.verses?.[0]?.translations?.[0]) return '';
    return verseResponse.verses[0].translations[0].text;
  }, [verseResponse]);

  if (!shouldFetch) return null;

  return (
    <div>
      {isLoadingTranslation ? <Loader /> : <span>&quot;{selectedTranslationText}&quot;</span>}
    </div>
  );
};

export default TranslationPreview;
