import React, { useRef, useEffect } from 'react';

import dynamic from 'next/dynamic';
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
import GraduationCapIcon from '@/icons/graduation-cap.svg';
import LightbulbIcon from '@/icons/lightbulb.svg';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
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

// Tab component lookup map for dynamic rendering
const TAB_COMPONENTS: Partial<
  Record<StudyModeTabId, React.ComponentType<{ chapterId: string; verseNumber: string }>>
> = {
  [StudyModeTabId.TAFSIR]: StudyModeTafsirTab,
  [StudyModeTabId.REFLECTIONS]: StudyModeReflectionsTab,
  [StudyModeTabId.LESSONS]: StudyModeLessonsTab,
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

  // Smooth scroll to tab content when a tab is opened
  useEffect(() => {
    if (activeTab && tabContentRef.current) {
      // Small delay to ensure the content is rendered
      setTimeout(() => {
        if (tabContentRef.current) {
          const scrollContainer = tabContentRef.current.closest(`.${styles.container}`)?.parentElement;
          if (scrollContainer) {
            const tabContentTop = tabContentRef.current.offsetTop;
            // Scroll to tab content with 80px offset above
            scrollContainer.scrollTo({
              top: tabContentTop - 80,
              behavior: 'smooth',
            });
          }
        }
      }, 100);
    }
  }, [activeTab]);

  const handleTabClick = (tabId: StudyModeTabId) => {
    const newTab = activeTab === tabId ? null : tabId;
    onTabChange?.(newTab);
  };

  const tabs = [
    {
      id: StudyModeTabId.TAFSIR,
      label: t('tafsir'),
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
    {
      id: StudyModeTabId.ANSWERS,
      label: t('answers'),
      icon: <ChatIcon />,
      onClick: () => handleTabClick(StudyModeTabId.ANSWERS),
      condition: true,
    },
    {
      id: StudyModeTabId.HADITH,
      label: t('hadith'),
      icon: <BxBookIcon />,
      onClick: () => handleTabClick(StudyModeTabId.HADITH),
      condition: true,
    },
    {
      id: StudyModeTabId.QIRAAT,
      label: t('qiraat'),
      icon: <DeviceHubIcon />,
      onClick: () => handleTabClick(StudyModeTabId.QIRAAT),
      condition: true,
    },
    {
      id: StudyModeTabId.RELATED_VERSES,
      label: t('related-verses'),
      icon: <DifferenceIcon />,
      onClick: () => handleTabClick(StudyModeTabId.RELATED_VERSES),
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

      {/* Bottom actions after verse and translations */}
      <StudyModeBottomActions tabs={tabs} activeTab={activeTab} />

      {/* Tab content appears below bottom actions */}
      {activeTab &&
        TAB_COMPONENTS[activeTab] &&
        (() => {
          const TabComponent = TAB_COMPONENTS[activeTab];
          return (
            <div ref={tabContentRef} className={styles.tabContentContainer}>
              <TabComponent chapterId={selectedChapterId} verseNumber={selectedVerseNumber} />
            </div>
          );
        })()}
    </div>
  );
};

export default StudyModeBody;
