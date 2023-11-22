/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { useEffect, useRef, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import useSWR, { useSWRConfig } from 'swr';

import DeleteNoteButton from './DeleteNoteButton';
import styles from './NoteModal.module.scss';

import buildFormBuilderFormField from '@/components/FormBuilder/buildFormBuilderFormField';
import FormBuilder from '@/components/FormBuilder/FormBuilder';
import ContentModal, { ContentModalSize } from '@/dls/ContentModal/ContentModal';
import ContentModalHandles from '@/dls/ContentModal/types/ContentModalHandles';
import Input from '@/dls/Forms/Input';
import Spinner from '@/dls/Spinner/Spinner';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import NotesByTypeAndTypeIdResponse, {
  NoteResponse,
} from '@/types/auth/NotesByTypeAndTypeIdResponse';
import ErrorMessageId from '@/types/ErrorMessageId';
import { RuleType } from '@/types/FieldRule';
import { FormFieldType } from '@/types/FormField';
import { addNote, deleteNote, privateFetcher, updateNote } from '@/utils/auth/api';
import { makeGetNotesByVerseUrl } from '@/utils/auth/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';
import { isVerseKeyWithinRanges } from '@/utils/verse';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  verseKey: string;
};

type NoteFormData = {
  title: string;
  body: string;
};

const NoteModal: React.FC<Props> = ({ onClose, isOpen, verseKey }) => {
  const { t } = useTranslation('common');
  const contentModalRef = useRef<ContentModalHandles>();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const toast = useToast();
  const { mutate, cache } = useSWRConfig();

  const {
    isValidating,
    data: notes,
    mutate: mutateNotes,
  } = useSWR<NotesByTypeAndTypeIdResponse>(makeGetNotesByVerseUrl(verseKey), privateFetcher);
  const isLoading = isValidating && !notes;
  const note = isLoading ? null : notes?.[0];
  const [noteTitle, setNoteTitle] = useState<string>('');

  useEffect(() => {
    if (note) {
      setNoteTitle(note.title);
    }
  }, [note]);

  const mutateCache = () => {
    mutateNotes();
  };

  const clearCountCache = () => {
    // we need to invalidate one of keys that look like: ['countNotes', notesRange]
    // so that the count is updated
    const keys = [...(cache as any).keys()].filter((key) => {
      if (!key.startsWith('countNotes/')) {
        return false;
      }

      // check if the note is within the range
      const rangeString = key.replace('countNotes/', '');

      return isVerseKeyWithinRanges(verseKey, rangeString);
    }) as string[];

    if (keys.length) {
      keys.forEach((key) => {
        cache.delete(key);
        mutate(key);
      });
    }
  };

  const onDeleteClicked = async (noteId: string, title: string) => {
    logButtonClick('delete_note');

    try {
      await deleteNote(noteId);
      toast(t('notes:delete-success', { title }), {
        status: ToastStatus.Success,
      });
      mutateCache();
      clearCountCache();
      onClose();
    } catch (error) {
      toast(t('common:error.general'), {
        status: ToastStatus.Error,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const onSubmit = async ({ title, body }: NoteFormData, currentNote?: NoteResponse) => {
    logButtonClick('save_note');
    setIsDeleting(true);

    // if the note exits, it's an update
    if (currentNote) {
      try {
        await updateNote(currentNote.id, noteTitle, body);
        toast(t('notes:update-success', { title: noteTitle }), {
          status: ToastStatus.Success,
        });
        mutateCache();
      } catch (e) {
        toast(t('common:error.general'), {
          status: ToastStatus.Error,
        });
      } finally {
        setIsDeleting(false);
      }
    } else {
      try {
        await addNote({
          title,
          body,
          ranges: [`${verseKey}-${verseKey}`],
        });
        toast(t('notes:save-success', { title }), {
          status: ToastStatus.Success,
        });
        mutateCache();
        clearCountCache();
      } catch (e) {
        toast(t('common:error.general'), {
          status: ToastStatus.Error,
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };
  return (
    <ContentModal
      innerRef={contentModalRef}
      isOpen={isOpen}
      header={
        isLoading || !note ? (
          <div className={styles.headerContainer} />
        ) : (
          <div className={styles.headerContainer}>
            <DeleteNoteButton
              onDeleteClicked={() => onDeleteClicked(note.id, note.title)}
              isButtonDisabled={isDeleting}
            />
            <Input
              id="note-title"
              value={noteTitle}
              onChange={setNoteTitle}
              placeholder={t('title')}
            />
          </div>
        )
      }
      hasCloseButton
      onClose={onClose}
      onEscapeKeyDown={onClose}
      size={ContentModalSize.SMALL}
    >
      {isLoading ? (
        <Spinner isCentered />
      ) : (
        <>
          <FormBuilder
            formFields={[
              ...(!note
                ? [
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
                  ]
                : []),
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
            isSubmitting={isDeleting}
          />
        </>
      )}
    </ContentModal>
  );
};

export default NoteModal;
