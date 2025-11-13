import React, { useMemo } from 'react';

import { shallowEqual, useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import { fetcher } from '@/api';
import Loader from '@/components/QuranReader/Loader';
import TranslationText from '@/components/QuranReader/TranslationView/TranslationText';
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

  const translation = useMemo(() => {
    const selectedTranslation = verseResponse?.verses?.[0]?.translations?.[0];
    if (!selectedTranslation) return { languageId: undefined, text: '' };
    return { languageId: selectedTranslation.languageId, text: selectedTranslation.text };
  }, [verseResponse]);

  if (!shouldFetch) return null;

  return (
    <div>
      {isLoadingTranslation ? (
        <Loader />
      ) : (
        <TranslationText
          text={`"${translation.text}"`}
          languageId={translation.languageId}
          translationFontScale={quranReaderStyles.translationFontScale}
        />
      )}
    </div>
  );
};

export default TranslationPreview;
