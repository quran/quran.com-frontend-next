/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { useRef, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import NoteActions from './NoteActions';
import styles from './NoteModal.module.scss';
import NoteRanges from './NoteRanges';

import DataFetcher from '@/components/DataFetcher';
import buildFormBuilderFormField from '@/components/FormBuilder/buildFormBuilderFormField';
import buildTranslatedErrorMessageByErrorId from '@/components/FormBuilder/buildTranslatedErrorMessageByErrorId';
import FormBuilder from '@/components/FormBuilder/FormBuilder';
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
const BODY_MIN_LENGTH = 6;
const BODY_MAX_LENGTH = 10000;

const TITLE_VALIDATION_PARAMS = {
  value: TITLE_MAXIMUM_LENGTH,
};

const BODY_MIN_VALIDATION_PARAMS = {
  value: BODY_MIN_LENGTH,
};
const BODY_MAX_VALIDATION_PARAMS = {
  value: BODY_MAX_LENGTH,
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
  // we want to keep the note body in state so that we can pass it to the export to QR button in-case the user decides to export before clicking save
  const [noteBody, setNoteBody] = useState<string>(null);
  const toast = useToast();
  const { mutate, cache } = useSWRConfig();

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

  const onDelete = () => {
    onClose();
    onNoteDeleted?.();
    mutateCache([]);
    clearCountCache();
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
        onFetchSuccess={(response: (Note | Note[]) & BaseResponse) => {
          const note = noteId ? (response as Note) : (response[0] as Note);
          setNoteBody(note?.body);
        }}
        render={(response: (Note | Note[]) & BaseResponse) => {
          const note = noteId ? (response as Note) : (response[0] as Note);
          return (
            <>
              {note?.ranges && <NoteRanges noteId={note.id} ranges={note.ranges} />}
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
                    onChange: (val: string) => {
                      setNoteBody(val);
                    },
                    rules: [
                      {
                        type: RuleType.Required,
                        errorId: ErrorMessageId.RequiredField,
                        value: true,
                      },
                      {
                        ...BODY_MIN_VALIDATION_PARAMS,
                        type: RuleType.MinimumLength,
                        errorId: ErrorMessageId.MinimumLength,
                        errorExtraParams: {
                          ...BODY_MIN_VALIDATION_PARAMS,
                        },
                        errorMessage: buildTranslatedErrorMessageByErrorId(
                          ErrorMessageId.MinimumLength,
                          'body',
                          t,
                          {
                            ...BODY_MIN_VALIDATION_PARAMS,
                          },
                        ),
                      },
                      {
                        ...BODY_MAX_VALIDATION_PARAMS,
                        type: RuleType.MaximumLength,
                        errorId: ErrorMessageId.MaximumLength,
                        errorExtraParams: {
                          ...BODY_MAX_VALIDATION_PARAMS,
                        },
                        errorMessage: buildTranslatedErrorMessageByErrorId(
                          ErrorMessageId.MaximumLength,
                          'body',
                          t,
                          {
                            ...BODY_MAX_VALIDATION_PARAMS,
                          },
                        ),
                      },
                    ],
                    type: FormFieldType.TextArea,
                    containerClassName: styles.bodyInput,
                    fieldSetLegend: t('notes:note'),
                  },
                ].map((field) => buildFormBuilderFormField(field, t))}
                onSubmit={(data) => onSubmit(data as NoteFormData, note)}
                isSubmitting={isUpdatingNote || isAddingNote}
                renderAction={(props) => (
                  <NoteActions
                    note={note}
                    isSubmitting={props.isLoading}
                    onDeleted={onDelete}
                    body={noteBody}
                  />
                )}
              />
            </>
          );
        }}
      />
    </ContentModal>
  );
};

export default NoteModal;
