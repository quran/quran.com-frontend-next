/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import React, { useRef, useState } from 'react';

import { editorViewCtx, serializerCtx } from '@milkdown/core';
import { useInstance } from '@milkdown/react';
import useTranslation from 'next-translate/useTranslation';
import dynamic from 'next/dynamic';
import { useSWRConfig } from 'swr';

import LazyLoadingSpinner from '../Editor/LazyLoadingSpinner';

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

const NotesEditor = dynamic(() => import('@/components/Notes/Editor'), {
  ssr: false,
  loading: LazyLoadingSpinner,
});

type Props = {
  isOpen: boolean;
  onClose: () => void;
  type?: NoteType;
  typeId?: string;
  typeMetadata?: { identifier: string } & Record<string, any>;
};

type NoteFormData = {
  title: string;
};

const NoteModal: React.FC<Props> = ({ onClose, isOpen, type, typeId, typeMetadata }) => {
  const { t } = useTranslation('common');
  const contentModalRef = useRef<ContentModalHandles>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInstanceLoading, getInstance] = useInstance();
  const toast = useToast();
  const { mutate } = useSWRConfig();

  const isButtonDisabled = isLoading || isInstanceLoading;

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

  const onSubmit = ({ title }: NoteFormData, currentNote: NoteResponse | undefined) => {
    logButtonClick('save_note');
    const body = getInstance().action((ctx) => {
      const editorView = ctx.get(editorViewCtx);
      const serializer = ctx.get(serializerCtx);
      return serializer(editorView.state.doc);
    });
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
                ].map((field) => buildFormBuilderFormField(field, t))}
                actionText={t('common:notes.save')}
                onSubmit={(data) => onSubmit(data as NoteFormData, note)}
                isSubmitting={isButtonDisabled}
                extraElement={<NotesEditor defaultValue={note?.body} />}
              />
            </>
          );
        }}
      />
    </ContentModal>
  );
};

export default NoteModal;
