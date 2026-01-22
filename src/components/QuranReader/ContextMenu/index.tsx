import React from 'react';

import classNames from 'classnames';

import ReadingModeToggle from '../ReadingPreferenceSwitcher/ReadingModeToggle';
import TajweedColors from '../TajweedBar/TajweedBar';

import ChapterNavigation from './components/ChapterNavigation';
import MobileReadingTabs from './components/MobileReadingTabs';
import PageInfo from './components/PageInfo';
import ProgressBar from './components/ProgressBar';
import SettingsButton from './components/SettingsButton';
import useContextMenuState from './hooks/useContextMenuState';
import styles from './styles/ContextMenu.module.scss';

import useIsMobile from '@/hooks/useIsMobile';
import { SwitcherContext } from '@/hooks/useReadingPreferenceSwitcher';
import { TestId } from '@/tests/test-ids';
import { Mushaf } from '@/types/QuranReader';
import { getChapterNumberFromKey } from '@/utils/verse';

/**
 * ContextMenu component for the Quran reader
 * Displays chapter navigation, reading preferences, and page information
 * @returns {JSX.Element|null} React component that renders the context menu UI with navigation, preferences, and page info, or null if data isn't loaded
 */
const ContextMenu: React.FC = (): JSX.Element | null => {
  const {
    // State
    isSidebarNavigationVisible,
    showNavbar,
    isSideBarVisible,
    isExpanded,
    mushaf,
    verseKey,
    isTranslationMode,

    // Data
    chapterData,
    juzNumber,
    localizedHizb,
    pageNumber,
    progress,

    // Translations
    t,

    // Event handlers
    handleSidebarToggle,
  } = useContextMenuState();

  const isMobileView = useIsMobile();

  // Early return if no verse key (SSR or first render)
  if (!verseKey || !chapterData) {
    return null;
  }

  const isMobileScrolledView = !showNavbar && isMobileView;
  const isNotMobileOrScrolledView = !showNavbar || !isMobileView;

  return (
    <div
      data-testid={TestId.HEADER}
      data-isvisible={!isMobileScrolledView}
      className={classNames(styles.container, {
        [styles.visibleContainer]: showNavbar,
        [styles.withVisibleBanner]: showNavbar,
        [styles.expandedContainer]: isExpanded,
        [styles.withVisibleSideBar]: isSideBarVisible,
      })}
    >
      {/* Page Information Section as its own row on mobile scrolled view */}
      {isMobileScrolledView && (
        <div className={classNames(styles.section, styles.pageInfoSection)}>
          <div className={styles.row}>
            <p className={styles.alignCenter} />
            <PageInfo
              juzNumber={juzNumber}
              hizbNumber={localizedHizb}
              pageNumber={pageNumber}
              containerClassName={styles.pageInfoCustomContainerMobileScrolled}
              t={t}
            />
          </div>
        </div>
      )}

      <div className={styles.sectionsContainer}>
        {/* Chapter Navigation Section */}
        <div className={styles.section}>
          <div className={classNames(styles.row, { [styles.mobileNavRow]: showNavbar })}>
            <ChapterNavigation
              chapterName={chapterData.transliteratedName}
              isSidebarNavigationVisible={isSidebarNavigationVisible}
              onToggleSidebar={handleSidebarToggle}
              chapterNumber={getChapterNumberFromKey(verseKey)}
            />
            {/* Settings button for mobile when navbar is visible */}
            {showNavbar && <SettingsButton className={styles.mobileSettingsButton} />}
          </div>
        </div>

        {/* Page Information Section (default, not mobile scrolled view) */}
        {!isMobileScrolledView && (
          <div className={classNames(styles.section, styles.pageInfoSectionDesktop)}>
            <div className={styles.row}>
              <p className={styles.alignCenter} />
              <PageInfo
                juzNumber={juzNumber}
                hizbNumber={localizedHizb}
                pageNumber={pageNumber}
                containerClassName={styles.pageInfoCustomContainer}
                t={t}
              />
            </div>
          </div>
        )}

        {/* Reading Preference Section */}
        <div
          className={classNames(styles.section, styles.readingPreferenceSection, {
            [styles.hideReadingPreferenceSectionOnMobile]: showNavbar,
          })}
        >
          <div className={styles.readingPreferenceContainer}>
            <ReadingModeToggle
              isIconsOnly={isMobileScrolledView}
              context={SwitcherContext.ContextMenu}
            />
            {(!isMobileView || !showNavbar) && (
              <SettingsButton className={styles.settingsNextToSwitcher} />
            )}
          </div>
        </div>
      </div>

      {/* Mobile-specific tabs for switching between reading preferences
      Appears only on mobile breakpoints when the navbar is visible */}
      {showNavbar && <MobileReadingTabs t={t} isVisible={showNavbar} />}

      {/* Tajweed colors bar will only show when tajweed mushaf enabled and not in translation mode */}
      {mushaf === Mushaf.QCFTajweedV4 && !isTranslationMode && <TajweedColors />}

      {/* Reading progress bar */}
      {isNotMobileOrScrolledView && <ProgressBar progress={progress} />}
    </div>
  );
};

export default ContextMenu;
