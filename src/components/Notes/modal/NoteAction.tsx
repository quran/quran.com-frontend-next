import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/router';

import AddNoteModal from '@/components/Notes/modal/AddNoteModal';
import { CLOSE_POPOVER_AFTER_MS } from '@/components/Notes/modal/constant';
import EditNoteModal from '@/components/Notes/modal/EditNoteModal';
import MyNotesModal from '@/components/Notes/modal/MyNotes';
import useCountRangeNotes from '@/hooks/auth/useCountRangeNotes';
import { Note } from '@/types/auth/Note';
import { isLoggedIn } from '@/utils/auth/login';
import { logEvent } from '@/utils/eventLogger';
import { getChapterWithStartingVerseUrl, getLoginNavigationUrl } from '@/utils/navigation';
import { AudioPlayerMachineContext } from '@/xstate/AudioPlayerMachineContext';

export enum ModalType {
  ADD_NOTE = 'add-note',
  MY_NOTES = 'my-notes',
  EDIT_NOTE = 'edit-note',
}

interface NoteActionControllerProps {
  verseKey: string;
  isTranslationView?: boolean;
  onActionTriggered?: () => void;

  /**
   * Indicates whether the current verse has notes.
   *
   * - `true`  → Notes are known to exist.
   * - `false` → Notes are known not to exist.
   * - `undefined` → The notes state is unknown (caller does not have access to note evaluation),
   *   so the component will internally fetch the notes count to determine it.
   */
  hasNotes?: boolean;

  /**
   * Render prop for the action trigger
   * @param {object} params - Component props
   * @param {() => void} params.onClick - The function to be called when the action is triggered
   * @param {boolean} params.hasNote - Indicates whether the current verse has notes
   * @returns {React.ReactNode} JSX element containing the action trigger
   */
  children: (params: { onClick: () => void; hasNote: boolean }) => React.ReactNode;
}

const NoteActionController: React.FC<NoteActionControllerProps> = ({
  verseKey,
  hasNotes: hasNotesProp,
  onActionTriggered,
  isTranslationView,
  children,
}) => {
  const router = useRouter();
  const audioService = useContext(AudioPlayerMachineContext);

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
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = setTimeout(onActionTriggered, CLOSE_POPOVER_AFTER_MS);
    }
  }, [onActionTriggered, logNoteEvent]);

  const openAddNoteModal = useCallback(() => {
    setActiveModal(ModalType.ADD_NOTE);
    logNoteEvent('open_add_note_modal');
  }, [logNoteEvent]);

  const handleTriggerClick = useCallback(() => {
    if (!isLoggedIn()) {
      audioService.send({ type: 'CLOSE' });
      router.push(getLoginNavigationUrl(getChapterWithStartingVerseUrl(verseKey)));
      logNoteEvent('note_redirect_to_login');
      return;
    }

    openAddNoteModal();
  }, [audioService, router, verseKey, openAddNoteModal, logNoteEvent]);

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
    return () => clearTimeout(closeTimeoutRef.current);
  }, []);

  const hasNote = hasNotesProp || (notesCount?.[verseKey] ?? 0) > 0;

  return (
    <>
      {children({ onClick: handleTriggerClick, hasNote })}

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
        onBack={openMyNotesModal}
        flushNotesList
      />
    </>
  );
};

export default NoteActionController;
