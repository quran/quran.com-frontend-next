import { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import { LOADING_POST_ID } from '@/components/Notes/modal/constant';
import Header from '@/components/Notes/modal/Header';
import type { OnSaveNote } from '@/components/Notes/modal/hooks/useNotesStates';
import NoteFormModal from '@/components/Notes/modal/NoteFormModal';
import {
  getNoteFromResponse,
  invalidateCache,
  isNotePublishFailed,
  CacheAction,
  addReflectionEntityToNote,
} from '@/components/Notes/modal/utility';
import { getNoteServerErrors } from '@/components/Notes/modal/validation';
import DataContext from '@/contexts/DataContext';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { Note } from '@/types/auth/Note';
import { updateNote } from '@/utils/auth/api';
import { isValidationError } from '@/utils/error';
import { verseRangesToVerseKeys } from '@/utils/verseKeys';

interface EditNoteModalProps {
  note: Note;
  onBack?: () => void;
  onMyNotes: () => void;
  isModalOpen: boolean;
  onModalClose: () => void;
  onSuccess?: (data: { note: Note; isPublished: boolean }) => void;
  flushNotesList?: boolean;
}

const EditNoteModal: React.FC<EditNoteModalProps> = ({
  note,
  onBack,
  onMyNotes,
  isModalOpen,
  onModalClose,
  onSuccess,
  flushNotesList = false,
}) => {
  const chaptersData = useContext(DataContext);
  const { t, lang } = useTranslation('notes');
  const toast = useToast();
  const { mutate, cache } = useSWRConfig();

  const handleSaveNote: OnSaveNote = async ({ note: noteBody, isPublic }) => {
    try {
      const data = await updateNote(note.id, noteBody, isPublic);

      const hasValidationError = isValidationError(data);
      const isFailedToPublish = isNotePublishFailed(data);
      const noteFromResponse = getNoteFromResponse(data);

      if (hasValidationError) return getNoteServerErrors(data, t, lang);

      if (isFailedToPublish) {
        toast(t('notes:update-publish-failed'), { status: ToastStatus.Error });
      } else if (noteFromResponse?.id && noteFromResponse?.updatedAt) {
        toast(t('notes:update-success'), { status: ToastStatus.Success });
      } else {
        throw data;
      }

      const noteToUpdate = { ...note, ...noteFromResponse };
      const isPrivate = isFailedToPublish || !isPublic;

      invalidateCache({
        mutate,
        cache,
        verseKeys: note.ranges ? verseRangesToVerseKeys(chaptersData, note.ranges) : [],
        note: isPrivate ? noteToUpdate : addReflectionEntityToNote(noteToUpdate, LOADING_POST_ID),
        invalidateCount: true,
        invalidateReflections: isPublic,
        flushNotesList,
        action: CacheAction.UPDATE,
      });

      return onSuccess?.({ note: noteFromResponse, isPublished: isPublic && !isFailedToPublish });
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
