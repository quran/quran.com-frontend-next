import React, { useEffect, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import useSWR from 'swr';

import styles from './MyNotes.module.scss';

import NoteCard from '@/components/Notes/modal/MyNotes/Card/NoteCard';
import Button, { ButtonSize } from '@/dls/Button/Button';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import PlusIcon from '@/icons/plus.svg';
import { AttachedEntityType, Note } from '@/types/auth/Note';
import { getNotesByVerse } from '@/utils/auth/api';
import { makeGetNotesByVerseUrl } from '@/utils/auth/apiPaths';
import { getQuranReflectPostUrl } from '@/utils/quranReflect/navigation';

type NoteWithPostUrl = Note & { postUrl?: string };

interface MyNotesProps {
  onAddNote: () => void;
  onEditNote: (note: Note) => void;
  verseKey: string;
  deletingNoteId: string | undefined;
  processingNoteId: string | undefined;
  onPostToQrClick: (note: Note) => void;
  onDeleteNoteClick: (note: Note) => void;
}

const MyNotes: React.FC<MyNotesProps> = ({
  onAddNote,
  onEditNote,
  verseKey,
  deletingNoteId,
  processingNoteId,
  onPostToQrClick,
  onDeleteNoteClick,
}) => {
  const { t } = useTranslation('notes');

  const { data, error } = useSWR(
    makeGetNotesByVerseUrl(verseKey),
    () => getNotesByVerse(verseKey),
    { revalidateOnFocus: false, revalidateOnReconnect: false, revalidateIfStale: false },
  );

  const isLoading = !data && !error;

  const notes = useMemo((): NoteWithPostUrl[] => {
    const notesArray = Array.isArray(data) ? data : [];

    return notesArray.map((note) => {
      const attachedEntities = note.attachedEntities || [];

      /** Find the last reflection entity. */
      const attachedEntity = attachedEntities
        .slice()
        .reverse()
        .find((entity) => entity.type === AttachedEntityType.REFLECTION);

      const postUrl = attachedEntity ? getQuranReflectPostUrl(attachedEntity.id) : undefined;
      return { ...note, postUrl };
    });
  }, [data]);

  const showEmptyState = !isLoading && !error && notes.length === 0;
  const showStatus = isLoading || error || showEmptyState;

  useEffect(() => {
    if (processingNoteId) {
      const noteElement = document.querySelector(`[data-testid="note-card-${processingNoteId}"]`);
      if (noteElement) noteElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [processingNoteId]);

  return (
    <>
      {showStatus ? (
        <div className={styles.statusContainer} data-error={!!error}>
          {isLoading && <Spinner size={SpinnerSize.Large} />}
          {error && t('common:error.general')}
          {showEmptyState && t('empty-notes')}
        </div>
      ) : (
        <div className={styles.notesList}>
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={onEditNote}
              onPostToQr={onPostToQrClick}
              onDelete={onDeleteNoteClick}
              isDeletingNote={note.id === deletingNoteId}
            />
          ))}
        </div>
      )}

      <div className={styles.actions}>
        <Button
          className={styles.addNoteButton}
          size={ButtonSize.Small}
          prefix={<PlusIcon />}
          onClick={onAddNote}
          data-testid="add-another-note-button"
        >
          {t('add-another-note')}
        </Button>
      </div>
    </>
  );
};

export default MyNotes;
