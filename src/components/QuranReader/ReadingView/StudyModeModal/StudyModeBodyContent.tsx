import { useSelector, shallowEqual } from 'react-redux';

import TopActions from '../../TranslationView/TopActions';
import TranslationText from '../../TranslationView/TranslationText';

import styles from './StudyModeBody.module.scss';
import StudyModeVerseText from './StudyModeVerseText';
import WordNavigationBox from './WordNavigationBox';

import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import Translation from '@/types/Translation';
import Verse from '@/types/Verse';
import Word from '@/types/Word';
import { getVerseWords } from '@/utils/verse';

interface StudyModeBodyContentProps {
  verse: Verse;
  selectedWord?: Word;
  selectedWordLocation?: string;
  showWordBox: boolean;
  onWordClick: (word: Word) => void;
  onWordBoxClose: () => void;
  onNavigatePreviousWord: () => void;
  onNavigateNextWord: () => void;
  canNavigateWordPrev: boolean;
  canNavigateWordNext: boolean;
}

const StudyModeBodyContent: React.FC<StudyModeBodyContentProps> = ({
  verse,
  selectedWord,
  selectedWordLocation,
  showWordBox,
  onWordClick,
  onWordBoxClose,
  onNavigatePreviousWord,
  onNavigateNextWord,
  canNavigateWordPrev,
  canNavigateWordNext,
}) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);

  return (
    <>
      <TopActions verse={verse} shouldUseModalZIndex />
      <div className={styles.arabicVerseContainer}>
        {showWordBox && selectedWord && (
          <WordNavigationBox
            word={selectedWord}
            onPrevious={onNavigatePreviousWord}
            onNext={onNavigateNextWord}
            onClose={onWordBoxClose}
            canNavigatePrev={canNavigateWordPrev}
            canNavigateNext={canNavigateWordNext}
          />
        )}
        <StudyModeVerseText
          words={getVerseWords(verse)}
          highlightedWordLocation={selectedWordLocation}
          onWordClick={onWordClick}
        />
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
    </>
  );
};

export default StudyModeBodyContent;
