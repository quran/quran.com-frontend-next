import React, { useCallback, useContext, useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import useSWR from 'swr';

import DeleteNoteButton from './DeleteNoteButton';
import styles from './MyNotes.module.scss';

import DataContext from '@/contexts/DataContext';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import ConfirmationModal from '@/dls/ConfirmationModal/ConfirmationModal';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import EditIcon from '@/icons/edit.svg';
import PlusIcon from '@/icons/plus.svg';
import QRColoredIcon from '@/icons/qr-colored.svg';
import { AttachedEntityType, Note } from '@/types/auth/Note';
import ZIndexVariant from '@/types/enums/ZIndexVariant';
import { getNotesByVerse } from '@/utils/auth/api';
import { makeGetNotesByVerseUrl } from '@/utils/auth/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';
import { getLangFullLocale, toLocalizedNumber } from '@/utils/locale';
import { getQuranReflectPostUrl } from '@/utils/quranReflect/navigation';
import { readableVerseRangeKeys } from '@/utils/verseKeys';

interface MyNotesProps {
  onAddNote: () => void;
  onEditNote: (note: Note) => void;
  verseKey: string;
}

const MyNotes: React.FC<MyNotesProps> = ({ onAddNote, onEditNote, verseKey }) => {
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

  const notes = useMemo(() => {
    const notesArray = Array.isArray(data) ? data : [];

    return notesArray.map((note) => {
      const attachedEntities = note.attachedEntities || [];
      const attachedEntity = attachedEntities.findLast(
        (entity) => entity.type === AttachedEntityType.REFLECTION,
      );
      const postUrl = attachedEntity ? getQuranReflectPostUrl(attachedEntity.id) : undefined;
      return { ...note, postUrl };
    });
  }, [data]);

  const showEmptyState = !isLoading && !error && notes.length === 0;
  const showStatus = isLoading || error || showEmptyState;

  return (
    <div className={styles.container} data-testid="my-notes-modal-content">
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
                <div>
                  <h3 className={styles.noteTitle}>{formatNoteTitle(note)}</h3>
                  <time
                    className={styles.noteDate}
                    dateTime={new Date(note.createdAt).toISOString()}
                  >
                    {formatNoteDate(note.createdAt, lang)}
                  </time>
                </div>
                <div className={styles.noteActions}>
                  {note.postUrl && (
                    <Button
                      variant={ButtonVariant.Ghost}
                      size={ButtonSize.Small}
                      shape={ButtonShape.Square}
                      isNewTab
                      href={note.postUrl}
                      tooltip={t('view-on-qr')}
                      ariaLabel={t('view-on-qr')}
                      onClick={() => logButtonClick('qr_view_note_post')}
                      data-testid="qr-view-button"
                    >
                      <QRColoredIcon />
                    </Button>
                  )}

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
    </div>
  );
};

const formatNoteDate = (date: Date | string | number, locale: string) => {
  const dateInstance = new Date(date);
  return dateInstance.toLocaleDateString(getLangFullLocale(locale), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export default MyNotes;
