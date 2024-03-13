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
import useMutateWithoutRevalidation from '@/hooks/useMutateWithoutRevalidation';
import useMutation from '@/hooks/useMutation';
import ConsentType from '@/types/auth/ConsentType';
import { Note } from '@/types/auth/Note';
import UserProfile from '@/types/auth/UserProfile';
import ErrorMessageId from '@/types/ErrorMessageId';
import { RuleType } from '@/types/FieldRule';
import { FormFieldType } from '@/types/FormField';
import { addNote as baseAddNote } from '@/utils/auth/api';
import { makeGetNotesByVerseUrl, makeUserProfileUrl } from '@/utils/auth/apiPaths';
import { logButtonClick } from '@/utils/eventLogger';
import { isVerseKeyWithinRanges } from '@/utils/verse';

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
  const mutateWithoutRevalidation = useMutateWithoutRevalidation();

  const { mutate: addNote, isMutating: isAddingNote } = useMutation<Note, NoteFormData>(
    async ({ body, saveToQR }) => {
      return baseAddNote({
        body,
        saveToQR,
        ...(verseKey && {
          ranges: [`${verseKey}-${verseKey}`],
        }),
      }) as Promise<Note>;
    },
    {
      onSuccess: (data) => {
        // if publishing the note publicly call failed after saving the note succeeded
        // @ts-ignore
        if (data?.error === true) {
          toast(t('notes:save-publish-failed'), {
            status: ToastStatus.Error,
          });
          // @ts-ignore
          mutateCache([data.note]);
        } else {
          toast(t('notes:save-success'), {
            status: ToastStatus.Success,
          });
          mutateCache([data]);
        }
        clearCountCache();

        /*
         * TODO: since we are not using consents at the moment, we are updating the consents field directly instead of appending to existing consents.
         * also, if the user deletes the note, we are not removing it.
         */
        mutateWithoutRevalidation(makeUserProfileUrl(), (currentProfileData: UserProfile) => {
          return {
            ...currentProfileData,
            consents: { ...currentProfileData.consents, [ConsentType.HAS_NOTES]: true },
          };
        });

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

  const mutateCache = (data: unknown) => {
    if (verseKey) {
      mutate(makeGetNotesByVerseUrl(verseKey), data);
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
