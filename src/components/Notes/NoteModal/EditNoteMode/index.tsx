import React from 'react';

import NoteListItem from './NoteListItem';

import NoteRanges from '@/components/Notes/NoteModal/EditNoteMode/NoteRanges';
import { Note } from '@/types/auth/Note';

type Props = {
  notes: Note[];
  verseKey: string;
  onNoteUpdated?: (data: Note) => void;
  onNoteDeleted?: () => void;
  noteId: string;
};

const EditNoteMode: React.FC<Props> = ({
  notes,
  verseKey,
  onNoteUpdated,
  onNoteDeleted,
  noteId,
}) => {
  return (
    <>
      {notes[0]?.ranges && <NoteRanges ranges={notes[0].ranges} />}
      {notes.map((note) => {
        return (
          <NoteListItem
            verseKey={verseKey}
            onNoteUpdated={onNoteUpdated}
            onNoteDeleted={onNoteDeleted}
            key={note.id}
            noteId={noteId}
            note={note}
          />
        );
      })}
    </>
  );
};

export default EditNoteMode;
