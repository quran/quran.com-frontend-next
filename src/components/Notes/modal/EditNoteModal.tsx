import { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import { LOADING_POST_ID } from '@/components/Notes/modal/constant';
import Header from '@/components/Notes/modal/Header';
import { addReflectionEntityToNote } from '@/components/Notes/modal/hooks/usePostNoteToQr';
import NoteFormModal from '@/components/Notes/modal/NoteFormModal';
import {
  getNoteFromResponse,
  invalidateCache,
  isNotePublishFailed,
  CacheAction,
} from '@/components/Notes/modal/utility';
import DataContext from '@/contexts/DataContext';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { Note } from '@/types/auth/Note';
import { updateNote } from '@/utils/auth/api';
import { verseRangesToVerseKeys } from '@/utils/verseKeys';

interface EditNoteModalProps {
  note: Note;
  onBack?: () => void;
  onMyNotes: () => void;
  isModalOpen: boolean;
  onModalClose: () => void;
  onSuccess?: (data: { note: Note; isPublished: boolean }) => void;
}

const EditNoteModal: React.FC<EditNoteModalProps> = ({
  note,
  onBack,
  onMyNotes,
  isModalOpen,
  onModalClose,
  onSuccess,
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

      const isFailedToPublish = isNotePublishFailed(data);
      const noteFromResponse = getNoteFromResponse(data);

      onSuccess?.({ note: noteFromResponse, isPublished: !isFailedToPublish });

      if (isFailedToPublish) {
        toast(t('notes:update-publish-failed'), { status: ToastStatus.Error });
      } else {
        toast(t('notes:update-success'), { status: ToastStatus.Success });
      }

      invalidateCache({
        mutate,
        cache,
        verseKeys: note.ranges ? verseRangesToVerseKeys(chaptersData, note.ranges) : [],
        note:
          isFailedToPublish || !isPublic
            ? noteFromResponse
            : addReflectionEntityToNote(noteFromResponse, LOADING_POST_ID),
        invalidateCount: true,
        invalidateReflections: isPublic,
        action: CacheAction.UPDATE,
      });
    } catch (error) {
      toast(t('common:error.general'), { status: ToastStatus.Error });
      throw error;
    }
  };

  return (
    <NoteFormModal
      key={`${note?.id}:${note?.updatedAt}`}
      initialNote={note?.body || ''}
      ranges={note?.ranges}
      isModalOpen={isModalOpen}
      onModalClose={onModalClose}
      onMyNotes={onMyNotes}
      onSaveNote={handleSaveNote}
      showNotesOnVerseButton={false}
      dataTestId="edit-note-modal-content"
      header={
        <Header onClick={onBack} data-testid="edit-modal-back-button">
          {t('edit-note')}
        </Header>
      }
    />
  );
};

export default EditNoteModal;
