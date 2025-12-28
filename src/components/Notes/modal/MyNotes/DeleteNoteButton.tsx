import React, { useCallback, useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import { invalidateCache } from '../utility';

import DataContext from '@/contexts/DataContext';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import { useConfirm } from '@/dls/ConfirmationModal/hooks';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useMutation from '@/hooks/useMutation';
import DeleteIcon from '@/icons/delete.svg';
import { logErrorToSentry } from '@/lib/sentry';
import { Note } from '@/types/auth/Note';
import { deleteNote } from '@/utils/auth/api';
import { logButtonClick } from '@/utils/eventLogger';
import { verseRangesToVerseKeys } from '@/utils/verseKeys';

interface DeleteNoteButtonProps {
  note: Note;
}

const DeleteNoteButton: React.FC<DeleteNoteButtonProps> = ({ note }) => {
  const { t } = useTranslation('notes');
  const toast = useToast();
  const confirm = useConfirm();
  const { mutate, cache } = useSWRConfig();
  const chaptersData = useContext(DataContext);

  const { mutate: deleteNoteMutation, isMutating: isDeletingNote } = useMutation<unknown, string>(
    deleteNote,
    {
      onSuccess: () => {
        toast(t('delete-success'), { status: ToastStatus.Success });
        invalidateCache({
          mutate,
          cache,
          verseKeys: note.ranges ? verseRangesToVerseKeys(chaptersData, note.ranges) : [],
          invalidateCount: true,
        });
      },
      onError: (error) => {
        toast(t('common:error.general'), { status: ToastStatus.Error });
        logErrorToSentry(error, {
          transactionName: 'DeleteNoteButton',
          metadata: { noteId: note.id },
        });
      },
    },
  );

  const handleDeleteNote = useCallback(async () => {
    logButtonClick('note_delete');

    const isConfirmed = await confirm({
      confirmText: t('common:delete'),
      cancelText: t('common:cancel'),
      title: t('delete-note-modal.title'),
      subtitle: t('delete-note-modal.subtitle'),
    });

    if (isConfirmed) {
      logButtonClick('note_delete_confirm');
      deleteNoteMutation(note.id);
    } else {
      logButtonClick('note_delete_confirm_cancel');
    }
  }, [confirm, deleteNoteMutation, note.id, t]);

  return (
    <Button
      variant={ButtonVariant.Ghost}
      size={ButtonSize.Small}
      shape={ButtonShape.Square}
      onClick={handleDeleteNote}
      isDisabled={isDeletingNote}
      tooltip={t('common:delete')}
      data-testid="delete-note-button"
    >
      <IconContainer
        size={IconSize.Xsmall}
        shouldForceSetColors={false}
        icon={
          isDeletingNote ? (
            <Spinner shouldDelayVisibility={false} size={SpinnerSize.Small} />
          ) : (
            <DeleteIcon />
          )
        }
      />
    </Button>
  );
};

export default DeleteNoteButton;
