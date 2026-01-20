import React, { useCallback, useContext, useMemo, useState } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import { shallowEqual, useSelector } from 'react-redux';

import SearchableVerseSelector from './SearchableVerseSelector';
import styles from './StudyModeModal.module.scss';
import StudyModeBody from './StudyModeBody';
import { StudyModeTabId } from './StudyModeBottomActions';

import DataContext from '@/contexts/DataContext';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import ContentModal from '@/dls/ContentModal/ContentModal';
import ArrowIcon from '@/icons/arrow.svg';
import CloseIcon from '@/icons/close.svg';
import { selectSelectedTafsirs } from '@/redux/slices/QuranReader/tafsirs';
import QueryParam from '@/types/QueryParam';
import Verse from '@/types/Verse';
import {
  fakeNavigate,
  getVerseSelectedTafsirNavigationUrl,
  getVerseReflectionNavigationUrl,
  getVerseLessonNavigationUrl,
} from '@/utils/navigation';

export interface StudyModeSSRPageProps {
  initialTab: StudyModeTabId;
  chapterId: string;
  verseNumber: string;
  verse: Verse;
  /** Tafsir ID or slug for SSR query key matching (required for tafsir pages) */
  tafsirIdOrSlug?: string;
  /** Locale for SSR query key matching */
  locale?: string;
}

/**
 * StudyModeSSRPage - SEO-friendly Study Mode wrapper for SSR pages
 *
 * This component renders the Study Mode content in a ContentModal with `isFakeSEOFriendlyMode`
 * enabled for SEO crawlers while maintaining the modal appearance for users.
 *
 * Uses the SurahInfoPage pattern:
 * - Renders content inline in DOM (not portal) for SEO indexing
 * - Uses fakeNavigate for URL updates without page navigation
 * - Closes modal by navigating back to chapter URL
 */
