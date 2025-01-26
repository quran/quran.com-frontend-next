/* eslint-disable unicorn/no-array-reduce */
import { useMemo } from 'react';

import styles from './GroupedVerseAndTranslation.module.scss';
import PlainVerseText from './PlainVerseText';

import Error from '@/components/Error';
import TranslationText from '@/components/QuranReader/TranslationView/TranslationText';
import Spinner from '@/dls/Spinner/Spinner';
import useVerseAndTranslation from '@/hooks/useVerseAndTranslation';
import { getVerseWords } from '@/utils/verse';

interface Props {
  chapter: number;
  from: number;
  to: number;
}

const GroupedVerseAndTranslation: React.FC<Props> = (props) => {
  const { data, error, mutate, translations, translationFontScale } = useVerseAndTranslation(props);

  const allWords = useMemo(() => {
    if (!data?.verses) return [];
    return data.verses.reduce((acc, verse) => {
      return [...acc, ...getVerseWords(verse)];
    }, []);
  }, [data?.verses]);

  const groupedTranslations = useMemo(() => {
    if (!data?.verses) return {};
    return translations.reduce<Record<number, any>>((acc, translationId: number) => {
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
      <div className={styles.arabicSection}>
        <div className={styles.arabicVerseContainer}>
          <PlainVerseText words={allWords} />
        </div>
      </div>

      <div className={styles.translationsSection}>
        {translations.map((translationId: number) => {
          const translationGroup = groupedTranslations[translationId];
          if (!translationGroup?.length) return null;

          const firstTranslation = translationGroup[0];
          return (
            <div key={`translation-${translationId}`} className={styles.translationGroup}>
              <div className={styles.translationContainer}>
                <TranslationText
                  languageId={firstTranslation.languageId}
                  resourceName={firstTranslation.resourceName}
                  translationFontScale={translationFontScale}
                  text={translationGroup
                    .map((t, index) =>
                      data.verses.length > 1
                        ? `${t.text} (${data.verses[index].verseNumber})`
                        : t.text,
                    )
                    .join(' ')}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GroupedVerseAndTranslation;
