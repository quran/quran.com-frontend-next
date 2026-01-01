import React, { useState, useCallback, useContext, useEffect, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';
import useSWR from 'swr';

import StudyModeBody from './StudyModeBody';
import styles from './StudyModeModal.module.scss';

import SurahAndAyahSelection from '@/components/QuranReader/TafsirView/SurahAndAyahSelection';
import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import ContentModal from '@/dls/ContentModal/ContentModal';
import Spinner from '@/dls/Spinner/Spinner';
import ArrowIcon from '@/icons/arrow.svg';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { makeByVerseKeyUrl } from '@/utils/apiPaths';
import { getChapterNumberFromKey, getVerseNumberFromKey } from '@/utils/verse';
import { fetcher } from 'src/api';
import DataContext from 'src/contexts/DataContext';
import Verse from 'types/Verse';
import Word, { CharType } from 'types/Word';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  word: Word;
  verse?: Verse;
  highlightedWordLocation?: string;
}

interface VerseResponse {
  verse: Verse;
}

const StudyModeModal: React.FC<Props> = ({ isOpen, onClose, word, verse: initialVerse, highlightedWordLocation }) => {
  const { t } = useTranslation('common');
  const chaptersData = useContext(DataContext);
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const selectedTranslations = useSelector(selectSelectedTranslations, shallowEqual);
  const initialChapterId = getChapterNumberFromKey(word.verseKey).toString();
  const initialVerseNumber = getVerseNumberFromKey(word.verseKey).toString();
  const [selectedChapterId, setSelectedChapterId] = useState(initialChapterId);
  const [selectedVerseNumber, setSelectedVerseNumber] = useState(initialVerseNumber);

  // Word navigation state
  const [selectedWordLocation, setSelectedWordLocation] = useState<string | undefined>(
    highlightedWordLocation,
  );
  const [showWordBox, setShowWordBox] = useState<boolean>(!!highlightedWordLocation);

  useEffect(() => {
    let isMounted = true;
    if (isOpen && isMounted) {
      setSelectedChapterId(initialChapterId);
      setSelectedVerseNumber(initialVerseNumber);
      setSelectedWordLocation(highlightedWordLocation);
      setShowWordBox(!!highlightedWordLocation);
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, initialChapterId, initialVerseNumber, highlightedWordLocation]);

  const verseKey = `${selectedChapterId}:${selectedVerseNumber}`;
  const queryKey = isOpen
    ? makeByVerseKeyUrl(verseKey, {
        words: true,
        translationFields: 'resource_name,language_id',
        translations: selectedTranslations.join(','),
        ...getDefaultWordFields(quranReaderStyles.quranFont),
        ...getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines),
        wordTranslationLanguage: 'en',
        wordTransliteration: 'true',
      })
    : null;

  const { data, isValidating } = useSWR<VerseResponse>(queryKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 2000,
  });

  const currentVerse = data?.verse || (verseKey === `${initialChapterId}:${initialVerseNumber}` ? initialVerse : undefined);
  const handleChapterChange = useCallback((newChapterId: string) => {
    setSelectedChapterId(newChapterId);
    setSelectedVerseNumber('1');
  }, []);
  const handleVerseChange = useCallback((newVerseNumber: string) => setSelectedVerseNumber(newVerseNumber), []);
  const handlePreviousVerse = useCallback(() => {
    const currentVerseNum = Number(selectedVerseNumber);
    // Button is disabled when currentVerseNum === 1, so this is always safe
    setSelectedVerseNumber(String(currentVerseNum - 1));
  }, [selectedVerseNumber]);
  const handleNextVerse = useCallback(() => {
    const currentVerseNum = Number(selectedVerseNumber);
    // Button is disabled on last verse, so this is always safe
    setSelectedVerseNumber(String(currentVerseNum + 1));
  }, [selectedVerseNumber]);

  // Disable prev if on first verse of current chapter
  const canNavigatePrev = Number(selectedVerseNumber) > 1;

  // Disable next if on last verse of current chapter
  const currentChapter = chaptersData[Number(selectedChapterId)];
  const canNavigateNext = currentChapter && Number(selectedVerseNumber) < currentChapter.versesCount;

  // Filter only Quranic words (CharType.Word) for word navigation
  const quranWords = useMemo(() => {
    if (!currentVerse?.words) return [];
    return currentVerse.words.filter((w) => w.charTypeName === CharType.Word);
  }, [currentVerse?.words]);

  // Find current selected word
  const selectedWord = useMemo(() => {
    if (!selectedWordLocation) return undefined;
    return quranWords.find((w) => w.location === selectedWordLocation);
  }, [quranWords, selectedWordLocation]);

  // Find current word index for navigation
  const currentWordIndex = useMemo(() => {
    if (!selectedWordLocation) return -1;
    return quranWords.findIndex((w) => w.location === selectedWordLocation);
  }, [quranWords, selectedWordLocation]);

  // Word navigation handlers
  const handleWordClick = useCallback((word: Word) => {
    setSelectedWordLocation(word.location);
    setShowWordBox(true);
  }, []);

  const handlePreviousWord = useCallback(() => {
    if (currentWordIndex > 0) {
      setSelectedWordLocation(quranWords[currentWordIndex - 1].location);
    }
  }, [currentWordIndex, quranWords]);

  const handleNextWord = useCallback(() => {
    if (currentWordIndex < quranWords.length - 1) {
      setSelectedWordLocation(quranWords[currentWordIndex + 1].location);
    }
  }, [currentWordIndex, quranWords]);

  const handleCloseWordBox = useCallback(() => {
    setShowWordBox(false);
    setSelectedWordLocation(undefined);
  }, []);

  const canNavigateWordPrev = currentWordIndex > 0;
  const canNavigateWordNext = currentWordIndex < quranWords.length - 1;

  const header = (
    <div className={styles.header}>
      <div className={styles.selectionWrapper}>
        <SurahAndAyahSelection
          selectedChapterId={selectedChapterId}
          selectedVerseNumber={selectedVerseNumber}
          onChapterIdChange={handleChapterChange}
          onVerseNumberChange={handleVerseChange}
        />
      </div>
      <Button size={ButtonSize.Small} variant={ButtonVariant.Ghost} onClick={handlePreviousVerse}
        className={`${styles.navButton} ${styles.prevButton}`} ariaLabel="Previous verse" isDisabled={!canNavigatePrev}>
        <ArrowIcon />
      </Button>
      <Button size={ButtonSize.Small} variant={ButtonVariant.Ghost} onClick={handleNextVerse}
        className={styles.navButton} ariaLabel="Next verse" isDisabled={!canNavigateNext}>
        <ArrowIcon />
      </Button>
    </div>
  );

  if (!isOpen || !chaptersData) return null;

  const renderContent = () => {
    if (isValidating && !data)
      return (
        <div className={styles.loadingContainer}>
          <Spinner />
        </div>
      );
    if (currentVerse)
      return (
        <StudyModeBody
          verse={currentVerse}
          bookmarksRangeUrl=""
          selectedWord={selectedWord}
          selectedWordLocation={selectedWordLocation}
          showWordBox={showWordBox}
          onWordClick={handleWordClick}
          onWordBoxClose={handleCloseWordBox}
          onNavigatePreviousWord={handlePreviousWord}
          onNavigateNextWord={handleNextWord}
          canNavigateWordPrev={canNavigateWordPrev}
          canNavigateWordNext={canNavigateWordNext}
        />
      );
    return (
      <div className={styles.errorContainer}>
        <p>{t('error:general')}</p>
      </div>
    );
  };

  return (
    <ContentModal
      isOpen={isOpen}
      onClose={onClose}
      onEscapeKeyDown={onClose}
      header={header}
      hasCloseButton
      contentClassName={styles.contentModal}
      innerContentClassName={styles.innerContent}
    >
      {renderContent()}
    </ContentModal>
  );
};

export default StudyModeModal;
