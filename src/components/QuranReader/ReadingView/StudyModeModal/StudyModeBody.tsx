/* eslint-disable max-lines */
import React, { useRef, useEffect, useState, useCallback } from 'react';

import classNames from 'classnames';
import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import getTranslationsLabelString from '../utils/translation';

import styles from './StudyModeBody.module.scss';
import StudyModeBottomActions, { StudyModeTabId } from './StudyModeBottomActions';
import StudyModeVerseText from './StudyModeVerseText';
import WordNavigationBox from './WordNavigationBox';

import TafsirSkeleton from '@/components/QuranReader/TafsirView/TafsirSkeleton';
import TopActions from '@/components/QuranReader/TranslationView/TopActions';
import TranslationText from '@/components/QuranReader/TranslationView/TranslationText';
import useBatchedCountRangeQuestions from '@/hooks/auth/useBatchedCountRangeQuestions';
import BookIcon from '@/icons/book-open.svg';
import ChatIcon from '@/icons/chat.svg';
import GraduationCapIcon from '@/icons/graduation-cap.svg';
import LightbulbOnIcon from '@/icons/lightbulb-on.svg';
import LightbulbIcon from '@/icons/lightbulb.svg';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import QuestionType from '@/types/QuestionsAndAnswers/QuestionType';
import { constructWordVerse, getVerseWords } from '@/utils/verse';
import Translation from 'types/Translation';
import Verse from 'types/Verse';
import Word from 'types/Word';

const StudyModeTafsirTab = dynamic(() => import('./tabs/StudyModeTafsirTab'), {
  ssr: false,
});

const StudyModeReflectionsTab = dynamic(() => import('./tabs/StudyModeReflectionsTab'), {
  ssr: false,
});

const StudyModeLessonsTab = dynamic(() => import('./tabs/StudyModeLessonsTab'), {
  ssr: false,
});

const StudyModeAnswersTab = dynamic(() => import('./tabs/StudyModeAnswersTab'), {
  ssr: false,
  loading: () => <TafsirSkeleton />,
});

// Tab component lookup map for dynamic rendering
const TAB_COMPONENTS: Partial<
  Record<
    StudyModeTabId,
    React.ComponentType<{
      chapterId: string;
      verseNumber: string;
      switchTab?: (tabId: StudyModeTabId | null) => void;
    }>
  >
> = {
  [StudyModeTabId.TAFSIR]: StudyModeTafsirTab,
  [StudyModeTabId.REFLECTIONS]: StudyModeReflectionsTab,
  [StudyModeTabId.LESSONS]: StudyModeLessonsTab,
  [StudyModeTabId.ANSWERS]: StudyModeAnswersTab,
};

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
  selectedChapterId: string;
  selectedVerseNumber: string;
  activeTab?: StudyModeTabId | null;
  onTabChange?: (tabId: StudyModeTabId | null) => void;
}

