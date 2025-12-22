import React, { useCallback, useEffect, useRef, useState } from 'react';

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
import { isLoggedIn } from '@/utils/auth/login';
import { logEvent } from '@/utils/eventLogger';
import { getChapterWithStartingVerseUrl, getLoginNavigationUrl } from '@/utils/navigation';

enum ModalType {
  ADD_NOTE = 'add-note',
  MY_NOTES = 'my-notes',
  EDIT_NOTE = 'edit-note',
}

const CLOSE_POPOVER_AFTER_MS = 150;

interface NoteActionProps {
  verseKey: string;
  onActionTriggered?: () => void;
  isTranslationView?: boolean;

  /**
   * Indicates whether the current verse has notes.
   *
   * - `true`  → Notes are known to exist.
   * - `false` → Notes are known not to exist.
   * - `undefined` → The notes state is unknown (caller does not have access to note evaluation),
   *   so the component will internally fetch the notes count to determine it.
   */
  hasNotes?: boolean;
}

const NoteAction: React.FC<NoteActionProps> = ({
  verseKey,
  hasNotes: hasNotesProp,
  onActionTriggered,
  isTranslationView,
}) => {
  const router = useRouter();
  const { t } = useTranslation('notes');
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const { data: notesCount } = useCountRangeNotes(
    activeModal || hasNotesProp === undefined ? { from: verseKey, to: verseKey } : null,
  );

  const logNoteEvent = useCallback(
    (event: string) => {
      logEvent(isTranslationView ? `translation_view_${event}` : `reading_view_${event}`);
    },
    [isTranslationView],
  );

  const closeModal = useCallback(() => {
    setActiveModal(null);
    logNoteEvent('close_notes_modal');

    if (onActionTriggered) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }

      closeTimeoutRef.current = setTimeout(() => {
        onActionTriggered();
      }, CLOSE_POPOVER_AFTER_MS);
    }
  }, [onActionTriggered, logNoteEvent]);

  const openAddNoteModal = useCallback(() => {
    setActiveModal(ModalType.ADD_NOTE);
  }, []);

  /**
   * Handles click events for guest users, redirecting to login if not authenticated,
   * otherwise opens the add notes modal.
   */
  const handleGuestUserClick = useCallback(() => {
    if (!isLoggedIn()) {
      router.push(getLoginNavigationUrl(getChapterWithStartingVerseUrl(verseKey)));
      logNoteEvent('note_redirect_to_login');
      return;
    }

    openAddNoteModal();
    logNoteEvent('open_add_note_modal');
  }, [router, verseKey, openAddNoteModal, logNoteEvent]);

  const openMyNotesModal = useCallback(() => {
    setActiveModal(ModalType.MY_NOTES);
    logNoteEvent('open_my_notes_modal');
  }, [logNoteEvent]);

  const openEditNoteModal = useCallback(
    (note: Note) => {
      setEditingNote(note);
      setActiveModal(ModalType.EDIT_NOTE);
      logNoteEvent('open_edit_note_modal');
    },
    [logNoteEvent],
  );

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const hasNote = hasNotesProp || notesCount?.[verseKey] > 0;

  return (
    <>
      <Button
        className={classNames(
          translationViewStyles.iconContainer,
          translationViewStyles.verseAction,
        )}
        onClick={handleGuestUserClick}
        tooltip={t('take-a-note-or-reflection')}
        type={ButtonType.Primary}
        shape={ButtonShape.Circle}
        variant={ButtonVariant.Ghost}
        size={ButtonSize.Small}
        ariaLabel={t('take-a-note-or-reflection')}
      >
        <span className={translationViewStyles.icon}>
          <IconContainer
            icon={hasNote ? <NotesWithPencilFilledIcon /> : <NotesWithPencilIcon />}
            color={IconColor.tertiary}
            size={IconSize.Custom}
          />
        </span>
      </Button>

      <AddNoteModal
        isModalOpen={activeModal === ModalType.ADD_NOTE}
        onModalClose={closeModal}
        onMyNotes={openMyNotesModal}
        notesCount={notesCount?.[verseKey] ?? 0}
        verseKey={verseKey}
      />

      <MyNotesModal
        isOpen={activeModal === ModalType.MY_NOTES}
        onClose={closeModal}
        notesCount={notesCount?.[verseKey] ?? 0}
        onAddNote={openAddNoteModal}
        onEditNote={openEditNoteModal}
        verseKey={verseKey}
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
