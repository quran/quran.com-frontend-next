import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import modalStyles from './Modal.module.scss';

import Header from '@/components/Notes/modal/Header';
import NoteFormModal from '@/components/Notes/modal/NoteFormModal';
import {
  getNoteFromResponse,
  invalidateCache,
  isNotePublishFailed,
} from '@/components/Notes/modal/utility';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { addNote } from '@/utils/auth/api';

interface AddNoteModalProps {
  notesCount?: number;
  onMyNotes: () => void;
  isModalOpen: boolean;
  onModalClose: () => void;
  verseKey: string;
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({
  notesCount = 0,
  onMyNotes,
  isModalOpen,
  onModalClose,
  verseKey,
}) => {
  const { t } = useTranslation('notes');
  const toast = useToast();
  const { mutate, cache } = useSWRConfig();

  const handleSaveNote = async ({ note, isPublic }: { note: string; isPublic: boolean }) => {
    try {
      const data = await addNote({
        body: note,
        ranges: [`${verseKey}-${verseKey}`],
        saveToQR: isPublic,
      });

      if (isNotePublishFailed(data)) {
        toast(t('notes:save-publish-failed'), { status: ToastStatus.Error });
      } else {
        toast(t('notes:save-success'), { status: ToastStatus.Success });
      }

      invalidateCache({
        mutate,
        cache,
        verseKeys: [verseKey],
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
      header={
        <Header className={modalStyles.title} data-testid="add-note-modal-title">
          {t('take-a-note-or-reflection')}
        </Header>
      }
      isModalOpen={isModalOpen}
      onModalClose={onModalClose}
      onMyNotes={onMyNotes}
      notesCount={notesCount}
      onSaveNote={handleSaveNote}
      dataTestId="add-note-modal-content"
    />
  );
};

export default AddNoteModal;
