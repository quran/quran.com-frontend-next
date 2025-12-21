import React, { useCallback, useState } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import AddNoteModal from '@/components/Notes/modal/AddNoteModal';
import EditNoteModal from '@/components/Notes/modal/EditNoteModal';
import MyNotesModal from '@/components/Notes/modal/MyNotes/index';
import translationViewStyles from '@/components/QuranReader/TranslationView/TranslationViewCell.module.scss';
import Button, { ButtonShape, ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import useCountRangeNotes from '@/hooks/auth/useCountRangeNotes';
import NotesWithPencilFilledIcon from '@/icons/notes-with-pencil-filled.svg';
import NotesWithPencilIcon from '@/icons/notes-with-pencil.svg';
import { Note } from '@/types/auth/Note';
import { WordVerse } from '@/types/Word';
import { isLoggedIn } from '@/utils/auth/login';
import { getChapterWithStartingVerseUrl, getLoginNavigationUrl } from '@/utils/navigation';

enum ModalType {
  ADD_NOTE = 'add-note',
  MY_NOTES = 'my-notes',
  EDIT_NOTE = 'edit-note',
}

interface NoteActionProps {
  verse: WordVerse;
  // eslint-disable-next-line react/no-unused-prop-types
  onActionTriggered?: () => void;
  // eslint-disable-next-line react/no-unused-prop-types
  isTranslationView: boolean;
  hasNotes: boolean;
}

const NoteAction: React.FC<NoteActionProps> = ({ verse, hasNotes }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const { data: notesCount } = useCountRangeNotes(
    activeModal && { from: verse.verseKey, to: verse.verseKey },
  );

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  const openAddNoteModal = useCallback(() => {
    setActiveModal(ModalType.ADD_NOTE);
  }, []);

  /**
   * Handles click events for guest users, redirecting to login if not authenticated,
   * otherwise opens the add notes modal.
   */
  const handleGuestUserClick = useCallback(() => {
    if (!isLoggedIn()) {
      router.push(getLoginNavigationUrl(getChapterWithStartingVerseUrl(verse.verseKey)));
      return;
    }

    openAddNoteModal();
  }, [router, verse.verseKey, openAddNoteModal]);

  const openMyNotesModal = useCallback(() => {
    setActiveModal(ModalType.MY_NOTES);
  }, []);

  const openEditNoteModal = useCallback((note: Note) => {
    setEditingNote(note);
    setActiveModal(ModalType.EDIT_NOTE);
  }, []);

  return (
    <>
      <Button
        className={classNames(
          translationViewStyles.iconContainer,
          translationViewStyles.verseAction,
        )}
        onClick={handleGuestUserClick}
        tooltip={t('notes:take-a-note-or-reflection')}
        type={ButtonType.Primary}
        shape={ButtonShape.Circle}
        variant={ButtonVariant.Ghost}
        size={ButtonSize.Small}
        ariaLabel={t('notes:take-a-note-or-reflection')}
      >
        <span className={translationViewStyles.icon}>
          <IconContainer
            icon={hasNotes ? <NotesWithPencilFilledIcon /> : <NotesWithPencilIcon />}
            color={IconColor.tertiary}
            size={IconSize.Custom}
          />
        </span>
      </Button>

      <AddNoteModal
        isModalOpen={activeModal === ModalType.ADD_NOTE}
        onModalClose={closeModal}
        onMyNotes={openMyNotesModal}
        notesCount={notesCount?.[verse.verseKey] ?? 0}
        verseKey={verse.verseKey}
      />

      <MyNotesModal
        isOpen={activeModal === ModalType.MY_NOTES}
        onClose={closeModal}
        notesCount={notesCount?.[verse.verseKey] ?? 0}
        onAddNote={openAddNoteModal}
        onEditNote={openEditNoteModal}
        verseKey={verse.verseKey}
      />

      <EditNoteModal
        note={editingNote}
        isModalOpen={activeModal === ModalType.EDIT_NOTE}
        onModalClose={closeModal}
        onMyNotes={openMyNotesModal}
      />
    </>
  );
};

export default NoteAction;
