import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import { LOADING_POST_ID } from '@/components/Notes/modal/constant';
import Header from '@/components/Notes/modal/Header';
import { addReflectionEntityToNote } from '@/components/Notes/modal/hooks/usePostNoteToQr';
import NoteFormModal from '@/components/Notes/modal/NoteFormModal';
import {
  CacheAction,
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

      const isFailedToPublish = isNotePublishFailed(data);
      const noteFromResponse = getNoteFromResponse(data);

      if (isFailedToPublish) {
        toast(t('notes:save-publish-failed'), { status: ToastStatus.Error });
      } else {
        toast(t('notes:save-success'), { status: ToastStatus.Success });
      }

      invalidateCache({
        mutate,
        cache,
        verseKeys: [verseKey],
        note:
          isFailedToPublish || !isPublic
            ? noteFromResponse
            : addReflectionEntityToNote(noteFromResponse, LOADING_POST_ID),
        invalidateCount: true,
        invalidateReflections: isPublic,
        action: CacheAction.CREATE,
      });
    } catch (error) {
      toast(t('common:error.general'), { status: ToastStatus.Error });
      throw error;
    }
  };

  return (
    <NoteFormModal
      header={<Header data-testid="add-note-modal-title">{t('take-a-note-or-reflection')}</Header>}
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
