import React, { useRef, useEffect, useState, useCallback } from 'react';

import classNames from 'classnames';
import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';
import Translation from 'types/Translation';
import Verse from 'types/Verse';
import Word from 'types/Word';

import getTranslationsLabelString from '../utils/translation';

import styles from './StudyModeBody.module.scss';
import StudyModeBottomActions, { StudyModeTabId } from './StudyModeBottomActions';
import StudyModeVerseText from './StudyModeVerseText';
import WordNavigationBox from './WordNavigationBox';
// SSR-enabled tab components (imported directly for SSR pages - no dynamic imports)
import SSRStudyModeLessonsTab from './tabs/StudyModeLessonsTabSSR';
import SSRStudyModeReflectionsTab from './tabs/StudyModeReflectionsTabSSR';
import SSRStudyModeTafsirTab from './tabs/StudyModeTafsirTabSSR';

import TopActions from '@/components/QuranReader/TranslationView/TopActions';
import TranslationText from '@/components/QuranReader/TranslationView/TranslationText';
import BookIcon from '@/icons/book-open.svg';
import GraduationCapIcon from '@/icons/graduation-cap.svg';
import LightbulbIcon from '@/icons/lightbulb.svg';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { constructWordVerse, getVerseWords } from '@/utils/verse';

// Client-side tab components (dynamic imports with ssr: false for modal use)
const StudyModeTafsirTab = dynamic(() => import('./tabs/StudyModeTafsirTab'), {
  ssr: false,
});

const StudyModeReflectionsTab = dynamic(() => import('./tabs/StudyModeReflectionsTab'), {
  ssr: false,
});

const StudyModeLessonsTab = dynamic(() => import('./tabs/StudyModeLessonsTab'), {
  ssr: false,
});

// Tab component lookup map for dynamic rendering (client-side)
const TAB_COMPONENTS: Partial<
  Record<StudyModeTabId, React.ComponentType<{ chapterId: string; verseNumber: string }>>
> = {
  [StudyModeTabId.TAFSIR]: StudyModeTafsirTab,
  [StudyModeTabId.REFLECTIONS]: StudyModeReflectionsTab,
  [StudyModeTabId.LESSONS]: StudyModeLessonsTab,
};

// SSR tab component props interface
interface SSRTabComponentProps {
  chapterId: string;
  verseNumber: string;
  tafsirIdOrSlug?: string;
  locale?: string;
}

// SSR-enabled tab component lookup map (for SSR pages)
const SSR_TAB_COMPONENTS: Partial<Record<StudyModeTabId, React.ComponentType<SSRTabComponentProps>>> =
  {
    [StudyModeTabId.TAFSIR]: SSRStudyModeTafsirTab,
    [StudyModeTabId.REFLECTIONS]: SSRStudyModeReflectionsTab,
    [StudyModeTabId.LESSONS]: SSRStudyModeLessonsTab,
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
  /** When true, uses SSR-enabled tab components for server-side rendering */
  isSsrMode?: boolean;
  /** Tafsir ID or slug for SSR query key matching */
  ssrTafsirIdOrSlug?: string;
  /** Locale for SSR query key matching */
  ssrLocale?: string;
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
  isSsrMode = false,
  ssrTafsirIdOrSlug,
  ssrLocale,
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
      icon: <LightbulbIcon />,
      onClick: () => handleTabClick(StudyModeTabId.REFLECTIONS),
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
        (() => {
          // Use SSR-enabled components for SSR pages, dynamic imports for client-side modal
          const tabComponents = isSsrMode ? SSR_TAB_COMPONENTS : TAB_COMPONENTS;
          const TabComponent = tabComponents[activeTab];
          if (!TabComponent) return null;
          return (
            <div ref={tabContentRef} className={styles.tabContentContainer}>
              {isSsrMode ? (
                <TabComponent
                  chapterId={selectedChapterId}
                  verseNumber={selectedVerseNumber}
                  tafsirIdOrSlug={ssrTafsirIdOrSlug}
                  locale={ssrLocale}
                />
              ) : (
                <TabComponent chapterId={selectedChapterId} verseNumber={selectedVerseNumber} />
              )}
            </div>
          );
        })()}
    </div>
  );
};

export default StudyModeBody;
