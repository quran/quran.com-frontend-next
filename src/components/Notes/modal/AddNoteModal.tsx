import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import { LOADING_POST_ID } from '@/components/Notes/modal/constant';
import Header from '@/components/Notes/modal/Header';
import { OnSaveNote } from '@/components/Notes/modal/hooks/useNotesStates';
import NoteFormModal from '@/components/Notes/modal/NoteFormModal';
import {
  CacheAction,
  getNoteFromResponse,
  invalidateCache,
  isNotePublishFailed,
  addReflectionEntityToNote,
} from '@/components/Notes/modal/utility';
import { getNoteServerErrors, isKeyAndValuePresent } from '@/components/Notes/modal/validation';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { addNote } from '@/utils/auth/api';
import { verseKeysToRanges } from '@/utils/verseKeys';

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
  const { t, lang } = useTranslation('notes');
  const toast = useToast();
  const { mutate, cache } = useSWRConfig();

  /**
   * Calculate optimized verse ranges from verse keys.
   *
   * Groups sequential verse keys into ranges within the same chapter.
   * Ranges never span across chapter boundaries.
   *
   * @example
   * Input:  ['1:1', '1:2', '1:3', '1:4', '1:5', '1:6', '1:7', '2:1', '2:2', '2:7']
   * Output: ['1:1-1:7', '2:1-2:2', '2:7-2:7']
   */
  const ranges = useMemo(() => {
    return verseKeysToRanges(verseKeys);
  }, [verseKeys]);

  const handleSaveNote: OnSaveNote = async ({ note: noteBody, isPublic }) => {
    try {
      const data = await addNote({ body: noteBody, ranges, saveToQR: isPublic });

      const isNotSuccess = isKeyAndValuePresent(data, 'success', false);
      const isFailedToPublish = isNotePublishFailed(data) && !isNotSuccess;
      const noteFromResponse = getNoteFromResponse(data);

      if (isFailedToPublish) {
        toast(t('notes:save-publish-failed'), { status: ToastStatus.Error });
      } else if (!isNotSuccess && noteFromResponse?.id.toString() && noteFromResponse?.createdAt) {
        toast(t('notes:save-success'), { status: ToastStatus.Success });
      } else {
        return getNoteServerErrors(data, t, lang);
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

      return null;
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
      ranges={showRanges ? ranges : undefined}
      dataTestId="add-note-modal-content"
    />
  );
};

export default AddNoteModal;
