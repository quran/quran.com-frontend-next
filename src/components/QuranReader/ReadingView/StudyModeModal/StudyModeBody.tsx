import React from 'react';

import { shallowEqual, useSelector } from 'react-redux';

import getTranslationsLabelString from '../utils/translation';
import styles from './StudyModeBody.module.scss';

import TopActions from '@/components/QuranReader/TranslationView/TopActions';
import TranslationText from '@/components/QuranReader/TranslationView/TranslationText';
import PlainVerseText from '@/components/Verse/PlainVerseText';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { constructWordVerse, getVerseWords } from '@/utils/verse';
import Translation from 'types/Translation';
import Verse from 'types/Verse';

interface StudyModeBodyProps {
  verse: Verse;
  bookmarksRangeUrl?: string;
  hasNotes?: boolean;
  highlightedWordLocation?: string;
}

const StudyModeBody: React.FC<StudyModeBodyProps> = ({
  verse,
  bookmarksRangeUrl = '',
  hasNotes = false,
  highlightedWordLocation,
}) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const translationsLabel = getTranslationsLabelString(verse.translations);
  const translationsCount = verse.translations?.length || 0;
  const wordVerse = constructWordVerse(verse, translationsLabel, translationsCount);

  return (
    <div className={styles.container}>
      <TopActions verse={wordVerse} bookmarksRangeUrl={bookmarksRangeUrl} hasNotes={hasNotes} />
      <div className={styles.arabicVerseContainer}>
        <PlainVerseText words={getVerseWords(verse)} highlightedWordLocation={highlightedWordLocation} />
      </div>
      <div className={styles.translationsContainer}>
        {verse.translations?.map((translation: Translation) => (
          <div key={translation.id} className={styles.translationContainer}>
            <TranslationText
              translationFontScale={quranReaderStyles.translationFontScale}
              text={translation.text}
              languageId={translation.languageId}
              resourceName={verse.translations?.length > 1 ? translation.resourceName : null}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyModeBody;