const StudyModeSSRPage: React.FC<StudyModeSSRPageProps> = ({
  initialTab,
  chapterId,
  verseNumber,
  verse,
  tafsirIdOrSlug,
  locale,
}) => {
  const router = useRouter();
  const chaptersData = useContext(DataContext);
  const tafsirs = useSelector(selectSelectedTafsirs, shallowEqual);

  // Track selected chapter and verse for SearchableVerseSelector
  const [selectedChapterId, setSelectedChapterId] = useState(chapterId);
  const [selectedVerseNumber, setSelectedVerseNumber] = useState(verseNumber);

  // Track active tab for URL updates
  const [activeTab, setActiveTab] = useState<StudyModeTabId | null>(initialTab);

  // Check if a content tab is active for bottom sheet styling
  const isContentTabActive =
    activeTab &&
    [StudyModeTabId.TAFSIR, StudyModeTabId.REFLECTIONS, StudyModeTabId.LESSONS].includes(activeTab);

  // Handle close - navigate back to chapter URL with startingVerse param for scrolling
  // Using router.push with shallow:true to update router.query and trigger scroll hooks
  const verseKey = `${selectedChapterId}:${selectedVerseNumber}`;
  const handleClose = useCallback(() => {
    router.push(
      {
        pathname: `/${selectedChapterId}`,
        query: { [QueryParam.STARTING_VERSE]: selectedVerseNumber },
      },
      undefined,
      { shallow: true },
    );
  }, [selectedChapterId, selectedVerseNumber, router]);

  // Navigate to a new verse page based on current tab
  const navigateToVerse = useCallback(
    (newChapterId: string, newVerseNumber: string) => {
      const newVerseKey = `${newChapterId}:${newVerseNumber}`;
      if (activeTab === StudyModeTabId.TAFSIR && tafsirs.length > 0) {
        router.push(
          getVerseSelectedTafsirNavigationUrl(newChapterId, Number(newVerseNumber), tafsirs[0]),
        );
      } else if (activeTab === StudyModeTabId.REFLECTIONS) {
        router.push(getVerseReflectionNavigationUrl(newVerseKey));
      } else if (activeTab === StudyModeTabId.LESSONS) {
        router.push(getVerseLessonNavigationUrl(newVerseKey));
      }
    },
    [activeTab, tafsirs, router],
  );

  // Handle chapter change - navigate to verse 1 of new chapter
  const handleChapterChange = useCallback(
    (newChapterId: string) => {
      setSelectedChapterId(newChapterId);
      setSelectedVerseNumber('1');
      navigateToVerse(newChapterId, '1');
    },
    [navigateToVerse],
  );

  // Handle verse change - navigate to new verse in same chapter
  const handleVerseChange = useCallback(
    (newVerseNumber: string) => {
      setSelectedVerseNumber(newVerseNumber);
      navigateToVerse(selectedChapterId, newVerseNumber);
    },
    [selectedChapterId, navigateToVerse],
  );

  // Handle previous verse navigation
  const handlePreviousVerse = useCallback(() => {
    const currentVerseNum = Number(selectedVerseNumber);
    if (currentVerseNum > 1) {
      const newVerseNumber = String(currentVerseNum - 1);
      setSelectedVerseNumber(newVerseNumber);
      navigateToVerse(selectedChapterId, newVerseNumber);
    }
  }, [selectedVerseNumber, selectedChapterId, navigateToVerse]);

  // Handle next verse navigation
  const handleNextVerse = useCallback(() => {
    const currentVerseNum = Number(selectedVerseNumber);
    const currentChapter = chaptersData?.[Number(selectedChapterId)];
    if (currentChapter && currentVerseNum < currentChapter.versesCount) {
      const newVerseNumber = String(currentVerseNum + 1);
      setSelectedVerseNumber(newVerseNumber);
      navigateToVerse(selectedChapterId, newVerseNumber);
    }
  }, [selectedVerseNumber, selectedChapterId, chaptersData, navigateToVerse]);

  // Navigation button states
  const canNavigatePrev = Number(selectedVerseNumber) > 1;
  const currentChapter = chaptersData?.[Number(selectedChapterId)];
  const canNavigateNext =
    currentChapter && Number(selectedVerseNumber) < currentChapter.versesCount;

  // Handle tab change with URL updates
  const handleTabChange = useCallback(
    (tabId: StudyModeTabId | null) => {
      setActiveTab(tabId);

      if (tabId === StudyModeTabId.TAFSIR && tafsirs.length > 0) {
        fakeNavigate(
          getVerseSelectedTafsirNavigationUrl(selectedChapterId, Number(selectedVerseNumber), tafsirs[0]),
          router.locale,
        );
      } else if (tabId === StudyModeTabId.REFLECTIONS) {
        fakeNavigate(getVerseReflectionNavigationUrl(verseKey), router.locale);
      } else if (tabId === StudyModeTabId.LESSONS) {
        fakeNavigate(getVerseLessonNavigationUrl(verseKey), router.locale);
      } else if (tabId === null) {
        // When closing all tabs, navigate back to chapter with startingVerse
        // Using router.push with shallow:true to update router.query and trigger scroll hooks
        router.push(
          {
            pathname: `/${selectedChapterId}`,
            query: { [QueryParam.STARTING_VERSE]: selectedVerseNumber },
          },
          undefined,
          { shallow: true },
        );
      }
    },
    [selectedChapterId, selectedVerseNumber, verseKey, tafsirs, router],
  );

  // Header with SearchableVerseSelector and navigation buttons (matching StudyModeModal)
  const header = useMemo(
    () => (
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
    ),
    [
      selectedChapterId,
      selectedVerseNumber,
      handleChapterChange,
      handleVerseChange,
      handlePreviousVerse,
      handleNextVerse,
      canNavigatePrev,
      canNavigateNext,
      handleClose,
    ],
  );

  return (
    <ContentModal
      isFakeSEOFriendlyMode
      onClose={handleClose}
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
      <StudyModeBody
        verse={verse}
        bookmarksRangeUrl=""
        selectedChapterId={chapterId}
        selectedVerseNumber={verseNumber}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        // SSR mode - use SSR-enabled tab components for server-side rendering
        isSsrMode
        // SSR-specific props for query key matching
        ssrTafsirIdOrSlug={tafsirIdOrSlug}
        ssrLocale={locale}
        // SSR mode props - no word navigation in SSR
        showWordBox={false}
        onWordClick={() => {}}
        onWordBoxClose={() => {}}
        onNavigatePreviousWord={() => {}}
        onNavigateNextWord={() => {}}
        canNavigateWordPrev={false}
        canNavigateWordNext={false}
      />
    </ContentModal>
  );
};

export default StudyModeSSRPage;
