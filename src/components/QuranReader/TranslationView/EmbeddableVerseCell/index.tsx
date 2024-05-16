import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import styles from './EmbeddableVerseCell.module.scss';

import { fetcher } from '@/api';
import DataFetcher from '@/components/DataFetcher';
import TranslationText from '@/components/QuranReader/TranslationView/TranslationText';
import VerseTextPreview from '@/components/QuranReader/VerseTextPreview';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { VersesResponse } from '@/types/ApiResponses';
import { getMushafId, getDefaultWordFields } from '@/utils/api';
import { makeVersesUrl } from '@/utils/apiPaths';
import { areArraysEqual } from '@/utils/array';

type Props = {
  chapterId: number;
  verseNumber: number;
  fontScale?: number;
};

const EmbeddableVerseCell: React.FC<Props> = ({ chapterId, verseNumber, fontScale }) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const { quranFont, mushafLines } = quranReaderStyles;
  const { mushaf } = getMushafId(quranFont, mushafLines);
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);
  const { lang } = useTranslation();

  const apiParams = {
    words: true,
    perPage: 1,
    translations: selectedTranslations.join(','),
    page: verseNumber,
    ...getDefaultWordFields(quranReaderStyles.quranFont),
    mushaf,
  };
  return (
    <DataFetcher
      // TODO: if we want to make this more optimized, we can use a shared cache with the QuranReader
      queryKey={`embeddable-verse-${chapterId}:${verseNumber}`}
      fetcher={() => fetcher(makeVersesUrl(chapterId.toString(), lang, apiParams))}
      render={(data: VersesResponse) => {
        if (!data) return null;
        const firstVerse = data.verses?.[0];
        return (
          <div className={styles.verseContainer}>
            <VerseTextPreview verses={data.verses} fontScale={fontScale} />

            <div>
              {firstVerse.translations?.map((translation) => {
                return (
                  <TranslationText
                    key={translation.id}
                    translationFontScale={quranReaderStyles.translationFontScale}
                    text={translation.text}
                    languageId={translation.languageId}
                    resourceName={translation.resourceName}
                  />
                );
              })}
            </div>
          </div>
        );
      }}
    />
  );
};

export default EmbeddableVerseCell;
