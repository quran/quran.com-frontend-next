import React from 'react';

import AddNoteModal from '@/components/Notes/modal/AddNoteModal';
import EditNoteModal from '@/components/Notes/modal/EditNoteModal';
import MyNotesModal from '@/components/Notes/modal/MyNotes';
import { VerseActionModalType as ModalType } from '@/redux/slices/QuranReader/verseActionModal';
import { Note } from '@/types/auth/Note';

interface NotesModalsProps {
  modalType: ModalType;
  verseKey: string;
  notesCount: number;
  editingNote: Note | null;
  wasOpenedFromStudyMode: boolean;
  previousModalType: ModalType | null;
  onClose: () => void;
  onBack?: () => void;
  onBackToBookmark?: () => void;
  onOpenMyNotes: () => void;
  onOpenAddNote: () => void;
  onOpenEditNote: (note: Note) => void;
}

const NotesModals: React.FC<NotesModalsProps> = ({
  modalType,
  verseKey,
  notesCount,
  editingNote,
  wasOpenedFromStudyMode,
  previousModalType,
  onClose,
  onBack,
  onBackToBookmark,
  onOpenMyNotes,
  onOpenAddNote,
  onOpenEditNote,
}) => {
  const getBackHandler = () => {
    if (previousModalType === ModalType.SAVE_BOOKMARK) return onBackToBookmark;
    if (wasOpenedFromStudyMode) return onBack;
    return undefined;
  };

  const getOnMyNotesHandler = () => {
    if (previousModalType === ModalType.SAVE_BOOKMARK) return onBackToBookmark;
    return onOpenMyNotes;
  };

  return (
    <>
      <AddNoteModal
        isModalOpen={modalType === ModalType.ADD_NOTE}
        onModalClose={onClose}
        onMyNotes={getOnMyNotesHandler()}
        notesCount={notesCount}
        verseKey={verseKey}
        onBack={getBackHandler()}
      />
      <MyNotesModal
        isOpen={modalType === ModalType.MY_NOTES}
        onClose={onClose}
        notesCount={notesCount}
        onAddNote={onOpenAddNote}
        onEditNote={onOpenEditNote}
        verseKey={verseKey}
      />
      <EditNoteModal
        note={editingNote}
        isModalOpen={modalType === ModalType.EDIT_NOTE}
        onModalClose={onClose}
        onMyNotes={onOpenMyNotes}
        onBack={onOpenMyNotes}
      />
    </>
  );
};

export default NotesModals;
