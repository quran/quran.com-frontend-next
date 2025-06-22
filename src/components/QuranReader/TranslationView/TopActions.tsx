import React from 'react';

import classNames from 'classnames';

import styles from './TranslationViewCell.module.scss';

import CopyButton from '@/components/QuranReader/ReadingView/CopyButton';
import BookmarkAction from '@/components/Verse/BookmarkAction';
import VerseNotes from '@/components/Verse/Notes';
import OverflowVerseActionsMenu from '@/components/Verse/OverflowVerseActionsMenu';
import PlayVerseAudioButton from '@/components/Verse/PlayVerseAudioButton';
import ShareButton from '@/components/Verse/ShareButton';
import VerseLink from '@/components/Verse/VerseLink';
import Verse from 'types/Verse';

type TopActionsProps = {
  verse: Verse;
  bookmarksRangeUrl: string;
  hasNotes?: boolean;
};

/**
 * Top actions component for the TranslationViewCell
 * Contains verse navigation, bookmarking, copy, notes, play audio, and overflow menu
 * @returns {JSX.Element} JSX element containing the top action buttons
 */
const TopActions: React.FC<TopActionsProps> = ({ verse, bookmarksRangeUrl, hasNotes }) => {
  return (
    <div className={styles.actionContainer}>
      <div className={styles.actionContainerLeft}>
        <div className={styles.actionItem}>
          <VerseLink verseKey={verse.verseKey} />
        </div>
        <div className={classNames(styles.actionItem, styles.priorityAction)}>
          <PlayVerseAudioButton verseKey={verse.verseKey} />
        </div>
        <div className={styles.actionItem}>
          <BookmarkAction
            verse={verse}
            isTranslationView
            bookmarksRangeUrl={bookmarksRangeUrl}
            onActionTriggered={() => {}}
          />
        </div>
      </div>
      <div className={styles.actionContainerRight}>
        <div className={styles.actionItem}>
          <VerseNotes verseKey={verse.verseKey} isTranslationView hasNotes={hasNotes} />
        </div>
        <div className={classNames(styles.actionItem)}>
          <CopyButton verseKey={verse.verseKey} isTranslationView />
        </div>
        <div className={styles.actionItem}>
          <ShareButton verse={verse} isTranslationView />
        </div>
        <div className={styles.actionItem}>
          <OverflowVerseActionsMenu bookmarksRangeUrl={bookmarksRangeUrl} verse={verse} />
        </div>
      </div>
    </div>
  );
};

export default TopActions;
