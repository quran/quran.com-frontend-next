import React, { useCallback, useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './Card.module.scss';

import InlineShowMore from '@/components/InlineShowMore';
import DeleteNoteButton from '@/components/Notes/modal/MyNotes/DeleteNoteButton';
import QRButton from '@/components/Notes/modal/MyNotes/QrButton';
import DataContext from '@/contexts/DataContext';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import EditIcon from '@/icons/edit.svg';
import { Note } from '@/types/auth/Note';
import { toSafeISOString, dateToMonthDayYearFormat } from '@/utils/datetime';
import { toLocalizedNumber } from '@/utils/locale';
import { readableVerseRangeKeys } from '@/utils/verseKeys';

export type NoteWithPostUrl = Note & { postUrl?: string };

export interface NoteCardProps {
  note: NoteWithPostUrl;
  onEdit: (note: Note) => void;
  onPostToQr: (note: Note) => void;
  onDelete: (note: Note) => void;
  isDeletingNote: boolean;
  showReadMore?: boolean;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onPostToQr,
  onDelete,
  isDeletingNote,
  showReadMore = false,
}) => {
  const { t, lang } = useTranslation('notes');
  const chaptersData = useContext(DataContext);

  const formatNoteTitle = useCallback(
    (noteWithPostUrl: NoteWithPostUrl) => {
      if (!noteWithPostUrl.ranges || noteWithPostUrl.ranges.length === 0) return '';
      const readableRangeKeys = readableVerseRangeKeys(noteWithPostUrl.ranges, chaptersData, lang);
      if (readableRangeKeys.length === 0) return '';
      if (readableRangeKeys.length === 1) return readableRangeKeys[0];
      return `${readableRangeKeys[0]} + ${toLocalizedNumber(readableRangeKeys.length - 1, lang)}`;
    },
    [chaptersData, lang],
  );

  return (
    <div key={note.id} className={styles.noteCard} data-testid={`note-card-${note.id}`}>
      <div className={styles.noteHeader}>
        <div className={styles.noteInfo}>
          <h3 className={styles.noteTitle}>{formatNoteTitle(note)}</h3>
          <time className={styles.noteDate} dateTime={toSafeISOString(note.createdAt)}>
            {dateToMonthDayYearFormat(note.createdAt, lang)}
          </time>
        </div>
        <div className={styles.noteActions}>
          <QRButton note={note} postUrl={note.postUrl} onPostToQrClick={onPostToQr} />

          <Button
            variant={ButtonVariant.Ghost}
            size={ButtonSize.Small}
            shape={ButtonShape.Square}
            onClick={() => onEdit(note)}
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

          <DeleteNoteButton
            note={note}
            onDeleteNoteClick={onDelete}
            isDeletingNote={isDeletingNote}
          />
        </div>
      </div>

      <InlineShowMore
        lines={2}
        contentClassName={styles.noteText}
        showReadMore={showReadMore}
        data-testid="note-text"
      >
        {note.body}
      </InlineShowMore>
    </div>
  );
};

export default NoteCard;
