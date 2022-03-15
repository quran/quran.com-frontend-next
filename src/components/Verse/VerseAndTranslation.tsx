import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';
import useSWR from 'swr';

import TranslationText from '../QuranReader/TranslationView/TranslationText';

import PlainVerseText from './PlainVerseText';
import styles from './VerseAndTranslation.module.scss';

import { fetcher } from 'src/api';
// import useQcfFont from 'src/hooks/useQcfFont';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { selectSelectedTranslations } from 'src/redux/slices/QuranReader/translations';
import { getDefaultWordFields, getMushafId } from 'src/utils/api';
import { makeVersesUrl } from 'src/utils/apiPaths';
import { areArraysEqual } from 'src/utils/array';
import {
  getChapterNumberFromKey,
  getVerseNumberRangeFromKey,
  getVerseWords,
} from 'src/utils/verse';
import { VersesResponse } from 'types/ApiResponses';

interface Props {
  verseKey: string;
}

const VerseAndTranslation: React.FC<Props> = ({ verseKey }) => {
  const chapter = getChapterNumberFromKey(verseKey);
  const { from, to } = getVerseNumberRangeFromKey(verseKey);

  const { lang } = useTranslation();
  const translations = useSelector(selectSelectedTranslations, areArraysEqual);
  const { quranFont, mushafLines, translationFontScale } = useSelector(
    selectQuranReaderStyles,
    shallowEqual,
  );

  const defaultMushafId = getMushafId(quranFont, mushafLines).mushaf;
  const apiParams = {
    ...getDefaultWordFields(quranFont),
    translationFields: 'resource_name,language_id',
    translations: translations.join(','),
    mushaf: defaultMushafId,
    from: `${chapter}:${from}`,
    to: `${chapter}:${to}`,
  };

  const shouldFetchData = !!from;

  const { data, error } = useSWR<VersesResponse>(
    shouldFetchData ? makeVersesUrl(chapter, lang, apiParams) : null,
    (url) => {
      return fetcher(url);
    },
  );

  // useQcfFont(quranFont, data?.verses ? data.verses : []);

  if (error) return <div>{JSON.stringify(error)}</div>;

  if (!data) return null;

  return (
    <div className={styles.container}>
      {data?.verses.map((verse) => (
        <div key={verse.verseKey} className={styles.verseContainer}>
          <div className={styles.arabicVerseContainer}>
            <PlainVerseText words={getVerseWords(verse)} />
          </div>
          <div className={styles.translationsListContainer}>
            {verse.translations?.map((translation) => (
              <div key={translation.id} className={styles.translationContainer}>
                <TranslationText
                  languageId={translation.languageId}
                  resourceName={translation.resourceName}
                  translationFontScale={translationFontScale}
                  text={translation.text}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VerseAndTranslation;
