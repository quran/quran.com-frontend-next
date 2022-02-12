import React from 'react';

import styles from './TranslationsView.module.scss';

import Separator from 'src/components/dls/Separator/Separator';
import TranslationText from 'src/components/QuranReader/TranslationView/TranslationText';
import PlainVerseText from 'src/components/Verse/PlainVerseText';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { getVerseWords } from 'src/utils/verse';
import Translation from 'types/Translation';
import Verse from 'types/Verse';

type Props = {
  verses: Verse[];
  quranReaderStyles: QuranReaderStyles;
};

const TranslationsView: React.FC<Props> = ({ verses, quranReaderStyles }) => {
  const words = Object.values(verses)
    .map((responseVerse) => getVerseWords(responseVerse))
    .flat();
  return (
    <>
      <div className={styles.arabicVerseContainer}>
        <PlainVerseText words={words} />
      </div>
      <div className={styles.separatorContainer}>
        <Separator />
      </div>
      {verses.map((responseVerse) => (
        <div key={responseVerse.verseKey}>
          {responseVerse.translations?.map((translation: Translation) => (
            <div key={translation.id} className={styles.verseTranslationContainer}>
              <TranslationText
                translationFontScale={quranReaderStyles.translationFontScale}
                text={translation.text}
                languageId={translation.languageId}
                resourceName={translation.resourceName}
              />
            </div>
          ))}
        </div>
      ))}
    </>
  );
};

export default TranslationsView;
