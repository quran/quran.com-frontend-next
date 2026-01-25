/* eslint-disable max-lines */
import React, { useState, useCallback, useContext, useMemo, useEffect } from 'react';

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
import { FakeContentClose } from '@/dls/ContentModal/FakeContentModal';
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
import AyahQuestionsResponse from '@/types/QuestionsAndAnswers/AyahQuestionsResponse';
import Verse from '@/types/Verse';
import Word, { CharType } from '@/types/Word';
import { getDefaultWordFields, getMushafId } from '@/utils/api';
import { makeByVerseKeyUrl } from '@/utils/apiPaths';
import { makeBookmarksRangeUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick, logValueChange } from '@/utils/eventLogger';
import {
  fakeNavigateReplace,
  getSurahNavigationUrl,
  getVerseSelectedTafsirNavigationUrl,
  getVerseReflectionNavigationUrl,
  getVerseLessonNavigationUrl,
  getVerseAnswersNavigationUrl,
} from '@/utils/navigation';

interface StudyModeSsrContainerProps {
  initialTab: StudyModeTabId;
  chapterId: string;
  verseNumber: string;
  verse?: Verse;
  tafsirIdOrSlug?: string;
  questionId?: string;
  questionsInitialData?: AyahQuestionsResponse;
}

interface VerseResponse {
  verse: Verse;
}

/**
 * SSR-friendly container for Study Mode pages.
 * Uses isFakeSEOFriendlyMode to render content inline for SEO while maintaining modal UX.
 *
 * @returns {React.ReactNode} The study mode modal container
 */
