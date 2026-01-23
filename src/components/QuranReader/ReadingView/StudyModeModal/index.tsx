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
import StudyModeSkeleton from './StudyModeSkeleton';

import { fetcher } from '@/api';
import Error from '@/components/Error';
import DataContext from '@/contexts/DataContext';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import ContentModal from '@/dls/ContentModal/ContentModal';
import useQcfFont from '@/hooks/useQcfFont';
import ArrowIcon from '@/icons/arrow.svg';
import CloseIcon from '@/icons/close.svg';
import {
  setActiveTab,
  setHighlightedWordLocation,
  setVerseKey,
} from '@/redux/slices/QuranReader/studyMode';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { selectSelectedTafsirs } from '@/redux/slices/QuranReader/tafsirs';
import { selectSelectedTranslations } from '@/redux/slices/QuranReader/translations';
import Verse from '@/types/Verse';
import Word, { CharType } from '@/types/Word';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { makeByVerseKeyUrl } from '@/utils/apiPaths';
import { makeBookmarksRangeUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick, logValueChange } from '@/utils/eventLogger';
import {
  fakeNavigate,
  getVerseSelectedTafsirNavigationUrl,
  getVerseReflectionNavigationUrl,
  getVerseLessonNavigationUrl,
  getVerseAnswersNavigationUrl,
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
  const { t } = useTranslation('quran-reader');
  const router = useRouter();
  const dispatch = useDispatch();
  const chaptersData = useContext(DataContext);
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const selectedTranslations = useSelector(selectSelectedTranslations, shallowEqual);
  const tafsirs = useSelector(selectSelectedTafsirs, shallowEqual);

  const derivedVerseKey = word?.verseKey ?? verseKeyProp ?? '1:1';
  const initialChapterId = getChapterNumberFromKey(derivedVerseKey).toString();
  const initialVerseNumber = getVerseNumberFromKey(derivedVerseKey).toString();
  const [selectedChapterId, setSelectedChapterId] = useState(initialChapterId);
  const [selectedVerseNumber, setSelectedVerseNumber] = useState(initialVerseNumber);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [activeContentTab, setActiveContentTab] = useState<StudyModeTabId | null>(
    initialActiveTab ?? null,
  );
  const [selectedWordLocation, setSelectedWordLocation] = useState<string | undefined>(
    highlightedWordLocation,
  );
  const [showWordBox, setShowWordBox] = useState<boolean>(!!highlightedWordLocation);

  useEffect(() => {
    let isMounted = true;
    if (isOpen && isMounted) {
      const currentVerseKey = word?.verseKey ?? verseKeyProp ?? '1:1';
      setSelectedChapterId(getChapterNumberFromKey(currentVerseKey).toString());
      setSelectedVerseNumber(getVerseNumberFromKey(currentVerseKey).toString());
      setSelectedWordLocation(highlightedWordLocation);
      setShowWordBox(!!highlightedWordLocation);
      setOriginalUrl(router.asPath);
      setActiveContentTab(initialActiveTab ?? null);
      dispatch(setVerseKey(currentVerseKey));
      dispatch(setActiveTab(initialActiveTab ?? null));
      dispatch(setHighlightedWordLocation(highlightedWordLocation ?? null));
    }
    return () => {
      isMounted = false;
    };
  }, [
    isOpen,
    word?.verseKey,
    verseKeyProp,
    highlightedWordLocation,
    router.asPath,
    initialActiveTab,
    dispatch,
  ]);

  // Helper function to update URL based on active tab
  const updateUrlForActiveTab = useCallback(
    (chapterId: string, verseNumber: string, tab: StudyModeTabId | null) => {
      if (!tab) return;

      const newVerseKey = `${chapterId}:${verseNumber}`;

      if (tab === StudyModeTabId.TAFSIR && tafsirs.length > 0) {
        fakeNavigate(
          getVerseSelectedTafsirNavigationUrl(chapterId, Number(verseNumber), tafsirs[0]),
          router.locale || 'en',
        );
      } else if (tab === StudyModeTabId.REFLECTIONS) {
        fakeNavigate(getVerseReflectionNavigationUrl(newVerseKey), router.locale || 'en');
      } else if (tab === StudyModeTabId.LESSONS) {
        fakeNavigate(getVerseLessonNavigationUrl(newVerseKey), router.locale || 'en');
      }
    },
    [tafsirs, router.locale],
  );

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

  const { data, isValidating, error, mutate } = useSWR<VerseResponse>(queryKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 2000,
  });

  const rawVerse =
    data?.verse ||
    (verseKey === `${initialChapterId}:${initialVerseNumber}` ? initialVerse : undefined);

  // Ensure chapterId is set on the verse (required for bookmarking)
  const currentVerse = useMemo(() => {
    if (!rawVerse) return undefined;
    return {
      ...rawVerse,
      chapterId: rawVerse.chapterId ?? Number(selectedChapterId),
    };
  }, [rawVerse, selectedChapterId]);

  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;
  const bookmarksRangeUrl = isLoggedIn()
    ? makeBookmarksRangeUrl(mushafId, Number(selectedChapterId), Number(selectedVerseNumber), 1)
    : '';

  const versesForFont = useMemo(() => (currentVerse ? [currentVerse] : []), [currentVerse]);
  useQcfFont(quranReaderStyles.quranFont, versesForFont);

  const handleChapterChange = useCallback(
    (newChapterId: string) => {
      setSelectedChapterId(newChapterId);
      setSelectedVerseNumber('1');
      dispatch(setVerseKey(`${newChapterId}:1`));
      updateUrlForActiveTab(newChapterId, '1', activeContentTab);
    },
    [dispatch, activeContentTab, updateUrlForActiveTab],
  );

  const handleVerseChange = useCallback(
    (newVerseNumber: string) => {
      setSelectedVerseNumber(newVerseNumber);
      dispatch(setVerseKey(`${selectedChapterId}:${newVerseNumber}`));
      updateUrlForActiveTab(selectedChapterId, newVerseNumber, activeContentTab);
    },
    [dispatch, selectedChapterId, activeContentTab, updateUrlForActiveTab],
  );

  const handlePreviousVerse = useCallback(() => {
    const currentVerseNum = Number(selectedVerseNumber);
    const newVerseNumber = String(currentVerseNum - 1);
    const newVerseKey = `${selectedChapterId}:${newVerseNumber}`;
    logButtonClick('study_mode_previous_verse', { verseKey: newVerseKey });
    setSelectedVerseNumber(newVerseNumber);
    dispatch(setVerseKey(newVerseKey));
    updateUrlForActiveTab(selectedChapterId, newVerseNumber, activeContentTab);
  }, [selectedVerseNumber, selectedChapterId, dispatch, activeContentTab, updateUrlForActiveTab]);

  const handleNextVerse = useCallback(() => {
    const currentVerseNum = Number(selectedVerseNumber);
    const newVerseNumber = String(currentVerseNum + 1);
    const newVerseKey = `${selectedChapterId}:${newVerseNumber}`;
    logButtonClick('study_mode_next_verse', { verseKey: newVerseKey });
    setSelectedVerseNumber(newVerseNumber);
    dispatch(setVerseKey(newVerseKey));
    updateUrlForActiveTab(selectedChapterId, newVerseNumber, activeContentTab);
  }, [selectedVerseNumber, selectedChapterId, dispatch, activeContentTab, updateUrlForActiveTab]);

  const canNavigatePrev = Number(selectedVerseNumber) > 1;
  const currentChapter = chaptersData[Number(selectedChapterId)];
  const canNavigateNext =
    currentChapter && Number(selectedVerseNumber) < currentChapter.versesCount;

  const quranWords = useMemo(() => {
    if (!currentVerse?.words) return [];
    return currentVerse.words.filter((w) => w.charTypeName === CharType.Word);
  }, [currentVerse?.words]);

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
      logButtonClick('study_mode_word', { wordLocation: clickedWord.location });
      setSelectedWordLocation(clickedWord.location);
      setShowWordBox(true);
      dispatch(setHighlightedWordLocation(clickedWord.location));
    },
    [dispatch],
  );

  const handlePreviousWord = useCallback(() => {
    if (currentWordIndex > 0) {
      const newLocation = quranWords[currentWordIndex - 1].location;
      logButtonClick('study_mode_previous_word', { wordLocation: newLocation });
      setSelectedWordLocation(newLocation);
      dispatch(setHighlightedWordLocation(newLocation));
    }
  }, [currentWordIndex, quranWords, dispatch]);

  const handleNextWord = useCallback(() => {
    if (currentWordIndex < quranWords.length - 1) {
      const newLocation = quranWords[currentWordIndex + 1].location;
      logButtonClick('study_mode_next_word', { wordLocation: newLocation });
      setSelectedWordLocation(newLocation);
      dispatch(setHighlightedWordLocation(newLocation));
    }
  }, [currentWordIndex, quranWords, dispatch]);

  const handleCloseWordBox = useCallback(() => {
    logButtonClick('study_mode_word_box_close');
    setShowWordBox(false);
    setSelectedWordLocation(undefined);
    dispatch(setHighlightedWordLocation(null));
  }, [dispatch]);

  const canNavigateWordPrev = currentWordIndex > 0;
  const canNavigateWordNext = currentWordIndex < quranWords.length - 1;

  const handleTabChange = useCallback(
    (tabId: StudyModeTabId | null) => {
      const currentVerseKey = `${selectedChapterId}:${selectedVerseNumber}`;
      logValueChange('study_mode_tab', activeContentTab, tabId, { verseKey: currentVerseKey });
      setActiveContentTab(tabId);
      dispatch(setActiveTab(tabId));

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
      } else if (tabId === StudyModeTabId.ANSWERS) {
        fakeNavigate(getVerseAnswersNavigationUrl(currentVerseKey), router.locale);
      } else if (tabId === null) {
        fakeNavigate(originalUrl, router.locale);
      }
    },
    [
      selectedChapterId,
      selectedVerseNumber,
      tafsirs,
      router.locale,
      originalUrl,
      dispatch,
      activeContentTab,
    ],
  );

  const handleClose = useCallback(() => {
    logButtonClick('study_mode_close', {
      verseKey: `${selectedChapterId}:${selectedVerseNumber}`,
    });
    if (originalUrl) {
      fakeNavigate(originalUrl, router.locale);
    }
    onClose();
  }, [originalUrl, router.locale, onClose, selectedChapterId, selectedVerseNumber]);

  const isContentTabActive =
    activeContentTab &&
    [
      StudyModeTabId.TAFSIR,
      StudyModeTabId.REFLECTIONS,
      StudyModeTabId.LESSONS,
      StudyModeTabId.ANSWERS,
    ].includes(activeContentTab);

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
        ariaLabel={t('aria.previous-verse')}
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
        ariaLabel={t('aria.next-verse')}
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
        ariaLabel={t('aria.close')}
      >
        <CloseIcon />
      </Button>
    </div>
  );

  if (!isOpen || !chaptersData) return null;

  const handleRetry = () => {
    logButtonClick('study_mode_retry', { verseKey });
    mutate();
  };

  const renderContent = () => {
    if (isValidating && !data) {
      return <StudyModeSkeleton />;
    }
    if (error) {
      return (
        <div className={styles.errorContainer}>
          <Error error={error} onRetryClicked={handleRetry} />
        </div>
      );
    }
    if (currentVerse) {
      return (
        <StudyModeBody
          verse={currentVerse}
          bookmarksRangeUrl={bookmarksRangeUrl}
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
    return <StudyModeSkeleton />;
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
