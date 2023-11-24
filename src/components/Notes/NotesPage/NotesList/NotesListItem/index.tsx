import React from 'react';

import styles from './NotesListItem.module.scss';

import { Note } from '@/types/auth/Note';
import { logButtonClick } from '@/utils/eventLogger';

type Props = {
  note: Note;
  setSelectedNoteId: (noteId: string) => void;
};

const NotesListItem: React.FC<Props> = ({ note, setSelectedNoteId }) => {
  const onNoteContainerClicked = (noteId: string) => {
    logButtonClick('note_list_item', {
      noteId,
    });
    setSelectedNoteId(noteId);
  };
  return (
    <div
      className={styles.note}
      key={note.id}
      role="button"
      tabIndex={0}
      onClick={() => onNoteContainerClicked(note.id)}
      onKeyDown={() => onNoteContainerClicked(note.id)}
    >
      <h3>{note.title}</h3>
      <p>{note.body}</p>
    </div>
  );
};

export default NotesListItem;
