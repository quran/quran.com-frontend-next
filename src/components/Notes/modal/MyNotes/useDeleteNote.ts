import { useCallback, useContext, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import { invalidateCache } from '@/components/Notes/modal/utility';
import DataContext from '@/contexts/DataContext';
import { useConfirm } from '@/dls/ConfirmationModal/hooks';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useMutation from '@/hooks/useMutation';
import useSafeTimeout from '@/hooks/useSafeTimeout';
import { logErrorToSentry } from '@/lib/sentry';
import { Note } from '@/types/auth/Note';
import { deleteNote } from '@/utils/auth/api';
import { verseRangesToVerseKeys } from '@/utils/verseKeys';

interface UseDeleteNoteReturn {
  showDeleteConfirmation: boolean;
  noteToDelete: Note | null;
  isDeletingNote: boolean;
  handleDeleteNoteClick: (note: Note) => Promise<void>;
}

const useDeleteNote = (): UseDeleteNoteReturn => {
  const { t } = useTranslation('notes');
  const toast = useToast();
  const chaptersData = useContext(DataContext);
  const { mutate, cache } = useSWRConfig();
  const confirm = useConfirm();
  const safeTimeout = useSafeTimeout();

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  const clearDeleteNote = useCallback(() => {
    safeTimeout(() => setNoteToDelete(null), 10);
  }, [safeTimeout]);

  const { mutate: deleteNoteMutation, isMutating: isDeletingNote } = useMutation<unknown, Note>(
    async (note) => deleteNote(note.id),
    {
      // we are not using response from the mutation so we can safely ignore the warning
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onSuccess: (response, note) => {
        toast(t('delete-success'), { status: ToastStatus.Success });
        if (note) {
          invalidateCache({
            mutate,
            cache,
            verseKeys: note.ranges ? verseRangesToVerseKeys(chaptersData, note.ranges) : [],
            invalidateCount: true,
          });
        }

        setShowDeleteConfirmation(false);
        clearDeleteNote();
      },
      onError: (error, note) => {
        toast(t('common:error.general'), { status: ToastStatus.Error });
        logErrorToSentry(error, {
          transactionName: 'DeleteNoteModal',
          metadata: { noteId: note?.id },
        });

        setShowDeleteConfirmation(false);
        clearDeleteNote();
      },
    },
  );

  const handleDeleteNoteClick = useCallback(
    async (note: Note) => {
      setNoteToDelete(note);
      setShowDeleteConfirmation(true);

      const isConfirmed = await confirm({
        confirmText: t('common:delete'),
        cancelText: t('common:cancel'),
        title: t('delete-note-modal.title'),
        subtitle: t('delete-note-modal.subtitle'),
      });

      setShowDeleteConfirmation(false);

      if (isConfirmed) {
        await deleteNoteMutation(note);
      } else {
        clearDeleteNote();
      }
    },
    [confirm, deleteNoteMutation, clearDeleteNote, t],
  );

  return {
    showDeleteConfirmation,
    noteToDelete,
    isDeletingNote,
    handleDeleteNoteClick,
  };
};

export default useDeleteNote;
