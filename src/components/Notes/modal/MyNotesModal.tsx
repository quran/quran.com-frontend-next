import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import modalStyles from './Modal.module.scss';
import styles from './MyNotesModal.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import ContentModal from '@/dls/ContentModal/ContentModal';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import DeleteIcon from '@/icons/delete.svg';
import EditIcon from '@/icons/edit.svg';
import PlusIcon from '@/icons/plus.svg';
import QRColoredIcon from '@/icons/qr-colored.svg';
import { Note } from '@/types/auth/Note';
import { getLangFullLocale } from '@/utils/locale';

interface MyNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNote: () => void;
  onEditNote: (note: Note) => void;
  notesCount?: number;
}

const MyNotesModal: React.FC<MyNotesModalProps> = ({
  isOpen,
  onClose,
  onAddNote,
  onEditNote,
  notesCount = 1,
}) => {
  const { t, lang } = useTranslation('notes');

  // Mock data for design purposes
  const notes: Note[] = Array.from({ length: 10 }, (n, index) => ({
    id: `note-${index + 1}`,
    title: `Note ${index + 1}`,
    body: `This is one of my favourite verses of the Quran! (example note ${index + 1})`,
    verseKey: `108:${index + 1}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    saveToQR: false,
  }));

  return (
    <ContentModal
      isOpen={isOpen}
      onClose={onClose}
      onEscapeKeyDown={onClose}
      hasCloseButton
      header={<h2 className={modalStyles.title}>{t('my-notes', { count: notesCount })}</h2>}
      contentClassName={modalStyles.content}
      overlayClassName={modalStyles.overlay}
    >
      <div className={styles.container}>
        <div className={styles.notesList}>
          {notes.map((note) => (
            <div key={note.id} className={styles.noteCard}>
              <div className={styles.noteHeader}>
                <div>
                  <h3 className={styles.noteTitle}>{note.verseKey}</h3>
                  <p className={styles.noteDate}>{formatNoteDate(note.createdAt, lang)}</p>
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

        <div className={styles.actions}>
          <Button size={ButtonSize.Small} prefix={<PlusIcon />} onClick={onAddNote}>
            {t('add-another-note')}
          </Button>
        </div>
      </div>
    </ContentModal>
  );
};

const formatNoteDate = (date: Date, locale: string) => {
  return date.toLocaleDateString(getLangFullLocale(locale), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export default MyNotesModal;
