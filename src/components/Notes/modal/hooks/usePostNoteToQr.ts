import { useCallback, useState, useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import { CacheAction, invalidateCache } from '@/components/Notes/modal/utility';
import DataContext from '@/contexts/DataContext';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useMutation from '@/hooks/useMutation';
import { logErrorToSentry } from '@/lib/sentry';
import { AttachedEntityType, Note } from '@/types/auth/Note';
import { publishNoteToQR } from '@/utils/auth/api';
import { verseRangesToVerseKeys } from '@/utils/verseKeys';

interface UsePostNoteToQRProps {
  onSuccess?: (response: Awaited<ReturnType<typeof publishNoteToQR>>) => void;
}

interface UsePostNoteToQRReturn {
  showConfirmationModal: boolean;
  noteToPost: Note | null;
  isPosting: boolean;
  handlePostToQrClick: (note: Note) => void;
  handleNotePostToQRClose: () => void;
  handleNotePostToQR: () => Promise<void>;
}

const usePostNoteToQR = ({ onSuccess }: UsePostNoteToQRProps): UsePostNoteToQRReturn => {
  const { t } = useTranslation('notes');
  const toast = useToast();
  const chaptersData = useContext(DataContext);
  const { mutate, cache } = useSWRConfig();

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [noteToPost, setNoteToPost] = useState<Note | null>(null);

  const { mutate: postNoteToQRMutation, isMutating: isPosting } = useMutation<
    { success: boolean; postId: string },
    Note
  >(async (note) => publishNoteToQR(note.id, { body: note.body, ranges: note.ranges }), {
    // we are not using response from the mutation so we can safely ignore the warning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSuccess: (response, note) => {
      if (!note) return;
      toast(t('export-success'), { status: ToastStatus.Success });

      invalidateCache({
        mutate,
        cache,
        note: addReflectionEntityToNote(note, response.postId),
        verseKeys: note.ranges ? verseRangesToVerseKeys(chaptersData, note.ranges) : [],
        invalidateReflections: true,
        action: CacheAction.UPDATE,
      });

      setShowConfirmationModal(false);
      setNoteToPost(null);
      onSuccess?.(response);
    },
    onError: (error, note) => {
      toast(t('common:error.general'), { status: ToastStatus.Error });
      logErrorToSentry(error, {
        transactionName: 'postNoteToQR',
        metadata: { noteId: note?.id },
      });
    },
  });

  const handlePostToQrClick = useCallback((note: Note) => {
    setNoteToPost(note);
    setShowConfirmationModal(true);
  }, []);

  const handleNotePostToQRClose = useCallback(() => {
    setShowConfirmationModal(false);
    setNoteToPost(null);
  }, []);

  const handleNotePostToQR = useCallback(async () => {
    if (!noteToPost) return;
    await postNoteToQRMutation(noteToPost);
  }, [noteToPost, postNoteToQRMutation]);

  return {
    showConfirmationModal,
    noteToPost,
    isPosting,
    handlePostToQrClick,
    handleNotePostToQRClose,
    handleNotePostToQR,
  };
};

export const addReflectionEntityToNote = (note: Note, postId: string): Note => {
  return {
    ...note,
    attachedEntities: [
      ...(note.attachedEntities || []),
      {
        type: AttachedEntityType.REFLECTION,
        id: postId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  };
};

export default usePostNoteToQR;
