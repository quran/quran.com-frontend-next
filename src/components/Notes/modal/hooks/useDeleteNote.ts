import { useCallback, useContext, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import { CacheAction, invalidateCache } from '@/components/Notes/modal/utility/cache';
import DataContext from '@/contexts/DataContext';
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
  handleDeleteNoteConfirm: () => Promise<void>;
  handleDeleteNoteCancel: () => void;
}

interface UseDeleteNoteProps {
  onSuccess?: (response: Awaited<ReturnType<typeof deleteNote>>) => void;
  flushNotesList?: boolean;
}

const useDeleteNote = ({
  onSuccess,
  flushNotesList = false,
}: UseDeleteNoteProps): UseDeleteNoteReturn => {
  const { t } = useTranslation('notes');
  const toast = useToast();
  const chaptersData = useContext(DataContext);
  const { mutate, cache } = useSWRConfig();
  const safeTimeout = useSafeTimeout();

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  const clearDeleteNote = useCallback(() => {
    safeTimeout(() => setNoteToDelete(null), 10);
  }, [safeTimeout]);

  const handleDeleteNoteCancel = useCallback(() => {
    setShowDeleteConfirmation(false);
    clearDeleteNote();
  }, [clearDeleteNote]);

  const { mutate: deleteNoteMutation, isMutating: isDeletingNote } = useMutation<unknown, Note>(
    async (note) => deleteNote(note.id),
    {
      // we are not using response from the mutation so we can safely ignore the warning
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onSuccess: (response, note) => {
        if (!note) return;
        toast(t('delete-success'), { status: ToastStatus.Success });

        if (note) {
          invalidateCache({
            mutate,
            cache,
            verseKeys: note.ranges ? verseRangesToVerseKeys(chaptersData, note.ranges) : [],
            invalidateCount: true,
            note,
            flushNotesList,
            action: CacheAction.DELETE,
          });
        }

        setShowDeleteConfirmation(false);
        clearDeleteNote();
        onSuccess?.(response);
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

  const handleDeleteNoteClick = useCallback(async (note: Note) => {
    setNoteToDelete(note);
    setShowDeleteConfirmation(true);
  }, []);

  const handleDeleteNoteConfirm = useCallback(async () => {
    if (!noteToDelete) return;
    await deleteNoteMutation(noteToDelete);
  }, [deleteNoteMutation, noteToDelete]);

  return {
    showDeleteConfirmation,
    noteToDelete,
    isDeletingNote,
    handleDeleteNoteClick,
    handleDeleteNoteConfirm,
    handleDeleteNoteCancel,
  };
};

export default useDeleteNote;
