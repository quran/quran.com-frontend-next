/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { useRef } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import styles from './NoteModal.module.scss';

import DataFetcher from '@/components/DataFetcher';
import buildFormBuilderFormField from '@/components/FormBuilder/buildFormBuilderFormField';
import FormBuilder from '@/components/FormBuilder/FormBuilder';
import Button, { ButtonType, ButtonVariant } from '@/dls/Button/Button';
import ContentModal, { ContentModalSize } from '@/dls/ContentModal/ContentModal';
import ContentModalHandles from '@/dls/ContentModal/types/ContentModalHandles';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useMutation from '@/hooks/useMutation';
import ChatIcon from '@/icons/chat.svg';
import TrashIcon from '@/icons/trash.svg';
import NotesByTypeAndTypeIdResponse, {
  NoteResponse,
} from '@/types/auth/NotesByTypeAndTypeIdResponse';
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

type Props = {
  isOpen: boolean;
  onClose: () => void;
  verseKey?: string;
  noteId?: string;
};

type NoteFormData = {
  title: string;
  body: string;
};

const NoteModal: React.FC<Props> = ({ onClose, isOpen, verseKey, noteId }) => {
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
    unknown,
    { id: string; title: string; body: string }
  >(
    async ({ id, title, body }) => {
      return baseUpdateNote(id, title, body);
    },
    {
      onSuccess: (data) => {
        toast(t('notes:update-success'), {
          status: ToastStatus.Success,
        });
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
    unknown,
    { title: string; body: string }
  >(
    async ({ title, body }) => {
      return baseAddNote({
        title,
        body,
        ...(verseKey && {
          ranges: [`${verseKey}-${verseKey}`],
        }),
      });
    },
    {
      onSuccess: (data) => {
        toast(t('notes:save-success'), {
          status: ToastStatus.Success,
        });
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

  const onDeleteClicked = (id: string) => {
    logButtonClick('delete_note');
    deleteNote(id);
  };

  const onSubmit = async ({ title, body }: NoteFormData, currentNote?: NoteResponse) => {
    logButtonClick('save_note');

    // if the note exits, it's an update
    if (currentNote) {
      updateNote({ id: currentNote.id, title, body });
    } else {
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
      size={ContentModalSize.SMALL}
    >
      <DataFetcher
        queryKey={queryKey}
        fetcher={privateFetcher}
        showSpinnerOnRevalidate={false}
        render={(response: NotesByTypeAndTypeIdResponse) => {
          const note = noteId
            ? (response as unknown as NotesByTypeAndTypeIdResponse[number])
            : response[0];

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
                      <Button
                        type={ButtonType.Error}
                        variant={ButtonVariant.Ghost}
                        onClick={() => onDeleteClicked(note.id)}
                        isLoading={isDeletingNote}
                        htmlType="button"
                        tooltip={t('notes:delete-note')}
                      >
                        <TrashIcon />
                      </Button>

                      <Button
                        variant={ButtonVariant.Ghost}
                        tooltip={t('notes:share-as-reflection')}
                        htmlType="button"
                      >
                        <ChatIcon />
                      </Button>
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
