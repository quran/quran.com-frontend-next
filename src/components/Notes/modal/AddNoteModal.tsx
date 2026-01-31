import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import { LOADING_POST_ID } from '@/components/Notes/modal/constant';
import Header from '@/components/Notes/modal/Header';
import NoteFormModal from '@/components/Notes/modal/NoteFormModal';
import {
  CacheAction,
  getNoteFromResponse,
  invalidateCache,
  isNotePublishFailed,
  addReflectionEntityToNote,
} from '@/components/Notes/modal/utility';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { addNote } from '@/utils/auth/api';

interface AddNoteModalProps {
  notesCount?: number;
  isModalOpen: boolean;
  verseKeys: string[];
  showRanges?: boolean;
  onMyNotes: () => void;
  onModalClose: () => void;
  onBack?: () => void;
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({
  notesCount = 0,
  isModalOpen,
  verseKeys,
  showRanges = false,
  onModalClose,
  onMyNotes,
  onBack,
}) => {
  const { t } = useTranslation('notes');
  const toast = useToast();
  const { mutate, cache } = useSWRConfig();

  const handleSaveNote = async ({ note, isPublic }: { note: string; isPublic: boolean }) => {
    try {
      const data = await addNote({
        body: note,
        ranges: verseKeys,
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
        verseKeys,
        note:
          isFailedToPublish || !isPublic
            ? noteFromResponse
            : addReflectionEntityToNote(noteFromResponse, LOADING_POST_ID),
        invalidateCount: true,
        invalidateReflections: isPublic,
        flushNotesList: true,
        action: CacheAction.CREATE,
      });
    } catch (error) {
      toast(t('common:error.general'), { status: ToastStatus.Error });
      throw error;
    }
  };

  return (
    <NoteFormModal
      header={
        <Header onClick={onBack} data-testid="add-note-modal-title">
          {t('take-a-note-or-reflection')}
        </Header>
      }
      isModalOpen={isModalOpen}
      onModalClose={onModalClose}
      onMyNotes={onMyNotes}
      notesCount={notesCount}
      onSaveNote={handleSaveNote}
      ranges={showRanges ? verseKeys.map((verseKey) => `${verseKey}-${verseKey}`) : undefined}
      dataTestId="add-note-modal-content"
    />
  );
};

export default AddNoteModal;
