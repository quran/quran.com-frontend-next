import React from 'react';

import TranslationsButton from '../ReadingView/TranslationsButton';

import ActionItem from './ActionItem';
import styles from './TranslationViewCell.module.scss';

import TranslationViewNoteAction from '@/components/Notes/modal/TranslationViewNoteAction';
import CopyButton from '@/components/QuranReader/ReadingView/CopyButton';
import BookmarkAction from '@/components/Verse/BookmarkAction';
import OverflowVerseActionsMenu from '@/components/Verse/OverflowVerseActionsMenu';
import PlayVerseAudioButton from '@/components/Verse/PlayVerseAudioButton';
import ShareButton from '@/components/Verse/ShareButton';
import VerseLink from '@/components/Verse/VerseLink';
import Wrapper from '@/components/Wrapper/Wrapper';
import { WordVerse } from '@/types/Word';

type ActionButtonsProps = {
  verse: WordVerse;
  bookmarksRangeUrl: string;
  hasNotes?: boolean;
  isTranslationView?: boolean;
  openShareModal: () => void;
  hasTranslationsButton?: boolean;
};

/**
 * Common action buttons used in both translation and reading views
 * Extracted to reduce duplication and improve maintainability
 * @returns {JSX.Element} JSX element containing the action buttons
 */
const ActionButtons: React.FC<ActionButtonsProps> = ({
  verse,
  bookmarksRangeUrl,
  hasNotes,
  isTranslationView = true,
  openShareModal,
  hasTranslationsButton = false,
}) => {
  return (
    <>
      <Wrapper
        shouldWrap={isTranslationView}
        wrapper={(children) => <div className={styles.actionContainerLeft}>{children}</div>}
      >
        <>
          <ActionItem>
            <VerseLink verseKey={verse.verseKey} isTranslationView={isTranslationView} />
          </ActionItem>
          <ActionItem>
            <PlayVerseAudioButton verseKey={verse.verseKey} isTranslationView={isTranslationView} />
          </ActionItem>
          <ActionItem>
            <BookmarkAction
              verse={verse}
              isTranslationView={isTranslationView}
              bookmarksRangeUrl={bookmarksRangeUrl}
            />
          </ActionItem>
          {hasTranslationsButton && (
            <ActionItem>
              <TranslationsButton verse={verse} isTranslationView={isTranslationView} />
            </ActionItem>
          )}
        </>
      </Wrapper>

      <Wrapper
        shouldWrap={isTranslationView}
        wrapper={(children) => <div className={styles.actionContainerRight}>{children}</div>}
      >
        <>
          <ActionItem>
            <CopyButton verseKey={verse.verseKey} isTranslationView={isTranslationView} />
          </ActionItem>
          <ActionItem>
            <ShareButton
              verse={verse}
              isTranslationView={isTranslationView}
              isMenu={false}
              onClick={openShareModal}
            />
          </ActionItem>

          <ActionItem>
            <TranslationViewNoteAction
              verseKey={verse.verseKey}
              // Safe guard to ensure hasNotes is a boolean value
              hasNotes={!!hasNotes}
            />
          </ActionItem>

          <ActionItem>
            <OverflowVerseActionsMenu
              bookmarksRangeUrl={bookmarksRangeUrl}
              verse={verse}
              isTranslationView={isTranslationView}
            />
          </ActionItem>
        </>
      </Wrapper>
    </>
  );
};

export default ActionButtons;
