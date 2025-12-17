import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './NoteModal.module.scss';

import ReflectionIntro from '@/components/Notes/modal/ReflectionIntro';
import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import TextArea from '@/dls/Forms/TextArea';
import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import ChevronRightIcon from '@/icons/chevron-right.svg';
import NotesWithPencilIcon from '@/icons/notes-with-pencil.svg';

const NoteModal = () => {
  const { t } = useTranslation('notes');
  const count = 5;

  const [noteInput, setNoteInput] = useState('');
  const errors: Record<string, string> = {};

  return (
    <div className={styles.container}>
      <ReflectionIntro />

      <div className={styles.inputGroup}>
        <TextArea
          id="body"
          name="body"
          placeholder={t('body-placeholder')}
          containerClassName={styles.textArea}
          value={noteInput}
          onChange={setNoteInput}
        />

        {errors.note && <div className={styles.error}>{errors.note}</div>}
      </div>

      {count > 0 && (
        <button type="button" className={styles.notesButton}>
          <IconContainer
            icon={<NotesWithPencilIcon />}
            color={IconColor.default}
            size={IconSize.Custom}
            className={styles.notesButtonPencil}
          />
          <span className={styles.notesButtonText}>{t('save-post-to-qr')}</span>
          <IconContainer
            icon={<ChevronRightIcon />}
            color={IconColor.default}
            size={IconSize.Custom}
            className={styles.notesButtonChevron}
          />
        </button>
      )}

      <div className={styles.actions}>
        <Button
          className={styles.rounded}
          size={ButtonSize.Small}
          variant={ButtonVariant.SimplifiedAccent}
        >
          {t('save-post-to-qr')}
        </Button>
        <Button className={styles.rounded} size={ButtonSize.Small}>
          {t('save-privately')}
        </Button>
      </div>
    </div>
  );
};

export default NoteModal;
