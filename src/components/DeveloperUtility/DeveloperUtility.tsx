import React, { useState } from 'react';
import { BsWrench } from 'react-icons/bs';
import classNames from 'classnames';
import FontAdjustment from './FontAdjustment';
import ReadingViewAdjustment from './ReadingViewAdjustment';
import NotesAdjustment from './NotesAdjustment';
import AudioPlayerAdjustment from './AudioPlayerAdjustment';
import NavbarAdjustment from './NavbarAdjustment';
import ContextMenuAdjustment from './ContextMenuAdjustment';
import TranslationsAdjustment from './TranslationsAdjustment';
import ThemeAdjustment from './ThemeAdjustment';
import styles from './DeveloperUtility.module.scss';
/**
 * A set of developer utilities only availble on development environments
 */
const DeveloperUtility = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (process.env.NEXT_PUBLIC_ENV !== 'development') {
    return <></>;
  }

  if (!isExpanded) {
    return (
      <button
        className={classNames(styles.container)}
        aria-label="developer-utility"
        type="button"
        onClick={() => setIsExpanded(true)}
      >
        <BsWrench className={styles.wrench} />
      </button>
    );
  }

  return (
    <button
      className={classNames(styles.container, styles.containerExpanded)}
      aria-label="developer-utility"
      type="button"
    >
      Developer Utility
      <div className={styles.divider} />
      <ThemeAdjustment />
      <FontAdjustment />
      <ReadingViewAdjustment />
      <NotesAdjustment />
      <NavbarAdjustment />
      <AudioPlayerAdjustment />
      <TranslationsAdjustment />
      <ContextMenuAdjustment />
      <div>
        <button className={styles.closeButton} type="button" onClick={() => setIsExpanded(false)}>
          close
        </button>
      </div>
    </button>
  );
};

export default DeveloperUtility;
