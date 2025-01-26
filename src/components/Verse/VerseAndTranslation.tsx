import PlainVerseText from './PlainVerseText';
import styles from './VerseAndTranslation.module.scss';

import Error from '@/components/Error';
import TranslationText from '@/components/QuranReader/TranslationView/TranslationText';
import Spinner from '@/dls/Spinner/Spinner';
import useVerseAndTranslation from '@/hooks/useVerseAndTranslation';
import { getVerseWords } from '@/utils/verse';

/**
 * Given a verse range
 * - Fetch the verse + translations data
 * - and return it
 *
 * The use case of this component is mainly for Verse and Translation that needs to be fetched on client
 * dynamically (not SSR). For example, for the reflection's feature verse reference
 *
 */
interface Props {
  chapter: number;
  from: number;
  to: number;
}

const VerseAndTranslation: React.FC<Props> = (props) => {
  const { data, error, mutate, translationFontScale } = useVerseAndTranslation(props);

  if (error) return <Error error={error} onRetryClicked={mutate} />;

  if (!data) return <Spinner />;

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
