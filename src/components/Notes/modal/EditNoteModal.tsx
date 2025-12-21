import { useContext } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import modalStyles from './Modal.module.scss';
import styles from './NoteFormModal.module.scss';

import NoteFormModal from '@/components/Notes/modal/NoteFormModal';
import {
  getNoteFromResponse,
  invalidateCache,
  isNotePublishFailed,
} from '@/components/Notes/modal/utility';
import DataContext from '@/contexts/DataContext';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import ArrowIcon from '@/icons/arrow.svg';
import { Note } from '@/types/auth/Note';
import { updateNote } from '@/utils/auth/api';
import { verseRangesToVerseKeys } from '@/utils/verseKeys';

interface EditNoteModalProps {
  note: Note;
  onMyNotes: () => void;
  isModalOpen: boolean;
  onModalClose: () => void;
}

const EditNoteModal: React.FC<EditNoteModalProps> = ({
  note,
  onMyNotes,
  isModalOpen,
  onModalClose,
}) => {
  const chaptersData = useContext(DataContext);
  const { t } = useTranslation('notes');
  const toast = useToast();
  const { mutate, cache } = useSWRConfig();

  const handleSaveNote = async ({
    note: noteBody,
    isPublic,
  }: {
    note: string;
    isPublic: boolean;
  }) => {
    try {
      const data = await updateNote(note.id, noteBody, isPublic);

      if (isNotePublishFailed(data)) {
        toast(t('notes:update-publish-failed'), { status: ToastStatus.Error });
      } else {
        toast(t('notes:update-success'), { status: ToastStatus.Success });
      }

      invalidateCache({
        mutate,
        cache,
        verseKeys: note.ranges ? verseRangesToVerseKeys(chaptersData, note.ranges) : [],
        note: getNoteFromResponse(data),
        invalidateCount: true,
      });
    } catch (error) {
      toast(t('common:error.general'), { status: ToastStatus.Error });
      throw error;
    }
  };

  return (
    <NoteFormModal
      key={JSON.stringify(note ?? {})}
      initialNote={note?.body || ''}
      ranges={note?.ranges}
      isModalOpen={isModalOpen}
      onModalClose={onModalClose}
      onMyNotes={onMyNotes}
      onSaveNote={handleSaveNote}
      showNotesOnVerseButton={false}
      header={
        <button
          type="button"
          className={classNames(styles.headerButton, modalStyles.title)}
          onClick={onMyNotes}
          aria-label={t('common:back')}
        >
          <IconContainer
            icon={<ArrowIcon />}
            shouldForceSetColors={false}
            size={IconSize.Custom}
            className={styles.editIcon}
          />
          {t('edit-note')}
        </button>
      }
    />
  );
};

export default EditNoteModal;
