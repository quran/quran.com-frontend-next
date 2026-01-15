import { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import Header from '@/components/Notes/modal/Header';
import NoteFormModal from '@/components/Notes/modal/NoteFormModal';
import {
  getNoteFromResponse,
  invalidateCache,
  isNotePublishFailed,
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
}

const EditNoteModal: React.FC<EditNoteModalProps> = ({
  note,
  onBack,
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
