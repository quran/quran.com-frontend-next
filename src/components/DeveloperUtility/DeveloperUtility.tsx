import React, { useState } from 'react';
import classNames from 'classnames';
import FontAdjustment from './FontAdjustment';
import ReadingPreferenceAdjustment from './ReadingPreferenceAdjustment';
import NotesAdjustment from './NotesAdjustment';
import AudioPlayerAdjustment from './AudioPlayerAdjustment';
import NavbarAdjustment from './NavbarAdjustment';
import TafsirsAdjustment from './TafsirsAdjustment';
import ContextMenuAdjustment from './ContextMenuAdjustment';
import TranslationsAdjustment from './TranslationsAdjustment';
import ThemeAdjustment from './ThemeAdjustment';
import ReciterAdjustment from './ReciterAdjustment';
import styles from './DeveloperUtility.module.scss';
import WrenchIcon from '../../../public/icons/wrench.svg';
import WordByWordAdjustment from './WordByWordAdjustment';
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
        <WrenchIcon className={styles.wrench} />
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
      <ReadingPreferenceAdjustment />
      <WordByWordAdjustment />
      <NotesAdjustment />
      <NavbarAdjustment />
      <AudioPlayerAdjustment />
      <TranslationsAdjustment />
      <TafsirsAdjustment />
      <ContextMenuAdjustment />
      <ReciterAdjustment />
      <div>
        <button className={styles.closeButton} type="button" onClick={() => setIsExpanded(false)}>
          close
        </button>
      </div>
    </button>
  );
};

export default DeveloperUtility;
