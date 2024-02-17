/* eslint-disable max-lines */
import React, { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import EditForm from './EditForm';
import styles from './NoteListItem.module.scss';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useMutation from '@/hooks/useMutation';
import EditIcon from '@/icons/edit.svg';
import { Note } from '@/types/auth/Note';
import { deleteNote as baseDeleteNote, publishNoteToQR } from '@/utils/auth/api';
import { makeGetNoteByIdUrl, makeGetNotesByVerseUrl } from '@/utils/auth/apiPaths';
import { dateToReadableFormat } from '@/utils/datetime';
import { logButtonClick } from '@/utils/eventLogger';
import { isVerseKeyWithinRanges } from '@/utils/verse';

type Props = {
  note: Note;
  verseKey: string;
  noteId: string;
  onNoteUpdated?: (data: Note) => void;
};

const NoteListItem: React.FC<Props> = ({ note, verseKey, noteId, onNoteUpdated }) => {
  const { lang, t } = useTranslation('common');
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

  const { mutate: publishOnQuranReflect, isMutating: isPostingOnQuranReflect } = useMutation(
    () => {
      return publishNoteToQR(note.id, {
        body: note.body,
        ranges: note?.ranges || [],
      });
    },
    {
      onSuccess: () => {
        toast(t('notes:export-success'), {
          status: ToastStatus.Success,
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

  const onPublishOnQrClicked = (e) => {
    e.stopPropagation();
    logButtonClick('qr_publish_note');
    publishOnQuranReflect();
  };

  const onEditClicked = (e) => {
    e.stopPropagation();
    logButtonClick('edit_note');
    setIsInEditMode(true);
  };

  const onDeleteClicked = (e) => {
    e.stopPropagation();
    logButtonClick('delete_note');
    deleteNote(note.id);
  };

  const shouldDisableActions = isDeletingNote || isPostingOnQuranReflect;

  const buttonProps = {
    isDisabled: shouldDisableActions,
    isLoading: shouldDisableActions,
  };

  return (
    <div className={styles.container}>
      {isInEditMode ? (
        <EditForm
          onCancelEditClicked={onCancelEditClicked}
          note={note}
          onNoteUpdated={onNoteUpdated}
          verseKey={verseKey}
          noteId={noteId}
        />
      ) : (
        <>
          <div className={styles.headerContainer}>
            <time className={styles.noteDate} dateTime={note.createdAt.toString()}>
              {dateToReadableFormat(note.createdAt, lang, {
                year: 'numeric',
                weekday: undefined,
                month: 'short',
              })}
            </time>
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
              <Button
                variant={ButtonVariant.Ghost}
                onClick={onDeleteClicked}
                tooltip={t('delete')}
                size={ButtonSize.Small}
                type={ButtonType.Warning}
                {...buttonProps}
                // eslint-disable-next-line i18next/no-literal-string
              >
                X
              </Button>
            </div>
          </div>
          <div className={styles.noteBody}>{note.body}</div>
          <div className={styles.shareButtonContainer}>
            <Button size={ButtonSize.Small} onClick={onPublishOnQrClicked} {...buttonProps}>
              {t('notes:publish-on-qr')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default NoteListItem;
