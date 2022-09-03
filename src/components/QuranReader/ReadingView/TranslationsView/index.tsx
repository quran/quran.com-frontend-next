import React from 'react';

import styles from './TranslationsView.module.scss';

import TranslationText from '@/components/QuranReader/TranslationView/TranslationText';
import PlainVerseText from '@/components/Verse/PlainVerseText';
import Separator from '@/dls/Separator/Separator';
import QuranReaderStyles from '@/redux/types/QuranReaderStyles';
import { getVerseWords } from '@/utils/verse';
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
