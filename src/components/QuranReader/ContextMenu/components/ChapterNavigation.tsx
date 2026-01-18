import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from '../styles/ContextMenu.module.scss';

import ChevronDownIcon from '@/icons/chevron-down.svg';
import { TestId } from '@/tests/test-ids';
import { toLocalizedNumber } from '@/utils/locale';

interface ChapterNavigationProps {
  chapterName: string;
  isSidebarNavigationVisible: boolean | 'auto';
  onToggleSidebar: (e: React.MouseEvent | React.KeyboardEvent) => void;
  chapterNumber: number;
}

/**
 * Component for displaying chapter name and handling sidebar navigation toggle
 * @returns {JSX.Element} React component that displays chapter name and handles sidebar navigation toggle
 */
const ChapterNavigation: React.FC<ChapterNavigationProps> = ({
  chapterName,
  isSidebarNavigationVisible,
  onToggleSidebar,
  chapterNumber,
}) => {
  const { lang } = useTranslation();
  return (
    <p
      data-testid={TestId.CHAPTER_NAVIGATION}
      className={classNames(styles.bold, styles.alignStart, styles.surahName, {
        [styles.disabledOnMobile]: isSidebarNavigationVisible,
      })}
    >
      <span
        className={styles.chapterInteractiveSpan}
        role="button"
        onClick={onToggleSidebar}
        tabIndex={0}
        aria-pressed={isSidebarNavigationVisible === true}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onToggleSidebar(e);
          }
        }}
      >
        <span className={styles.chapterNumber}>{`${toLocalizedNumber(
          chapterNumber,
          lang,
        )}. ${chapterName}`}</span>
        <span
          className={classNames(styles.chevronIconContainer, {
            [styles.rotate180]: isSidebarNavigationVisible === true,
            [styles.rotateAuto]: isSidebarNavigationVisible === 'auto',
          })}
        >
          <ChevronDownIcon />
        </span>
      </span>
    </p>
  );
};

export default ChapterNavigation;
