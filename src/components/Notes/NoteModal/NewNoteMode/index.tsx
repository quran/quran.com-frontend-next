/* eslint-disable max-lines */
import React, { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import styles from '../NoteModal.module.scss';
import PublicReflectionDescription from '../PublicReflectionCheckboxDescription';

import buildFormBuilderFormField from '@/components/FormBuilder/buildFormBuilderFormField';
import buildTranslatedErrorMessageByErrorId from '@/components/FormBuilder/buildTranslatedErrorMessageByErrorId';
import FormBuilder from '@/components/FormBuilder/FormBuilder';
import ReflectionIntro from '@/components/Notes/NoteModal/ReflectionIntro';
import ShareToQrCheckboxLabel from '@/components/Notes/NoteModal/ShareToQrCheckboxLabel';
import Button from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useMutation from '@/hooks/useMutation';
import { Note } from '@/types/auth/Note';
import ErrorMessageId from '@/types/ErrorMessageId';
import { RuleType } from '@/types/FieldRule';
import { FormFieldType } from '@/types/FormField';
import { addNote as baseAddNote } from '@/utils/auth/api';
import { makeGetNotesByVerseUrl } from '@/utils/auth/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';
import adjustNoteCounts from '@/utils/notes/adjustNoteCounts';

const BODY_MIN_LENGTH = 6;
const BODY_MAX_LENGTH = 10000;

const BODY_MIN_VALIDATION_PARAMS = {
  value: BODY_MIN_LENGTH,
};
const BODY_MAX_VALIDATION_PARAMS = {
  value: BODY_MAX_LENGTH,
};

type NoteFormData = {
  body: string;
  saveToQR: boolean;
};

type Props = {
  verseKey: string;
  onSuccess?: () => void;
};

const NewNoteMode: React.FC<Props> = ({ verseKey, onSuccess }) => {
  const { t } = useTranslation('common');
  const toast = useToast();
  const { mutate, cache } = useSWRConfig();
  const [isCheckboxTicked, setIsCheckboxTicked] = useState(false);

  const { mutate: addNote, isMutating: isAddingNote } = useMutation<Note, NoteFormData>(
    async ({ body, saveToQR }) => {
      return baseAddNote({
        body,
        saveToQR,
        verseKey,
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
        mutateCache(data);
        // Adjust cached per-range counts client-side
        adjustNoteCounts(cache, mutate, verseKey, +1);

        if (onSuccess) {
          onSuccess();
        }
      },
      onError: () => {
        toast(t('common:error.general'), {
          status: ToastStatus.Error,
        });
      },
    },
  );

  const mutateCache = (newNote: Note) => {
    if (verseKey) {
      const key = makeGetNotesByVerseUrl(verseKey);
      // Prepend the new note to the existing cached list without revalidating
      mutate(
        key,
        (prev: any) => {
          const list: Note[] = Array.isArray(prev) ? (prev as Note[]) : [];
          return [newNote, ...list];
        },
        false,
      );
    }
  };
  const onSubmit = async ({ body, saveToQR }: NoteFormData) => {
    logButtonClick('add_note');
    addNote({
      body,
      saveToQR,
    });
  };
  return (
    <>
      <ReflectionIntro />
      <FormBuilder
        formFields={[
          {
            field: 'body',
            placeholder: t('notes:body-placeholder'),
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
            fieldSetLegend: t('notes:notes-and-reflcs'),
          },
          {
            field: 'saveToQR',
            label: <ShareToQrCheckboxLabel />,
            defaultValue: false,
            type: FormFieldType.Checkbox,
            extraSection: <PublicReflectionDescription />,
            onChange: (val: boolean) => {
              setIsCheckboxTicked(val);
            },
          },
        ].map((field) => buildFormBuilderFormField(field, t))}
        onSubmit={onSubmit}
        isSubmitting={isAddingNote}
        renderAction={(props) => (
          <div className={styles.submitContainer}>
            <div className={styles.actionContainer}>
              <Button
                htmlType="submit"
                isLoading={props.isLoading}
                isDisabled={props.isLoading}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {isCheckboxTicked ? t('notes:save-post-to-qr') : t('notes:save-privately')}
              </Button>
            </div>
          </div>
        )}
      />
    </>
  );
};

export default NewNoteMode;
