/* eslint-disable unicorn/no-array-reduce */
import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';
import useSWR from 'swr/immutable';

import styles from './GroupedVerseAndTranslation.module.scss';
import PlainVerseText from './PlainVerseText';

import Error from '@/components/Error';
import TranslationText from '@/components/QuranReader/TranslationView/TranslationText';
import Spinner from '@/dls/Spinner/Spinner';
import useQcfFont from '@/hooks/useQcfFont';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { makeVersesUrl } from '@/utils/apiPaths';
import { areArraysEqual } from '@/utils/array';
import { getVerseWords } from '@/utils/verse';
import { fetcher } from 'src/api';
import { VersesResponse } from 'types/ApiResponses';

interface Props {
  chapter: number;
  from: number;
  to: number;
}

const GroupedVerseAndTranslation: React.FC<Props> = ({ chapter, from, to }) => {
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

  // Move useMemo before conditionals
  const allWords = useMemo(() => {
    if (!data?.verses) return [];
    return data.verses.reduce((acc, verse) => {
      return [...acc, ...getVerseWords(verse)];
    }, []);
  }, [data?.verses]);

  // Add memoized grouped translations
  const groupedTranslations = useMemo(() => {
    if (!data?.verses) return {};
    return translations.reduce<Record<number, any>>((acc, translationId: number) => {
      // eslint-disable-next-line unicorn/no-array-reduce
      const texts = data.verses.reduce((textsAcc, verse) => {
        const translation = verse.translations?.find(
          (t) => String(t.resourceId) === String(translationId),
        );
        return translation ? [...textsAcc, translation] : textsAcc;
      }, []);

      return { ...acc, [translationId]: texts };
    }, {});
  }, [data?.verses, translations]);

  if (error) return <Error error={error} onRetryClicked={mutate} />;
  if (!data) return <Spinner />;

  return (
    <div className={styles.container}>
      <PlainVerseText words={allWords} />
      {/* Translations section */}
      {translations.map((translationId: number) => {
        const translationGroup = groupedTranslations[translationId];
        if (!translationGroup?.length) return null;

        const firstTranslation = translationGroup[0];
        return (
          <div key={`translation-${translationId}`}>
            <TranslationText
              languageId={firstTranslation.languageId}
              resourceName={firstTranslation.resourceName}
              translationFontScale={translationFontScale}
              text={translationGroup
                .map((t, index) =>
                  data?.verses?.length > 1
                    ? `${t.text} (${data.verses[index].verseNumber})`
                    : t.text,
                )
                .join(' ')}
            />
          </div>
        );
      })}
    </div>
  );
};

export default GroupedVerseAndTranslation;
