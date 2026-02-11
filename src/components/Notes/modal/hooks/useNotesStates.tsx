import { useCallback, useEffect, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import {
  MAX_NOTE_LENGTH,
  MIN_NOTE_LENGTH,
  NoteFormError,
  NoteFormErrorId,
  NoteFormErrors,
} from '@/components/Notes/modal/validation';
import { logErrorToSentry } from '@/lib/sentry';
import { toLocalizedNumber } from '@/utils/locale';

export type OnSaveNote = (config: {
  note: string;
  isPublic: boolean;
}) => Promise<void | NoteFormErrors | null>;

export enum LoadingState {
  Public = 'public',
  Private = 'private',
}

export const useNotesStates = (
  initialNote: string,
  onSaveNote: OnSaveNote,
  onMyNotes?: () => void,
  isModalOpen?: boolean,
) => {
  const { t, lang } = useTranslation();

  const [noteInput, setNoteInput] = useState(initialNote);
  const [errors, setErrors] = useState<Record<string, NoteFormError>>({});
  const [loading, setLoading] = useState<LoadingState | null>(null);

  const setNoteError = useCallback((id: NoteFormErrorId, message: string) => {
    setErrors((prevErrors) => ({ ...prevErrors, note: { id, message } }));
  }, []);

  const validateNoteInput = useCallback((): boolean => {
    if (!noteInput) {
      setNoteError(
        NoteFormErrorId.RequiredField,
        t('common:validation.required-field', { field: t('notes:note') }),
      );

      return false;
    }

    if (noteInput.length < MIN_NOTE_LENGTH) {
      setNoteError(
        NoteFormErrorId.MinimumLength,
        t('common:validation.minimum-length', {
          field: t('notes:note'),
          value: toLocalizedNumber(MIN_NOTE_LENGTH, lang),
        }),
      );

      return false;
    }

    if (noteInput.length > MAX_NOTE_LENGTH) {
      setNoteError(
        NoteFormErrorId.MaximumLength,
        t('common:validation.maximum-length', {
          field: t('notes:note'),
          value: toLocalizedNumber(MAX_NOTE_LENGTH, lang),
        }),
      );

      return false;
    }

    return true;
  }, [noteInput, t, lang, setNoteError]);

  const onSubmit = useCallback(
    async (isPublic: boolean) => {
      if (!validateNoteInput()) return;

      try {
        setLoading(isPublic ? LoadingState.Public : LoadingState.Private);
        const noteFormErrors = await onSaveNote({ note: noteInput, isPublic });
        if (noteFormErrors && Object.keys(noteFormErrors).length > 0) {
          setErrors(noteFormErrors);
        } else {
          setNoteInput('');
          onMyNotes?.();
        }
      } catch (error) {
        logErrorToSentry(error, {
          transactionName: isPublic ? 'notes.post-to-qr' : 'notes.save-privately',
          metadata: { noteLength: noteInput.length },
        });
      } finally {
        setLoading(null);
      }
    },
    [noteInput, validateNoteInput, onSaveNote, onMyNotes],
  );

  const onPrivateSave = useCallback(async () => {
    await onSubmit(false);
  }, [onSubmit]);

  const onPublicSaveRequest = useCallback(async () => {
    await onSubmit(true);
  }, [onSubmit]);

  const onNoteInputChange = useCallback((value: string) => {
    setNoteInput(value);
    setErrors({});
  }, []);

  useEffect(() => {
    setErrors({});
    setNoteInput(initialNote);
  }, [isModalOpen, initialNote]);

  return {
    noteInput,
    errors,
    loading,
    setErrors,
    validateNoteInput,
    onNoteInputChange,
    onPrivateSave,
    onPublicSaveRequest,
  };
};