const StudyModeSsrContainer: React.FC<StudyModeSsrContainerProps> = ({
  initialTab,
  chapterId: initialChapterId,
  verseNumber: initialVerseNumber,
  verse: initialVerse,
  tafsirIdOrSlug,
  questionId,
  questionsInitialData,
}) => {
  const { t } = useTranslation('quran-reader');
  const router = useRouter();
  const dispatch = useDispatch();
  const chaptersData = useContext(DataContext);
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const selectedTranslations = useSelector(selectSelectedTranslations, shallowEqual);
  const tafsirs = useSelector(selectSelectedTafsirs, shallowEqual);

  const safeChapterId = initialChapterId || '1';
  const safeVerseNumber = initialVerseNumber || '1';

  const [selectedChapterId, setSelectedChapterId] = useState(safeChapterId);
  const [selectedVerseNumber, setSelectedVerseNumber] = useState(safeVerseNumber);
  const [activeContentTab, setActiveContentTab] = useState<StudyModeTabId | null>(initialTab);
  const [selectedWordLocation, setSelectedWordLocation] = useState<string | undefined>(undefined);
  const [showWordBox, setShowWordBox] = useState<boolean>(false);

  useEffect(() => {
    if (!initialChapterId || !initialVerseNumber) return;
    const currentVerseKey = `${initialChapterId}:${initialVerseNumber}`;
    dispatch(setVerseKey(currentVerseKey));
    dispatch(setActiveTab(initialTab));
    dispatch(setHighlightedWordLocation(null));
  }, [initialChapterId, initialVerseNumber, initialTab, dispatch]);

  const getNavigationUrlForTab = useCallback(
    (chId: string, vNum: string, tab: StudyModeTabId | null) => {
      const vk = `${chId}:${vNum}`;
      if (tab === StudyModeTabId.TAFSIR) {
        const tafsirSlug = tafsirIdOrSlug || (tafsirs.length > 0 ? tafsirs[0] : null);
        if (tafsirSlug) {
          return getVerseSelectedTafsirNavigationUrl(chId, Number(vNum), tafsirSlug);
        }
        return getVerseSelectedTafsirNavigationUrl(chId, Number(vNum), 'en-tafisr-ibn-kathir');
      }
      if (tab === StudyModeTabId.REFLECTIONS) {
        return getVerseReflectionNavigationUrl(vk);
      }
      if (tab === StudyModeTabId.LESSONS) {
        return getVerseLessonNavigationUrl(vk);
      }
      if (tab === StudyModeTabId.ANSWERS) {
        return getVerseAnswersNavigationUrl(vk);
      }
      return null;
    },
    [tafsirIdOrSlug, tafsirs],
  );

  const verseKey = `${selectedChapterId}:${selectedVerseNumber}`;
  const isInitialVerse =
    selectedChapterId === safeChapterId && selectedVerseNumber === safeVerseNumber;

  const queryKey =
    !isInitialVerse || !initialVerse
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

  const rawVerse = data?.verse || (isInitialVerse ? initialVerse : undefined);

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
      const url = getNavigationUrlForTab(newChapterId, '1', activeContentTab);
      if (url) {
        fakeNavigateReplace(url, router.locale || 'en');
      }
    },
    [dispatch, activeContentTab, getNavigationUrlForTab, router.locale],
  );

  const handleVerseChange = useCallback(
    (newVerseNumber: string) => {
      setSelectedVerseNumber(newVerseNumber);
      dispatch(setVerseKey(`${selectedChapterId}:${newVerseNumber}`));
      const url = getNavigationUrlForTab(selectedChapterId, newVerseNumber, activeContentTab);
      if (url) {
        fakeNavigateReplace(url, router.locale || 'en');
      }
    },
    [dispatch, selectedChapterId, activeContentTab, getNavigationUrlForTab, router.locale],
  );

  const handlePreviousVerse = useCallback(() => {
    const currentVerseNum = Number(selectedVerseNumber);
    const newVerseNumber = String(currentVerseNum - 1);
    const newVerseKey = `${selectedChapterId}:${newVerseNumber}`;
    logButtonClick('study_mode_ssr_previous_verse', { verseKey: newVerseKey });
    setSelectedVerseNumber(newVerseNumber);
    dispatch(setVerseKey(newVerseKey));
    const url = getNavigationUrlForTab(selectedChapterId, newVerseNumber, activeContentTab);
    if (url) {
      fakeNavigateReplace(url, router.locale || 'en');
    }
  }, [
    selectedVerseNumber,
    selectedChapterId,
    dispatch,
    activeContentTab,
    getNavigationUrlForTab,
    router.locale,
  ]);

  const handleNextVerse = useCallback(() => {
    const currentVerseNum = Number(selectedVerseNumber);
    const newVerseNumber = String(currentVerseNum + 1);
    const newVerseKey = `${selectedChapterId}:${newVerseNumber}`;
    logButtonClick('study_mode_ssr_next_verse', { verseKey: newVerseKey });
    setSelectedVerseNumber(newVerseNumber);
    dispatch(setVerseKey(newVerseKey));
    const url = getNavigationUrlForTab(selectedChapterId, newVerseNumber, activeContentTab);
    if (url) {
      fakeNavigateReplace(url, router.locale || 'en');
    }
  }, [
    selectedVerseNumber,
    selectedChapterId,
    dispatch,
    activeContentTab,
    getNavigationUrlForTab,
    router.locale,
  ]);

  const canNavigatePrev = Number(selectedVerseNumber) > 1;
  const currentChapter = chaptersData?.[Number(selectedChapterId)];
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
      logButtonClick('study_mode_ssr_word', { wordLocation: clickedWord.location });
      setSelectedWordLocation(clickedWord.location);
      setShowWordBox(true);
      dispatch(setHighlightedWordLocation(clickedWord.location));
    },
    [dispatch],
  );

  const handlePreviousWord = useCallback(() => {
    if (currentWordIndex > 0) {
      const newLocation = quranWords[currentWordIndex - 1].location;
      logButtonClick('study_mode_ssr_previous_word', { wordLocation: newLocation });
      setSelectedWordLocation(newLocation);
      dispatch(setHighlightedWordLocation(newLocation));
    }
  }, [currentWordIndex, quranWords, dispatch]);

  const handleNextWord = useCallback(() => {
    if (currentWordIndex < quranWords.length - 1) {
      const newLocation = quranWords[currentWordIndex + 1].location;
      logButtonClick('study_mode_ssr_next_word', { wordLocation: newLocation });
      setSelectedWordLocation(newLocation);
      dispatch(setHighlightedWordLocation(newLocation));
    }
  }, [currentWordIndex, quranWords, dispatch]);

  const handleCloseWordBox = useCallback(() => {
    logButtonClick('study_mode_ssr_word_box_close');
    setShowWordBox(false);
    setSelectedWordLocation(undefined);
    dispatch(setHighlightedWordLocation(null));
  }, [dispatch]);

  const canNavigateWordPrev = currentWordIndex > 0;
  const canNavigateWordNext = currentWordIndex < quranWords.length - 1;

  const handleTabChange = useCallback(
    (tabId: StudyModeTabId | null) => {
      const currentVerseKey = `${selectedChapterId}:${selectedVerseNumber}`;
      logValueChange('study_mode_ssr_tab', activeContentTab, tabId, { verseKey: currentVerseKey });
      setActiveContentTab(tabId);
      dispatch(setActiveTab(tabId));

      const url = getNavigationUrlForTab(selectedChapterId, selectedVerseNumber, tabId);
      if (url) {
        fakeNavigateReplace(url, router.locale || 'en');
      }
    },
    [
      selectedChapterId,
      selectedVerseNumber,
      activeContentTab,
      dispatch,
      getNavigationUrlForTab,
      router.locale,
    ],
  );

  const handleClose = useCallback(() => {
    logButtonClick('study_mode_ssr_close', {
      verseKey: `${selectedChapterId}:${selectedVerseNumber}`,
    });
    const chapterUrl = getSurahNavigationUrl(selectedChapterId);
    const urlWithVerse = `${chapterUrl}?startingVerse=${selectedVerseNumber}`;
    router.replace(urlWithVerse, undefined, { scroll: false });
  }, [selectedChapterId, selectedVerseNumber, router]);

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
      <FakeContentClose className={styles.closeButton}>
        <Button
          variant={ButtonVariant.Ghost}
          shape={ButtonShape.Circle}
          ariaLabel={t('aria.close')}
        >
          <CloseIcon />
        </Button>
      </FakeContentClose>
    </div>
  );

  if (!chaptersData || !initialChapterId || !initialVerseNumber) return null;

  const handleRetry = () => {
    logButtonClick('study_mode_ssr_retry', { verseKey });
    mutate();
  };

  const renderContent = () => {
    if (isValidating && !data && !initialVerse) {
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
          questionId={questionId}
          questionsInitialData={questionsInitialData}
        />
      );
    }
    return <StudyModeSkeleton />;
  };

  return (
    <ContentModal
      isFakeSEOFriendlyMode
      onClose={handleClose}
      hasCloseButton={false}
      header={header}
      headerClassName={styles.modalHeader}
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

export default StudyModeSsrContainer;
