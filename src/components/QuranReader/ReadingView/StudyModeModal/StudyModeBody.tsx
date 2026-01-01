import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import getTranslationsLabelString from '../utils/translation';

import styles from './StudyModeBody.module.scss';
import StudyModeBottomActions, { StudyModeTabId } from './StudyModeBottomActions';
import StudyModeVerseText from './StudyModeVerseText';
import WordNavigationBox from './WordNavigationBox';

import TopActions from '@/components/QuranReader/TranslationView/TopActions';
import TranslationText from '@/components/QuranReader/TranslationView/TranslationText';
import BookIcon from '@/icons/book-open.svg';
import BxBookIcon from '@/icons/bx-book.svg';
import ChatIcon from '@/icons/chat.svg';
import DeviceHubIcon from '@/icons/device-hub.svg';
import DifferenceIcon from '@/icons/difference.svg';
import LightbulbIcon from '@/icons/lightbulb.svg';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { constructWordVerse, getVerseWords } from '@/utils/verse';
import Translation from 'types/Translation';
import Verse from 'types/Verse';
import Word from 'types/Word';

interface StudyModeBodyProps {
  verse: Verse;
  bookmarksRangeUrl?: string;
  hasNotes?: boolean;
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

const StudyModeBody: React.FC<StudyModeBodyProps> = ({
  verse,
  bookmarksRangeUrl = '',
  hasNotes = false,
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
  const { t } = useTranslation('common');
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const translationsLabel = getTranslationsLabelString(verse.translations);
  const translationsCount = verse.translations?.length || 0;

  // Placeholder tabs - no functionality for now, just UI
  const tabs = [
    {
      id: StudyModeTabId.TAFSIR,
      label: t('tafsir'),
      icon: <BookIcon />,
      onClick: () => {
        // No functionality yet
      },
      condition: true,
    },
    {
      id: StudyModeTabId.REFLECTIONS,
      label: t('reflections'),
      icon: <LightbulbIcon />,
      onClick: () => {
        // No functionality yet
      },
      condition: true,
    },
    {
      id: StudyModeTabId.ANSWERS,
      label: t('answers'),
      icon: <ChatIcon />,
      onClick: () => {
        // No functionality yet
      },
      condition: true,
    },
    {
      id: StudyModeTabId.HADITH,
      label: t('hadith'),
      icon: <BxBookIcon />,
      onClick: () => {
        // No functionality yet
      },
      condition: true,
    },
    {
      id: StudyModeTabId.QIRAAT,
      label: t('qiraat'),
      icon: <DeviceHubIcon />,
      onClick: () => {
        // No functionality yet
      },
      condition: true,
    },
    {
      id: StudyModeTabId.RELATED_VERSES,
      label: t('related-verses'),
      icon: <DifferenceIcon />,
      onClick: () => {
        // No functionality yet
      },
      condition: true,
    },
  ];

  // Ensure verse has chapterId (extract from verseKey if needed)
  const verseWithChapterId = {
    ...verse,
    chapterId: verse.chapterId || verse.verseKey?.split(':')[0],
  };

  const wordVerse = constructWordVerse(verseWithChapterId, translationsLabel, translationsCount);

  return (
    <div className={styles.container}>
      <TopActions verse={wordVerse} bookmarksRangeUrl={bookmarksRangeUrl} hasNotes={hasNotes} />
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
      <StudyModeBottomActions tabs={tabs} />
    </div>
  );
};

export default StudyModeBody;
