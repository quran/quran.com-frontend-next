import React, { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import NewNoteMode from '../NewNoteMode';

import EditNoteListItem from './EditNoteListItem';
import styles from './EditNoteMode.module.scss';

import NoteRanges from '@/components/Notes/NoteModal/EditNoteMode/NoteRanges';
import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import PlusIcon from '@/icons/plus.svg';
import { Note } from '@/types/auth/Note';
import { dateToReadableFormat } from '@/utils/datetime';
import { logButtonClick } from '@/utils/eventLogger';

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
  const { t, lang } = useTranslation('notes');
  const [shouldShowShowAddNoteForm, setShouldShowAddNoteForm] = useState(false);

  const onAddNoteClicked = () => {
    logButtonClick('add_more_notes_button');
    setShouldShowAddNoteForm(true);
  };

  const onCloseAddNoteClicked = () => {
    logButtonClick('close_add_more_notes_button');
    setShouldShowAddNoteForm(false);
  };

  const onSuccess = () => {
    setShouldShowAddNoteForm(false);
  };

  return (
    <div className={styles.container}>
      {!noteId && (
        <>
          {shouldShowShowAddNoteForm ? (
            <div className={styles.addNoteContainer}>
              <div className={styles.addNoteContainerHeader}>
                <p>{t('add-another-note')}</p>
                <Button
                  variant={ButtonVariant.Ghost}
                  size={ButtonSize.Small}
                  onClick={onCloseAddNoteClicked}
                  tooltip={t('common:close')}
                  // eslint-disable-next-line i18next/no-literal-string
                >
                  X
                </Button>
              </div>
              <NewNoteMode verseKey={verseKey} onSuccess={onSuccess} />
            </div>
          ) : (
            <div className={styles.addNoteBtnContainer}>
              <Button size={ButtonSize.Small} prefix={<PlusIcon />} onClick={onAddNoteClicked}>
                {t('add-another-note')}
              </Button>
            </div>
          )}
        </>
      )}
      {notes.map((note, index) => {
        return (
          <div key={note.id}>
            <div className={styles.noteHeaderContainer}>
              <p>{`${t('notes:note')} ${index + 1}`}</p>
              <time className={styles.noteDate} dateTime={note.createdAt.toString()}>
                {dateToReadableFormat(note.createdAt, lang, {
                  year: 'numeric',
                  weekday: undefined,
                  month: 'short',
                })}
              </time>
            </div>
            {note?.ranges && <NoteRanges ranges={note.ranges} />}
            <EditNoteListItem
              verseKey={verseKey}
              onNoteUpdated={onNoteUpdated}
              onNoteDeleted={onNoteDeleted}
              key={note.id}
              noteId={noteId}
              note={note}
            />
          </div>
        );
      })}
    </div>
  );
};

export default EditNoteMode;
