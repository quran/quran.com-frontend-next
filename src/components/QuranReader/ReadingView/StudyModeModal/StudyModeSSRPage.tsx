import React, { useCallback, useMemo, useState } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import styles from './StudyModeModal.module.scss';
import StudyModeBody from './StudyModeBody';
import { StudyModeTabId } from './StudyModeBottomActions';

import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import ContentModal from '@/dls/ContentModal/ContentModal';
import CloseIcon from '@/icons/close.svg';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { selectSelectedTafsirs } from '@/redux/slices/QuranReader/tafsirs';
import Verse from '@/types/Verse';
import {
  fakeNavigate,
  getSurahNavigationUrl,
  getVerseSelectedTafsirNavigationUrl,
  getVerseReflectionNavigationUrl,
  getVerseLessonNavigationUrl,
} from '@/utils/navigation';

export interface StudyModeSSRPageProps {
  initialTab: StudyModeTabId;
  chapterId: string;
  verseNumber: string;
  verse: Verse;
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
}) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const tafsirs = useSelector(selectSelectedTafsirs, shallowEqual);
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);

  // Track active tab for URL updates
  const [activeTab, setActiveTab] = useState<StudyModeTabId | null>(initialTab);

  // Check if a content tab is active for bottom sheet styling
  const isContentTabActive =
    activeTab &&
    [StudyModeTabId.TAFSIR, StudyModeTabId.REFLECTIONS, StudyModeTabId.LESSONS].includes(activeTab);

  // Handle close - navigate back to chapter URL
  const handleClose = useCallback(() => {
    fakeNavigate(getSurahNavigationUrl(chapterId), router.locale);
  }, [chapterId, router.locale]);

  // Handle tab change with URL updates
  const handleTabChange = useCallback(
    (tabId: StudyModeTabId | null) => {
      setActiveTab(tabId);
      const verseKey = `${chapterId}:${verseNumber}`;

      if (tabId === StudyModeTabId.TAFSIR && tafsirs.length > 0) {
        fakeNavigate(
          getVerseSelectedTafsirNavigationUrl(chapterId, Number(verseNumber), tafsirs[0]),
          router.locale,
        );
      } else if (tabId === StudyModeTabId.REFLECTIONS) {
        fakeNavigate(getVerseReflectionNavigationUrl(verseKey), router.locale);
      } else if (tabId === StudyModeTabId.LESSONS) {
        fakeNavigate(getVerseLessonNavigationUrl(verseKey), router.locale);
      } else if (tabId === null) {
        // When closing all tabs, navigate back to chapter
        fakeNavigate(getSurahNavigationUrl(chapterId), router.locale);
      }
    },
    [chapterId, verseNumber, tafsirs, router.locale],
  );

  // Minimal header with just close button for SSR mode
  const header = useMemo(
    () => (
      <div className={styles.header}>
        <div className={styles.selectionWrapper}>
          <span>
            {t('quran-reader:study-mode')} - {chapterId}:{verseNumber}
          </span>
        </div>
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
    [t, chapterId, verseNumber, handleClose],
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
