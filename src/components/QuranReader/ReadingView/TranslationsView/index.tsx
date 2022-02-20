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
  verse: Verse;
  quranReaderStyles: QuranReaderStyles;
};

const TranslationsView: React.FC<Props> = ({ verse, quranReaderStyles }) => {
  return (
    <>
      <div className={styles.arabicVerseContainer}>
        <PlainVerseText words={getVerseWords(verse)} />
      </div>
      <div className={styles.separatorContainer}>
        <Separator />
      </div>
      {verse.translations?.map((translation: Translation) => (
        <div key={translation.id} className={styles.verseTranslationContainer}>
          <TranslationText
            translationFontScale={quranReaderStyles.translationFontScale}
            text={translation.text}
            languageId={translation.languageId}
            resourceName={translation.resourceName}
          />
        </div>
      ))}
    </>
  );
};

export default TranslationsView;
