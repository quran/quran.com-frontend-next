/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { useRef } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import DeleteButton from './Buttons/DeleteButton';
import ExportToQRButton from './Buttons/ExportToQRButton';
import styles from './NoteModal.module.scss';

import DataFetcher from '@/components/DataFetcher';
import buildFormBuilderFormField from '@/components/FormBuilder/buildFormBuilderFormField';
import buildTranslatedErrorMessageByErrorId from '@/components/FormBuilder/buildTranslatedErrorMessageByErrorId';
import FormBuilder from '@/components/FormBuilder/FormBuilder';
import Button from '@/dls/Button/Button';
import ContentModal, { ContentModalSize } from '@/dls/ContentModal/ContentModal';
import ContentModalHandles from '@/dls/ContentModal/types/ContentModalHandles';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useMutation from '@/hooks/useMutation';
import { BaseResponse } from '@/types/ApiResponses';
import { Note } from '@/types/auth/Note';
import ErrorMessageId from '@/types/ErrorMessageId';
import { RuleType } from '@/types/FieldRule';
import { FormFieldType } from '@/types/FormField';
import {
  addNote as baseAddNote,
  updateNote as baseUpdateNote,
  deleteNote as baseDeleteNote,
  privateFetcher,
} from '@/utils/auth/api';
import { makeGetNoteByIdUrl, makeGetNotesByVerseUrl } from '@/utils/auth/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';
import { isVerseKeyWithinRanges } from '@/utils/verse';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  verseKey?: string;
  noteId?: string;

  onNoteAdded?: (data: Note) => void;
  onNoteUpdated?: (data: Note) => void;
  onNoteDeleted?: () => void;
}

type NoteFormData = {
  title: string;
  body: string;
};

const TITLE_MAXIMUM_LENGTH = 150;

const TITLE_VALIDATION_PARAMS = {
  value: TITLE_MAXIMUM_LENGTH,
};

const NoteModal: React.FC<NoteModalProps> = ({
  onClose,
  isOpen,
  verseKey,
  noteId,
  onNoteAdded,
  onNoteDeleted,
  onNoteUpdated,
}) => {
  const { t } = useTranslation('common');
  const contentModalRef = useRef<ContentModalHandles>();
  const toast = useToast();
  const { mutate, cache } = useSWRConfig();
  const { mutate: deleteNote, isMutating: isDeletingNote } = useMutation<unknown, string>(
    async (id) => {
      return baseDeleteNote(id);
    },
    {
      onSuccess: () => {
        toast(t('notes:delete-success'), {
          status: ToastStatus.Success,
        });
        onNoteDeleted?.();
        onClose();
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
  const { mutate: updateNote, isMutating: isUpdatingNote } = useMutation<
    Note,
    { id: string; title: string; body: string }
  >(
    async ({ id, title, body }) => {
      return baseUpdateNote(id, title, body) as Promise<Note>;
    },
    {
      onSuccess: (data) => {
        toast(t('notes:update-success'), {
          status: ToastStatus.Success,
        });
        onNoteUpdated?.(data);
        mutateCache([data]);
      },
      onError: () => {
        toast(t('common:error.general'), {
          status: ToastStatus.Error,
        });
      },
    },
  );
  const { mutate: addNote, isMutating: isAddingNote } = useMutation<
    Note,
    { title: string; body: string }
  >(
    async ({ title, body }) => {
      return baseAddNote({
        title,
        body,
        ...(verseKey && {
          ranges: [`${verseKey}-${verseKey}`],
        }),
      }) as Promise<Note>;
    },
    {
      onSuccess: (data) => {
        toast(t('notes:save-success'), {
          status: ToastStatus.Success,
        });
        onNoteAdded?.(data);
        mutateCache([data]);
        clearCountCache();
      },
      onError: () => {
        toast(t('common:error.general'), {
          status: ToastStatus.Error,
        });
      },
    },
  );

  const mutateCache = (data: unknown) => {
    if (verseKey) {
      mutate(makeGetNotesByVerseUrl(verseKey), data);
    }

    if (noteId) {
      mutate(makeGetNoteByIdUrl(noteId), data);
    }
  };

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

  const onSubmit = async ({ title, body }: NoteFormData, currentNote?: Note) => {
    // if the note exits, it's an update
    if (currentNote) {
      updateNote({ id: currentNote.id, title, body });
      logButtonClick('update_note');
    } else {
      logButtonClick('add_note');
      addNote({
        title,
        body,
      });
    }
  };

  const queryKey = noteId ? makeGetNoteByIdUrl(noteId) : makeGetNotesByVerseUrl(verseKey);

  return (
    <ContentModal
      innerRef={contentModalRef}
      isOpen={isOpen}
      header={<div className={styles.headerContainer} />}
      hasCloseButton
      onClose={onClose}
      onEscapeKeyDown={onClose}
      size={ContentModalSize.MEDIUM}
    >
      <DataFetcher
        queryKey={queryKey}
        fetcher={privateFetcher}
        showSpinnerOnRevalidate={false}
        render={(response: (Note | Note[]) & BaseResponse) => {
          const note = noteId ? (response as Note) : (response[0] as Note);

          return (
            <FormBuilder
              formFields={[
                {
                  field: 'title',
                  defaultValue: note?.title || '',
                  rules: [
                    {
                      type: RuleType.Required,
                      errorId: ErrorMessageId.RequiredField,
                      value: true,
                    },
                    {
                      ...TITLE_VALIDATION_PARAMS,
                      type: RuleType.MaximumLength,
                      errorId: ErrorMessageId.MaximumLength,
                      errorExtraParams: {
                        ...TITLE_VALIDATION_PARAMS,
                      },
                      errorMessage: buildTranslatedErrorMessageByErrorId(
                        ErrorMessageId.MaximumLength,
                        'title',
                        t,
                        {
                          ...TITLE_VALIDATION_PARAMS,
                        },
                      ),
                    },
                  ],
                  type: FormFieldType.Text,
                  containerClassName: styles.titleInput,
                },
                {
                  field: 'body',
                  defaultValue: note?.body || '',
                  rules: [
                    {
                      type: RuleType.Required,
                      errorId: ErrorMessageId.RequiredField,
                      value: true,
                    },
                  ],
                  type: FormFieldType.TextArea,
                  containerClassName: styles.bodyInput,
                },
              ].map((field) => buildFormBuilderFormField(field, t))}
              onSubmit={(data) => onSubmit(data as NoteFormData, note)}
              isSubmitting={isUpdatingNote || isAddingNote}
              renderAction={(props) => (
                <div className={styles.actionContainer}>
                  <Button {...props}>{t('common:notes.save')}</Button>

                  {note && (
                    <div>
                      <DeleteButton
                        noteId={note.id}
                        isDeletingNote={isDeletingNote}
                        deleteNote={deleteNote}
                      />
                      <ExportToQRButton />
                    </div>
                  )}
                </div>
              )}
            />
          );
        }}
      />
    </ContentModal>
  );
};

export default NoteModal;
