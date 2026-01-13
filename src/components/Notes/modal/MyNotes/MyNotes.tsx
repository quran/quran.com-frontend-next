import React, { useCallback, useContext, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import useSWR from 'swr';

import DeleteNoteButton from './DeleteNoteButton';
import styles from './MyNotes.module.scss';

import QRButton from '@/components/Notes/modal/MyNotes/QrButton';
import DataContext from '@/contexts/DataContext';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import ConfirmationModal from '@/dls/ConfirmationModal/ConfirmationModal';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import EditIcon from '@/icons/edit.svg';
import PlusIcon from '@/icons/plus.svg';
import { AttachedEntityType, Note } from '@/types/auth/Note';
import ZIndexVariant from '@/types/enums/ZIndexVariant';
import { getNotesByVerse } from '@/utils/auth/api';
import { makeGetNotesByVerseUrl } from '@/utils/auth/apiPaths';
import { toSafeISOString, dateToMonthDayYearFormat } from '@/utils/datetime';
import { toLocalizedNumber } from '@/utils/locale';
import { getQuranReflectPostUrl } from '@/utils/quranReflect/navigation';
import { readableVerseRangeKeys } from '@/utils/verseKeys';

type NoteWithPostUrl = Note & { postUrl?: string };

interface MyNotesProps {
  onAddNote: () => void;
  onEditNote: (note: Note) => void;
  verseKey: string;
  onPostToQrClick: (note: Note) => void;
}

const MyNotes: React.FC<MyNotesProps> = ({ onAddNote, onEditNote, verseKey, onPostToQrClick }) => {
  const { t, lang } = useTranslation('notes');
  const chaptersData = useContext(DataContext);

  const { data, error } = useSWR(
    makeGetNotesByVerseUrl(verseKey),
    () => getNotesByVerse(verseKey),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    },
  );

  const formatNoteTitle = useCallback(
    (note: Note) => {
      if (!note.ranges || note.ranges.length === 0) return '';
      const readableRangeKeys = readableVerseRangeKeys(note.ranges, chaptersData, lang);
      if (readableRangeKeys.length === 0) return '';
      if (readableRangeKeys.length === 1) return readableRangeKeys[0];
      return `${readableRangeKeys[0]} + ${toLocalizedNumber(readableRangeKeys.length - 1, lang)}`;
    },
    [chaptersData, lang],
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
            <div key={note.id} className={styles.noteCard} data-testid={`note-card-${note.id}`}>
              <div className={styles.noteHeader}>
                <div className={styles.noteInfo}>
                  <h3 className={styles.noteTitle}>{formatNoteTitle(note)}</h3>
                  <time className={styles.noteDate} dateTime={toSafeISOString(note.createdAt)}>
                    {dateToMonthDayYearFormat(note.createdAt, lang)}
                  </time>
                </div>
                <div className={styles.noteActions}>
                  <QRButton note={note} postUrl={note.postUrl} onPostToQrClick={onPostToQrClick} />

                  <Button
                    variant={ButtonVariant.Ghost}
                    size={ButtonSize.Small}
                    shape={ButtonShape.Square}
                    onClick={() => onEditNote(note)}
                    tooltip={t('common:edit')}
                    ariaLabel={t('common:edit')}
                    data-testid="edit-note-button"
                  >
                    <IconContainer
                      icon={<EditIcon />}
                      shouldForceSetColors={false}
                      size={IconSize.Xsmall}
                      className={styles.actionIcon}
                    />
                  </Button>

                  <DeleteNoteButton note={note} />
                </div>
              </div>

              <p className={styles.noteText} data-testid="note-text">
                {note.body}
              </p>
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal zIndexVariant={ZIndexVariant.ULTRA} />

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
