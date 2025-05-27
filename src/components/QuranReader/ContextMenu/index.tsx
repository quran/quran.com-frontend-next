import React from 'react';

import classNames from 'classnames';

import ReadingPreferenceSwitcher, {
  ReadingPreferenceSwitcherType,
} from '../ReadingPreferenceSwitcher';
import TajweedColors from '../TajweedBar/TajweedBar';

import ChapterNavigation from './components/ChapterNavigation';
import PageInfo from './components/PageInfo';
import useContextMenuState from './hooks/useContextMenuState';
import styles from './styles/ContextMenu.module.scss';

import { SwitchSize } from '@/dls/Switch/Switch';
import { Mushaf } from '@/types/QuranReader';

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
    showReadingPreferenceSwitcher,
    isSideBarVisible,
    isExpanded,
    mushaf,
    verseKey,

    // Data
    chapterData,
    juzNumber,
    localizedHizb,
    localizedPageNumber,
    progress,

    // Translations
    t,

    // Event handlers
    handleSidebarToggle,
  } = useContextMenuState();

  // Early return if no verse key (SSR or first render)
  if (!verseKey || !chapterData) {
    return null;
  }

  return (
    <div
      className={classNames(styles.container, {
        [styles.visibleContainer]: showNavbar,
        [styles.expandedContainer]: isExpanded,
        [styles.withVisibleSideBar]: isSideBarVisible,
      })}
      style={Object.assign({} as React.CSSProperties, {
        ['--progress' as string]: `${progress}%`,
      })}
    >
      <div className={styles.sectionsContainer}>
        {/* Chapter Navigation Section */}
        <div className={showReadingPreferenceSwitcher ? styles.section : styles.halfSection}>
          <div className={classNames(styles.row)}>
            <ChapterNavigation
              chapterName={chapterData.transliteratedName}
              isSidebarNavigationVisible={isSidebarNavigationVisible}
              onToggleSidebar={handleSidebarToggle}
            />
          </div>
        </div>

        {/* Reading Preference Section */}
        {showReadingPreferenceSwitcher && (
          <div className={styles.halfSection}>
            <ReadingPreferenceSwitcher
              size={SwitchSize.XSmall}
              isIconsOnly
              type={ReadingPreferenceSwitcherType.ContextMenu}
            />
          </div>
        )}

        {/* Page Information Section */}
        <div className={showReadingPreferenceSwitcher ? styles.section : styles.halfSection}>
          <div className={classNames(styles.row)}>
            <p className={classNames(styles.alignEnd)} />
            <PageInfo
              juzNumber={juzNumber}
              hizbNumber={localizedHizb}
              pageNumber={localizedPageNumber}
              t={t}
            />
          </div>
        </div>
      </div>

      {/* Tajweed Colors */}
      {mushaf === Mushaf.QCFTajweedV4 && <TajweedColors />}
    </div>
  );
};

export default ContextMenu;
