import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './NotesListItem.module.scss';

import NoteRangesIndicator from '@/components/Notes/NoteModal/NoteRangesIndicator';
import { Note } from '@/types/auth/Note';
import { dateToReadableFormat } from '@/utils/datetime';
import { logButtonClick } from '@/utils/eventLogger';
import { truncateString } from '@/utils/string';

interface NotesListItemProps {
  note: Note;
  setSelectedNoteId: (noteId: string) => void;
}

const MAX_BODY_SIZE = 250;

const NotesListItem: React.FC<NotesListItemProps> = ({ note, setSelectedNoteId }) => {
  const { lang, t } = useTranslation('notes');

  const onNoteClicked = (noteId: string) => {
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
      onClick={() => onNoteClicked(note.id)}
      onKeyDown={() => onNoteClicked(note.id)}
    >
      <NoteRangesIndicator ranges={note.ranges} />
      <p className={styles.itemBody}>
        {truncateString(note.body, MAX_BODY_SIZE, '...')}
        {note.body.length > MAX_BODY_SIZE && (
          <span className={styles.seeMore}>{`  ${t('click-to-see-more')}`}</span>
        )}
      </p>
      <time className={styles.noteDate} dateTime={note.createdAt.toString()}>
        {dateToReadableFormat(note.createdAt, lang, {
          year: 'numeric',
        })}
      </time>
    </div>
  );
};

export default NotesListItem;