const StudyModeBody: React.FC<StudyModeBodyProps> = ({
  verse,
  bookmarksRangeUrl = '',
  hasNotes,
  selectedWord,
  selectedWordLocation,
  showWordBox,
  onWordClick,
  onWordBoxClose,
  onNavigatePreviousWord,
  onNavigateNextWord,
  canNavigateWordPrev,
  canNavigateWordNext,
  selectedChapterId,
  selectedVerseNumber,
  activeTab,
  onTabChange,
}) => {
  const { t } = useTranslation('common');
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const translationsLabel = getTranslationsLabelString(verse.translations);
  const translationsCount = verse.translations?.length || 0;
  const tabContentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomActionsRef = useRef<HTMLDivElement>(null);
  const [hasScrolledDown, setHasScrolledDown] = useState(false);
  const [hasScrollableContent, setHasScrollableContent] = useState(false);
  const [hasScrolledToTab, setHasScrolledToTab] = useState(false);

  // Fetch question count for the current verse (batched in groups of 10)
  const verseKey = `${selectedChapterId}:${selectedVerseNumber}`;
  const { data: questionData, isLoading: isLoadingQuestions } =
    useBatchedCountRangeQuestions(verseKey);

  // Check if questions exist and their type
  const hasQuestions = questionData?.total > 0 || isLoadingQuestions;
  const isClarificationQuestion = !!questionData?.types?.[QuestionType.CLARIFICATION];

  useEffect(() => {
    if (activeTab === StudyModeTabId.ANSWERS && !hasQuestions) {
      onTabChange?.(null);
    }
  }, [activeTab, hasQuestions, onTabChange]);

  // Check if content is scrollable and detect scroll
  useEffect(() => {
    const checkScrollable = () => {
      if (containerRef.current) {
        const scrollContainer = containerRef.current.parentElement;
        if (scrollContainer) {
          const isScrollable = scrollContainer.scrollHeight > scrollContainer.clientHeight;
          setHasScrollableContent(isScrollable);
        }
      }
    };

    // Check after content renders
    const timeoutId = setTimeout(checkScrollable, 100);

    return () => clearTimeout(timeoutId);
  }, [verse, activeTab]);

  // Handle scroll to hide gradient once user scrolls
  const handleScroll = useCallback(
    (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.scrollTop > 10 && !hasScrolledDown) {
        setHasScrolledDown(true);
      }
    },
    [hasScrolledDown],
  );

  // Attach scroll listener to the modal's scroll container
  useEffect(() => {
    if (containerRef.current) {
      const scrollContainer = containerRef.current.parentElement;
      if (scrollContainer) {
        scrollContainer.addEventListener('scroll', handleScroll);
        return () => scrollContainer.removeEventListener('scroll', handleScroll);
      }
    }
    return undefined;
  }, [handleScroll]);

  // Reset scroll state when verse changes
  useEffect(() => {
    setHasScrolledDown(false);
    setHasScrolledToTab(false);
  }, [verse.verseKey]);

  // Reset hasScrolledToTab when all tabs are closed
  useEffect(() => {
    if (!activeTab) {
      setHasScrolledToTab(false);
    }
  }, [activeTab]);

  // Smooth scroll to bottom actions when a tab is first opened
  useEffect(() => {
    if (activeTab && !hasScrolledToTab && bottomActionsRef.current && containerRef.current) {
      setHasScrolledToTab(true);
      const scrollContainer = containerRef.current.parentElement;
      if (scrollContainer) {
        const bottomActionsTop = bottomActionsRef.current.offsetTop;
        scrollContainer.scrollTo({
          top: bottomActionsTop - 140,
          behavior: 'smooth',
        });
      }
    }
  }, [activeTab, hasScrolledToTab]);

  const showScrollGradient = hasScrollableContent && !hasScrolledDown && !activeTab;

  const handleTabClick = (tabId: StudyModeTabId) => {
    const newTab = activeTab === tabId ? null : tabId;
    onTabChange?.(newTab);
  };

  const tabs = [
    {
      id: StudyModeTabId.TAFSIR,
      label: t('quran-reader:tafsirs'),
      icon: <BookIcon />,
      onClick: () => handleTabClick(StudyModeTabId.TAFSIR),
      condition: true,
    },
    {
      id: StudyModeTabId.LESSONS,
      label: t('lessons'),
      icon: <GraduationCapIcon />,
      onClick: () => handleTabClick(StudyModeTabId.LESSONS),
      condition: true,
    },
    {
      id: StudyModeTabId.REFLECTIONS,
      label: t('reflections'),
      icon: <ChatIcon />,
      onClick: () => handleTabClick(StudyModeTabId.REFLECTIONS),
      condition: true,
    },
    {
      id: StudyModeTabId.ANSWERS,
      label: t('answers'),
      icon: isClarificationQuestion ? <LightbulbOnIcon /> : <LightbulbIcon />,
      onClick: () => handleTabClick(StudyModeTabId.ANSWERS),
      condition: hasQuestions,
    },
  ];

  // Ensure verse has chapterId (extract from verseKey if needed)
  const verseWithChapterId = {
    ...verse,
    chapterId: verse.chapterId || verse.verseKey?.split(':')[0],
  };

  const wordVerse = constructWordVerse(verseWithChapterId, translationsLabel, translationsCount);

  return (
    <div ref={containerRef} className={styles.container}>
      <TopActions
        verse={wordVerse}
        bookmarksRangeUrl={bookmarksRangeUrl}
        hasNotes={hasNotes}
        shouldUseModalZIndex
      />
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

      {/* Bottom actions after verse and translations */}
      <div
        ref={bottomActionsRef}
        className={classNames(styles.bottomActionsWrapper, {
          [styles.bottomActionsWrapperSticky]: !activeTab,
        })}
      >
        {showScrollGradient && (
          <div
            className={classNames(styles.scrollGradient, {
              [styles.scrollGradientHidden]: hasScrolledDown,
            })}
          />
        )}
        <StudyModeBottomActions tabs={tabs} activeTab={activeTab} />
      </div>

      {/* Tab content appears below bottom actions */}
      {activeTab &&
        TAB_COMPONENTS[activeTab] &&
        (() => {
          const TabComponent = TAB_COMPONENTS[activeTab];

          return (
            <div ref={tabContentRef} className={styles.tabContentContainer}>
              <TabComponent
                chapterId={selectedChapterId}
                verseNumber={selectedVerseNumber}
                switchTab={onTabChange}
              />
            </div>
          );
        })()}
    </div>
  );
};

export default StudyModeBody;
