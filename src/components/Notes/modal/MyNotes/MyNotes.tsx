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
import { GetAllNotesResponse, Note } from '@/types/auth/Note';
import NotesSortOption from '@/types/NotesSortOptions';
import { privateFetcher } from '@/utils/auth/api';
import { makeNotesUrl } from '@/utils/auth/apiPaths';
import { getLangFullLocale } from '@/utils/locale';
import { readableVerseRanges } from '@/utils/verseKeys';

interface MyNotesProps {
  onAddNote: () => void;
  onEditNote: (note: Note) => void;
}

const MyNotes: React.FC<MyNotesProps> = ({ onAddNote, onEditNote }) => {
  const { t, lang } = useTranslation('notes');
  const chaptersData = useContext(DataContext);

  const { data, error, isValidating } = useSWR<GetAllNotesResponse>(
    makeNotesUrl({ sortBy: NotesSortOption.Newest, limit: 50 }),
    (key) => privateFetcher<GetAllNotesResponse>(key),
    {
      revalidateOnFocus: false,
      revalidateOnMount: false,
    },
  );

  const formatNoteTitle = useCallback(
    (note: Note) => {
      if (!note.ranges || note.ranges.length === 0) return '';
      return readableVerseRanges(note.ranges, chaptersData, lang);
    },
    [chaptersData, lang],
  );

  const notes: Note[] = data?.data ?? [];
  const isLoading = isValidating && !data;

  return (
    <div className={styles.container}>
      {isLoading && (
        <div className={styles.loadingContainer}>
          <Spinner shouldDelayVisibility size={SpinnerSize.Large} />
        </div>
      )}
      {error && <div className={styles.errorContainer}>{t('common:error.general')}</div>}
      {!isLoading && !error && (
        <div className={styles.notesList}>
          {notes.length === 0 ? (
            <div className={styles.emptyState}>{t('empty-notes')}</div>
          ) : (
            notes.map((note) => (
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
            ))
          )}
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
