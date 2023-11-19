/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import React, { useRef, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import DeleteNoteButton from './DeleteNoteButton';
import NoteModalHeader from './Header';

import DataFetcher from '@/components/DataFetcher';
import buildFormBuilderFormField from '@/components/FormBuilder/buildFormBuilderFormField';
import FormBuilder from '@/components/FormBuilder/FormBuilder';
import ContentModal, { ContentModalSize } from '@/dls/ContentModal/ContentModal';
import ContentModalHandles from '@/dls/ContentModal/types/ContentModalHandles';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import NotesByTypeAndTypeIdResponse, {
  NoteResponse,
} from '@/types/auth/NotesByTypeAndTypeIdResponse';
import ErrorMessageId from '@/types/ErrorMessageId';
import { RuleType } from '@/types/FieldRule';
import { FormFieldType } from '@/types/FormField';
import NoteType from '@/types/NoteType';
import { addNote, deleteNote, privateFetcher, updateNote } from '@/utils/auth/api';
import { makeGetNoteByAttachedEntityUrl } from '@/utils/auth/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  type?: NoteType;
  typeId?: string;
  typeMetadata?: { identifier: string } & Record<string, any>;
};

type NoteFormData = {
  title: string;
  body: string;
};

const NoteModal: React.FC<Props> = ({ onClose, isOpen, type, typeId, typeMetadata }) => {
  const { t } = useTranslation('common');
  const contentModalRef = useRef<ContentModalHandles>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const toast = useToast();
  const { mutate } = useSWRConfig();

  const isButtonDisabled = isLoading;

  const onDeleteClicked = (noteId: string, title: string) => {
    logButtonClick('delete_note');
    deleteNote(noteId)
      .then(() => {
        toast(t('notes:delete-success', { title }), {
          status: ToastStatus.Success,
        });
        onClose();
        mutate(
          makeGetNoteByAttachedEntityUrl({
            entityId: typeId,
            entityType: type,
          }),
          () => {
            return [undefined];
          },
          {
            revalidate: false,
          },
        );
      })
      .catch(() => {
        toast(t('common:error.general'), {
          status: ToastStatus.Error,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const onSubmit = ({ title, body }: NoteFormData, currentNote: NoteResponse | undefined) => {
    logButtonClick('save_note');
    setIsLoading(true);
    // if the note exits, it's an update
    if (currentNote) {
      updateNote(currentNote.id, title, body)
        .then((response) => {
          toast(t('notes:update-success', { title }), {
            status: ToastStatus.Success,
          });
          mutate(
            makeGetNoteByAttachedEntityUrl({
              entityId: typeId,
              entityType: type,
            }),
            () => {
              return [response];
            },
            {
              revalidate: false,
            },
          );
        })
        .catch(() => {
          toast(t('common:error.general'), {
            status: ToastStatus.Error,
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      addNote({
        type,
        typeId,
        typeMetadata,
        title,
        body,
      })
        .then((response) => {
          toast(t('notes:save-success', { title }), {
            status: ToastStatus.Success,
          });
          mutate(
            makeGetNoteByAttachedEntityUrl({
              entityId: typeId,
              entityType: type,
            }),
            () => {
              return [response];
            },
            {
              revalidate: false,
            },
          );
        })
        .catch(() => {
          toast(t('common:error.general'), {
            status: ToastStatus.Error,
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };
  return (
    <ContentModal
      innerRef={contentModalRef}
      isOpen={isOpen}
      header={<NoteModalHeader />}
      hasCloseButton
      onClose={onClose}
      onEscapeKeyDown={onClose}
      size={ContentModalSize.MEDIUM}
    >
      <DataFetcher
        queryKey={makeGetNoteByAttachedEntityUrl({
          entityId: typeId,
          entityType: type,
        })}
        fetcher={privateFetcher}
        render={(response: NotesByTypeAndTypeIdResponse) => {
          const [note] = response;
          return (
            <>
              {note && (
                <DeleteNoteButton
                  onDeleteClicked={() => onDeleteClicked(note.id, note.title)}
                  isButtonDisabled={isLoading}
                />
              )}
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
                  },
                ].map((field) => buildFormBuilderFormField(field, t))}
                actionText={t('common:notes.save')}
                onSubmit={(data) => onSubmit(data as NoteFormData, note)}
                isSubmitting={isButtonDisabled}
              />
            </>
          );
        }}
      />
    </ContentModal>
  );
};

export default NoteModal;
