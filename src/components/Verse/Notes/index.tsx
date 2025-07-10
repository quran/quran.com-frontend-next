import { useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import NoteModal from '@/components/Notes/NoteModal';
import styles from '@/components/QuranReader/TranslationView/TranslationViewCell.module.scss';
import Button, { ButtonShape, ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import useAudioNavigation from '@/hooks/useAudioNavigation';
import EmptyNotesIcon from '@/icons/notes-empty.svg';
import NotesIcon from '@/icons/notes-filled.svg';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { getChapterWithStartingVerseUrl } from '@/utils/navigation';

export enum VerseNotesTrigger {
  IconButton = 'button',
  PopoverItem = 'popoverItem',
}

type VerseNotesProps = {
  verseKey: string;
  isTranslationView: boolean;
  hasNotes?: boolean;
};

const VerseNotes = ({ verseKey, isTranslationView, hasNotes }: VerseNotesProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation('common');
  const { navigateWithAudioHandling } = useAudioNavigation();

  const onItemClicked = () => {
    const isUserLoggedIn = isLoggedIn();
    logButtonClick('verse_actions_menu_note', {
      isTranslationView,
      isLoggedIn,
    });

    if (!isUserLoggedIn) {
      try {
        navigateWithAudioHandling(getChapterWithStartingVerseUrl(verseKey))();
      } catch {
        // If there's an error parsing the verseKey, navigate to chapter 1
        navigateWithAudioHandling('/1')();
      }
    } else {
      setIsModalOpen(true);
    }
  };

  const onModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        className={classNames(styles.iconContainer, styles.verseAction, {
          [styles.fadedVerseAction]: isTranslationView,
        })}
        onClick={onItemClicked}
        tooltip={t('notes.title')}
        type={ButtonType.Primary}
        shape={ButtonShape.Circle}
        variant={ButtonVariant.Ghost}
        size={ButtonSize.Small}
        ariaLabel={t('notes.title')}
      >
        <span className={styles.icon}>{hasNotes ? <NotesIcon /> : <EmptyNotesIcon />}</span>
      </Button>

      <NoteModal
        isOpen={isModalOpen}
        onClose={onModalClose}
        verseKey={verseKey}
        isOverlayMax
        isBottomSheetOnMobile
      />
    </>
  );
};

export default VerseNotes;
