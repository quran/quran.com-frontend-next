import React from 'react';

import AddNoteModal from '@/components/Notes/modal/AddNoteModal';
import EditNoteModal from '@/components/Notes/modal/EditNoteModal';
import MyNotesModal from '@/components/Notes/modal/MyNotes';
import { Note } from '@/types/auth/Note';

interface NotesModalsProps {
  modalType: string;
  verseKey: string;
  notesCount: number;
  editingNote: Note | null;
  wasOpenedFromStudyMode: boolean;
  onClose: () => void;
  onBack?: () => void;
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
  onClose,
  onBack,
  onOpenMyNotes,
  onOpenAddNote,
  onOpenEditNote,
}) => (
  <>
    <AddNoteModal
      isModalOpen={modalType === 'addNote'}
      onModalClose={onClose}
      onMyNotes={onOpenMyNotes}
      notesCount={notesCount}
      verseKey={verseKey}
      onBack={wasOpenedFromStudyMode ? onBack : undefined}
    />
    <MyNotesModal
      isOpen={modalType === 'myNotes'}
      onClose={onClose}
      notesCount={notesCount}
      onAddNote={onOpenAddNote}
      onEditNote={onOpenEditNote}
      verseKey={verseKey}
    />
    <EditNoteModal
      note={editingNote}
      isModalOpen={modalType === 'editNote'}
      onModalClose={onClose}
      onMyNotes={onOpenMyNotes}
    />
  </>
);

export default NotesModals;
