/* eslint-disable max-lines */
import React, { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import DeleteNoteModal from './DeleteNoteModal';
import EditForm from './EditForm';
import styles from './NoteListItem.module.scss';

import PublicReflectionDescription, {
  NoteType,
} from '@/components/Notes/NoteModal/PublicReflectionCheckboxDescription';
import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useMutation from '@/hooks/useMutation';
import EditIcon from '@/icons/edit.svg';
import { AttachedEntityType, Note } from '@/types/auth/Note';
import { deleteNote as baseDeleteNote, publishNoteToQR } from '@/utils/auth/api';
import { makeGetNoteByIdUrl, makeGetNotesByVerseUrl } from '@/utils/auth/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';
import { getQuranReflectPostUrl } from '@/utils/quranReflect/navigation';
import { isVerseKeyWithinRanges } from '@/utils/verse';

type Props = {
  note: Note;
  verseKey: string;
  noteId: string;
  onNoteUpdated?: (data: Note) => void;
  onNoteDeleted?: () => void;
};

const EditNoteListItem: React.FC<Props> = ({
  note,
  verseKey,
  noteId,
  onNoteUpdated,
  onNoteDeleted,
}) => {
  const { t } = useTranslation('common');
  const toast = useToast();
  const { mutate, cache } = useSWRConfig();
  const [isInEditMode, setIsInEditMode] = useState<boolean>(false);

  const clearCountCache = () => {
    // we need to invalidate one of keys that look like: ['countNotes', notesRange]
    // so that the count is updated
    const keys = [...(cache as any).keys()].filter((key) => {
      if (!key.startsWith('countNotes/')) {
        return false;
      }

      if (verseKey) {
        // check if the note is within the range
        const rangeString = key.replace('countNotes/', '');
        return isVerseKeyWithinRanges(verseKey, rangeString);
      }

      if (noteId) {
        // if we're on the notes page, just invalidate all keys
        return true;
      }

      // if we're not on the quran reader page, we can just invalidate all the keys
      return true;
    }) as string[];

    if (keys.length) {
      keys.forEach((key) => {
        cache.delete(key);
        mutate(key);
      });
    }
  };

  const mutateCache = (data: unknown) => {
    if (verseKey) {
      mutate(makeGetNotesByVerseUrl(verseKey), data);
    }

    if (noteId) {
      mutate(makeGetNoteByIdUrl(noteId), data);
    }
  };

  const { mutate: postOnQuranReflect, isMutating: isPostingOnQuranReflect } = useMutation(
    () => {
      return publishNoteToQR(note.id, {
        body: note.body,
        ranges: note?.ranges || [],
      });
    },
    {
      onSuccess: (response) => {
        const { postId } = response;
        toast(t('notes:export-success'), {
          status: ToastStatus.Success,
        });
        mutateCache({
          ...note,
          attachedEntities: [
            {
              type: AttachedEntityType.REFLECTION,
              id: postId,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        });
      },
      onError: () => {
        toast(t('common:error.general'), {
          status: ToastStatus.Error,
        });
      },
    },
  );

  const { mutate: deleteNote, isMutating: isDeletingNote } = useMutation<unknown, string>(
    async (id) => {
      return baseDeleteNote(id);
    },
    {
      onSuccess: () => {
        toast(t('notes:delete-success'), {
          status: ToastStatus.Success,
        });
        mutateCache([]);
        clearCountCache();
        if (onNoteDeleted) {
          onNoteDeleted();
        }
      },
      onError: () => {
        toast(t('common:error.general'), {
          status: ToastStatus.Error,
        });
      },
    },
  );

  const onCancelEditClicked = () => {
    setIsInEditMode(false);
    logButtonClick('cancel_edit_note');
  };

  const onPostOnQrClicked = (e) => {
    e.stopPropagation();
    logButtonClick('qr_publish_note');
    postOnQuranReflect();
  };

  const onEditClicked = (e) => {
    e.stopPropagation();
    logButtonClick('edit_note');
    setIsInEditMode(true);
  };

  const onDeleteConfirm = () => {
    deleteNote(note.id);
  };

  const onViewOnQrClicked = (e) => {
    e.stopPropagation();
    logButtonClick('qr_view_note_post');
  };

  const shouldDisableActions = isDeletingNote || isPostingOnQuranReflect;

  const buttonProps = {
    isDisabled: shouldDisableActions,
    isLoading: shouldDisableActions,
  };

  const noteReflectionId = note?.attachedEntities?.find(
    (entity) => entity.type === AttachedEntityType.REFLECTION,
  )?.id;

  const onNoteUpdatedHandler = (updatedNote: Note) => {
    setIsInEditMode(false);
    if (onNoteUpdated) {
      onNoteUpdated(updatedNote);
    }
  };

  return (
    <div className={styles.container}>
      {isInEditMode ? (
        <EditForm
          onCancelEditClicked={onCancelEditClicked}
          note={note}
          onNoteUpdated={onNoteUpdatedHandler}
          verseKey={verseKey}
          noteId={noteId}
        />
      ) : (
        <>
          <div className={styles.buttonsContainer}>
            <Button
              shouldFlipOnRTL={false}
              variant={ButtonVariant.Ghost}
              onClick={onEditClicked}
              tooltip={t('edit')}
              size={ButtonSize.Small}
              {...buttonProps}
            >
              <EditIcon />
            </Button>
            <DeleteNoteModal
              onConfirm={onDeleteConfirm}
              note={note}
              isDisabled={shouldDisableActions}
            />
          </div>
          <div className={styles.noteBody}>{note.body}</div>
          {noteReflectionId ? (
            <div className={styles.shareButtonContainer}>
              <Button
                size={ButtonSize.Small}
                href={getQuranReflectPostUrl(noteReflectionId)}
                isNewTab
                onClick={onViewOnQrClicked}
                {...buttonProps}
              >
                {t('notes:view-on-qr')}
              </Button>
            </div>
          ) : (
            <>
              <div className={styles.shareButtonContainer}>
                <Button size={ButtonSize.Small} onClick={onPostOnQrClicked} {...buttonProps}>
                  {t('notes:post-on-qr')}
                </Button>
              </div>
              <PublicReflectionDescription type={NoteType.EDIT} />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default EditNoteListItem;
