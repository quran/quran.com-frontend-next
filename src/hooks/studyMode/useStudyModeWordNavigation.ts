import { useState, useCallback, useMemo } from 'react';

import { useDispatch } from 'react-redux';

import { setHighlightedWordLocation } from '@/redux/slices/QuranReader/studyMode';
import Verse from '@/types/Verse';
import Word, { CharType } from '@/types/Word';

interface UseStudyModeWordNavigationProps {
  verse: Verse | undefined;
}

interface UseStudyModeWordNavigationReturn {
  selectedWordLocation: string | undefined;
  selectedWord: Word | undefined;
  showWordBox: boolean;
  canNavigateWordPrev: boolean;
  canNavigateWordNext: boolean;
  handleWordClick: (word: Word) => void;
  handlePreviousWord: () => void;
  handleNextWord: () => void;
  handleCloseWordBox: () => void;
}

const useStudyModeWordNavigation = ({
  verse,
}: UseStudyModeWordNavigationProps): UseStudyModeWordNavigationReturn => {
  const dispatch = useDispatch();

  const [selectedWordLocation, setSelectedWordLocation] = useState<string | undefined>(undefined);
  const [showWordBox, setShowWordBox] = useState<boolean>(false);

  const quranWords = useMemo(() => {
    if (!verse?.words) return [];
    return verse.words.filter((w) => w.charTypeName === CharType.Word);
  }, [verse?.words]);

  const selectedWord = useMemo(() => {
    if (!selectedWordLocation) return undefined;
    return quranWords.find((w) => w.location === selectedWordLocation);
  }, [quranWords, selectedWordLocation]);

  const currentWordIndex = useMemo(() => {
    if (!selectedWordLocation) return -1;
    return quranWords.findIndex((w) => w.location === selectedWordLocation);
  }, [quranWords, selectedWordLocation]);

  const handleWordClick = useCallback(
    (clickedWord: Word) => {
      setSelectedWordLocation(clickedWord.location);
      setShowWordBox(true);
      dispatch(setHighlightedWordLocation(clickedWord.location));
    },
    [dispatch],
  );

  const handlePreviousWord = useCallback(() => {
    if (currentWordIndex > 0) {
      const newLocation = quranWords[currentWordIndex - 1].location;
      setSelectedWordLocation(newLocation);
      dispatch(setHighlightedWordLocation(newLocation));
    }
  }, [currentWordIndex, quranWords, dispatch]);

  const handleNextWord = useCallback(() => {
    if (currentWordIndex < quranWords.length - 1) {
      const newLocation = quranWords[currentWordIndex + 1].location;
      setSelectedWordLocation(newLocation);
      dispatch(setHighlightedWordLocation(newLocation));
    }
  }, [currentWordIndex, quranWords, dispatch]);

  const handleCloseWordBox = useCallback(() => {
    setShowWordBox(false);
    setSelectedWordLocation(undefined);
    dispatch(setHighlightedWordLocation(null));
  }, [dispatch]);

  const canNavigateWordPrev = currentWordIndex > 0;
  const canNavigateWordNext = currentWordIndex < quranWords.length - 1;

  return {
    selectedWordLocation,
    selectedWord,
    showWordBox,
    canNavigateWordPrev,
    canNavigateWordNext,
    handleWordClick,
    handlePreviousWord,
    handleNextWord,
    handleCloseWordBox,
  };
};

export default useStudyModeWordNavigation;
