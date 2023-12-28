import React from 'react';

import NoteListItem from './NoteListItem';

import { Note } from '@/types/auth/Note';

type Props = {
  notes: Note[];
  verseKey: string;
  onNoteUpdated?: (data: Note) => void;
  noteId: string;
};

const EditNoteMode: React.FC<Props> = ({ notes, verseKey, onNoteUpdated, noteId }) => {
  return (
    <>
      {notes.map((note) => {
        return (
          <NoteListItem
            verseKey={verseKey}
            onNoteUpdated={onNoteUpdated}
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
