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
import { deleteNote as baseDeleteNote } from '@/utils/auth/api';
import { makeGetNoteByIdUrl, makeGetNotesByVerseUrl } from '@/utils/auth/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';
import adjustNoteCounts from '@/utils/notes/adjustNoteCounts';
import { mutateNotesCache } from '@/utils/notes/mutateNotesCache';
import { createReflection } from '@/utils/quranReflect/apiPaths';
import { rangesToReflectionReferences, getReflectionPostId } from '@/utils/quranReflect/mapping';
import { getQuranReflectPostUrl } from '@/utils/quranReflect/navigation';

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

  // Removed clearCountCache; counts are adjusted client-side

  const mutateCache = (updated: Note | Note[]) =>
    mutateNotesCache(mutate, { verseKey, noteId, updated });

  const { mutate: postOnQuranReflect, isMutating: isPostingOnQuranReflect } = useMutation(
    () => {
      return createReflection({
        body: note.body,
        references: rangesToReflectionReferences(note?.ranges || []),
      });
    },
    {
      onSuccess: (response) => {
        const { data } = response;
        const postId = data?.id;
        toast(t('notes:export-success'), {
          status: ToastStatus.Success,
        });
        mutateCache({
          ...note,
          attachedEntities: [
            {
              type: AttachedEntityType.REFLECTION,
              id: String(postId),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          // mark as published to keep UI consistent
          saveToQR: true,
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
    async (id) => baseDeleteNote(id),
    {
      onSuccess: () => {
        toast(t('notes:delete-success'), {
          status: ToastStatus.Success,
        });
        if (verseKey) {
          const key = makeGetNotesByVerseUrl(verseKey);
          // Remove the deleted note from the cached list without revalidating
          mutate(
            key,
            (prev: any) => {
              const list: Note[] = Array.isArray(prev) ? (prev as Note[]) : [];
              return list.filter((n) => n.id !== note.id);
            },
            false,
          );
        }
        if (noteId) {
          // If editing a single note, drop its cache
          mutate(makeGetNoteByIdUrl(noteId), undefined, false);
        }
        // Adjust cached per-range counts client-side
        adjustNoteCounts(cache, mutate, verseKey, -1);
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

  const reflectionId = getReflectionPostId(note);

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
            {!reflectionId && (
              <DeleteNoteModal
                onConfirm={onDeleteConfirm}
                note={note}
                isDisabled={shouldDisableActions}
              />
            )}
          </div>
          <div className={styles.noteBody}>{note.body}</div>
          {reflectionId ? (
            <div className={styles.shareButtonContainer}>
              <Button
                size={ButtonSize.Small}
                href={getQuranReflectPostUrl(reflectionId)}
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
