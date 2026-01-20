/* eslint-disable max-lines */
import React, { useState, useCallback, useContext, useEffect, useMemo } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import useSWR from 'swr';

import SearchableVerseSelector from './SearchableVerseSelector';
import StudyModeBody from './StudyModeBody';
import { StudyModeTabId } from './StudyModeBottomActions';
import styles from './StudyModeModal.module.scss';

import { fetcher } from '@/api';
import DataContext from '@/contexts/DataContext';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import ContentModal from '@/dls/ContentModal/ContentModal';
import Spinner from '@/dls/Spinner/Spinner';
import useQcfFont from '@/hooks/useQcfFont';
import ArrowIcon from '@/icons/arrow.svg';
import CloseIcon from '@/icons/close.svg';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { setActiveTab, setHighlightedWordLocation } from '@/redux/slices/QuranReader/studyMode';
import { selectSelectedTafsirs } from '@/redux/slices/QuranReader/tafsirs';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import Verse from '@/types/Verse';
import Word, { CharType } from '@/types/Word';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { makeByVerseKeyUrl } from '@/utils/apiPaths';
import {
  fakeNavigate,
  getVerseSelectedTafsirNavigationUrl,
  getVerseReflectionNavigationUrl,
  getVerseLessonNavigationUrl,
} from '@/utils/navigation';
import { getChapterNumberFromKey, getVerseNumberFromKey } from '@/utils/verse';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  word?: Word;
  verseKey?: string;
  verse?: Verse;
  highlightedWordLocation?: string;
  initialActiveTab?: StudyModeTabId | null;
}

interface VerseResponse {
  verse: Verse;
}

const StudyModeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  word,
  verseKey: verseKeyProp,
  verse: initialVerse,
  highlightedWordLocation,
  initialActiveTab,
}) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const dispatch = useDispatch();
  const chaptersData = useContext(DataContext);
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const selectedTranslations = useSelector(selectSelectedTranslations, shallowEqual);
  const tafsirs = useSelector(selectSelectedTafsirs, shallowEqual);

  // Derive verseKey from word if provided, otherwise use direct verseKey prop
  const derivedVerseKey = word?.verseKey ?? verseKeyProp ?? '1:1';
  const initialChapterId = getChapterNumberFromKey(derivedVerseKey).toString();
  const initialVerseNumber = getVerseNumberFromKey(derivedVerseKey).toString();
  const [selectedChapterId, setSelectedChapterId] = useState(initialChapterId);
  const [selectedVerseNumber, setSelectedVerseNumber] = useState(initialVerseNumber);

  // URL navigation state
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [activeContentTab, setActiveContentTab] = useState<StudyModeTabId | null>(
    initialActiveTab ?? null,
  );

  // Word navigation state
  const [selectedWordLocation, setSelectedWordLocation] = useState<string | undefined>(
    highlightedWordLocation,
  );
  const [showWordBox, setShowWordBox] = useState<boolean>(!!highlightedWordLocation);

  // Save original URL when modal opens
  useEffect(() => {
    let isMounted = true;
    if (isOpen && isMounted) {
      // Re-derive from props when modal opens to ensure correct initial state
      const currentVerseKey = word?.verseKey ?? verseKeyProp ?? '1:1';
      setSelectedChapterId(getChapterNumberFromKey(currentVerseKey).toString());
      setSelectedVerseNumber(getVerseNumberFromKey(currentVerseKey).toString());
      setSelectedWordLocation(highlightedWordLocation);
      setShowWordBox(!!highlightedWordLocation);
      setOriginalUrl(router.asPath);
      setActiveContentTab(initialActiveTab ?? null);
      // Sync initial state to Redux for preservation when opening secondary modals
      dispatch(setActiveTab(initialActiveTab ?? null));
      dispatch(setHighlightedWordLocation(highlightedWordLocation ?? null));
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, word?.verseKey, verseKeyProp, highlightedWordLocation, router.asPath, initialActiveTab, dispatch]);

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

  const currentVerse =
    data?.verse ||
    (verseKey === `${initialChapterId}:${initialVerseNumber}` ? initialVerse : undefined);

  // Load QCF fonts for the current verse when it changes (e.g., when switching chapters)
  const versesForFont = useMemo(
    () => (currentVerse ? [currentVerse] : []),
    [currentVerse],
  );
  useQcfFont(quranReaderStyles.quranFont, versesForFont);
  const handleChapterChange = useCallback((newChapterId: string) => {
    setSelectedChapterId(newChapterId);
    setSelectedVerseNumber('1');
  }, []);
  const handleVerseChange = useCallback(
    (newVerseNumber: string) => setSelectedVerseNumber(newVerseNumber),
    [],
  );
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
  const canNavigateNext =
    currentChapter && Number(selectedVerseNumber) < currentChapter.versesCount;

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
  const handleWordClick = useCallback(
    (clickedWord: Word) => {
      setSelectedWordLocation(clickedWord.location);
      setShowWordBox(true);
      // Sync to Redux for state preservation
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

  // Handle tab change with URL updates
  const handleTabChange = useCallback(
    (tabId: StudyModeTabId | null) => {
      setActiveContentTab(tabId);
      // Sync to Redux for state preservation when opening secondary modals
      dispatch(setActiveTab(tabId));
      const currentVerseKey = `${selectedChapterId}:${selectedVerseNumber}`;

      if (tabId === StudyModeTabId.TAFSIR && tafsirs.length > 0) {
        fakeNavigate(
          getVerseSelectedTafsirNavigationUrl(
            selectedChapterId,
            Number(selectedVerseNumber),
            tafsirs[0],
          ),
          router.locale,
        );
      } else if (tabId === StudyModeTabId.REFLECTIONS) {
        fakeNavigate(getVerseReflectionNavigationUrl(currentVerseKey), router.locale);
      } else if (tabId === StudyModeTabId.LESSONS) {
        fakeNavigate(getVerseLessonNavigationUrl(currentVerseKey), router.locale);
      } else if (tabId === null) {
        fakeNavigate(originalUrl, router.locale);
      }
    },
    [selectedChapterId, selectedVerseNumber, tafsirs, router.locale, originalUrl, dispatch],
  );

  // Handle modal close with URL restoration
  const handleClose = useCallback(() => {
    if (originalUrl) {
      fakeNavigate(originalUrl, router.locale);
    }
    onClose();
  }, [originalUrl, router.locale, onClose]);

  // Check if a content tab is active for bottom sheet styling
  const isContentTabActive =
    activeContentTab &&
    [StudyModeTabId.TAFSIR, StudyModeTabId.REFLECTIONS, StudyModeTabId.LESSONS].includes(
      activeContentTab,
    );

  const header = (
    <div className={styles.header}>
      <div className={styles.selectionWrapper}>
        <SearchableVerseSelector
          selectedChapterId={selectedChapterId}
          selectedVerseNumber={selectedVerseNumber}
          onChapterChange={handleChapterChange}
          onVerseChange={handleVerseChange}
        />
      </div>
      <Button
        size={ButtonSize.Small}
        variant={ButtonVariant.Ghost}
        onClick={handlePreviousVerse}
        className={classNames(styles.navButton, styles.prevButton)}
        ariaLabel="Previous verse"
        isDisabled={!canNavigatePrev}
        shouldFlipOnRTL={false}
      >
        <ArrowIcon />
      </Button>
      <Button
        size={ButtonSize.Small}
        variant={ButtonVariant.Ghost}
        onClick={handleNextVerse}
        className={classNames(styles.navButton, styles.nextButton)}
        ariaLabel="Next verse"
        isDisabled={!canNavigateNext}
        shouldFlipOnRTL={false}
      >
        <ArrowIcon />
      </Button>
      <Button
        variant={ButtonVariant.Ghost}
        shape={ButtonShape.Circle}
        onClick={handleClose}
        className={styles.closeButton}
        ariaLabel="Close"
      >
        <CloseIcon />
      </Button>
    </div>
  );

  if (!isOpen || !chaptersData) return null;

  const renderContent = () => {
    if (isValidating && !data) {
      return (
        <div className={styles.loadingContainer}>
          <Spinner />
        </div>
      );
    }
    if (currentVerse) {
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
          selectedChapterId={selectedChapterId}
          selectedVerseNumber={selectedVerseNumber}
          activeTab={activeContentTab}
          onTabChange={handleTabChange}
        />
      );
    }
    return (
      <div className={styles.errorContainer}>
        <p>{t('error:general')}</p>
      </div>
    );
  };

  return (
    <ContentModal
      isOpen={isOpen}
      onClose={handleClose}
      onEscapeKeyDown={handleClose}
      header={header}
      headerClassName={styles.modalHeader}
      hasCloseButton={false}
      contentClassName={classNames(styles.contentModal, {
        [styles.bottomSheetContent]: isContentTabActive,
      })}
      overlayClassName={classNames(styles.mobileBottomSheetOverlay, {
        [styles.bottomSheetOverlay]: isContentTabActive,
      })}
      innerContentClassName={classNames(styles.innerContent, {
        [styles.bottomSheetInnerContent]: isContentTabActive,
      })}
    >
      {renderContent()}
    </ContentModal>
  );
};

export default StudyModeModal;
