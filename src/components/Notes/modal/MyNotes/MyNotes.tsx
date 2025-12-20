import React, { useCallback, useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';
import useSWR from 'swr';

import styles from './MyNotes.module.scss';

import DataContext from '@/contexts/DataContext';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import DeleteIcon from '@/icons/delete.svg';
import EditIcon from '@/icons/edit.svg';
import PlusIcon from '@/icons/plus.svg';
import QRColoredIcon from '@/icons/qr-colored.svg';
import { Note } from '@/types/auth/Note';
import { getNotesByVerse } from '@/utils/auth/api';
import { getLangFullLocale } from '@/utils/locale';
import { readableVerseRanges } from '@/utils/verseKeys';

interface MyNotesProps {
  onAddNote: () => void;
  onEditNote: (note: Note) => void;
  verseKey: string;
}

const MyNotes: React.FC<MyNotesProps> = ({ onAddNote, onEditNote, verseKey }) => {
  const { t, lang } = useTranslation('notes');
  const chaptersData = useContext(DataContext);

  const { data, error, isValidating } = useSWR(verseKey, getNotesByVerse, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
  });

  const formatNoteTitle = useCallback(
    (note: Note) => {
      if (!note.ranges || note.ranges.length === 0) return '';
      return readableVerseRanges(note.ranges, chaptersData, lang);
    },
    [chaptersData, lang],
  );

  const notes: Note[] = Array.isArray(data) ? data : [];
  const isLoading = isValidating && !data && !error;

  const showEmptyState = !isLoading && !error && notes.length === 0;
  const showStatus = isLoading || error || showEmptyState;

  return (
    <div className={styles.container}>
      {showStatus ? (
        <div className={styles.statusContainer} data-error={!!error}>
          {isLoading && <Spinner shouldDelayVisibility size={SpinnerSize.Large} />}
          {error && t('common:error.general')}
          {showEmptyState && t('empty-notes')}
        </div>
      ) : (
        <div className={styles.notesList}>
          {notes.map((note) => (
            <div key={note.id} className={styles.noteCard}>
              <div className={styles.noteHeader}>
                <div>
                  <h3 className={styles.noteTitle}>{formatNoteTitle(note)}</h3>
                  <time className={styles.noteDate} dateTime={note.createdAt.toString()}>
                    {formatNoteDate(note.createdAt, lang)}
                  </time>
                </div>
                <div className={styles.noteActions}>
                  <Button
                    variant={ButtonVariant.Ghost}
                    size={ButtonSize.Small}
                    shape={ButtonShape.Square}
                  >
                    <QRColoredIcon />
                  </Button>
                  <Button
                    variant={ButtonVariant.Ghost}
                    size={ButtonSize.Small}
                    shape={ButtonShape.Square}
                    onClick={() => onEditNote(note)}
                  >
                    <IconContainer
                      icon={<EditIcon />}
                      shouldForceSetColors={false}
                      size={IconSize.Xsmall}
                      className={styles.actionIcon}
                    />
                  </Button>
                  <Button
                    variant={ButtonVariant.Ghost}
                    size={ButtonSize.Small}
                    shape={ButtonShape.Square}
                  >
                    <IconContainer
                      icon={<DeleteIcon />}
                      shouldForceSetColors={false}
                      size={IconSize.Xsmall}
                      className={styles.actionIcon}
                    />
                  </Button>
                </div>
              </div>

              <p className={styles.noteText}>{note.body}</p>
            </div>
          ))}
        </div>
      )}

      <div className={styles.actions}>
        <Button size={ButtonSize.Small} prefix={<PlusIcon />} onClick={onAddNote}>
          {t('add-another-note')}
        </Button>
      </div>
    </div>
  );
};

const formatNoteDate = (date: Date, locale: string) => {
  const dateInstance = new Date(date);
  return dateInstance.toLocaleDateString(getLangFullLocale(locale), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export default MyNotes;
