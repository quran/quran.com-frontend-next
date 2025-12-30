import { useCallback, useEffect, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import { logErrorToSentry } from '@/lib/sentry';

const MIN_NOTE_LENGTH = 6;
const MAX_NOTE_LENGTH = 10000;

export enum LoadingState {
  Public = 'public',
  Private = 'private',
}

interface ValidationError {
  id: string;
  message: string;
}

export const useNotesStates = (
  initialNote: string,
  onSaveNote: ({ note, isPublic }: { note: string; isPublic: boolean }) => Promise<void>,
  onMyNotes?: () => void,
  isModalOpen?: boolean,
) => {
  const { t } = useTranslation();

  const [noteInput, setNoteInput] = useState(initialNote);
  const [errors, setErrors] = useState<Record<string, ValidationError>>({});
  const [loading, setLoading] = useState<LoadingState | null>(null);

  const setNoteError = useCallback((id: string, message: string) => {
    setErrors((prevErrors) => ({ ...prevErrors, note: { id, message } }));
  }, []);

  const validateNoteInput = useCallback((): boolean => {
    if (!noteInput) {
      setNoteError(
        'required-field',
        t('common:validation.required-field', { field: t('notes:note') }),
      );

      return false;
    }

    if (noteInput.length < MIN_NOTE_LENGTH) {
      setNoteError(
        'minimum-length',
        t('common:validation.minimum-length', { field: t('notes:note'), value: MIN_NOTE_LENGTH }),
      );

      return false;
    }

    if (noteInput.length > MAX_NOTE_LENGTH) {
      setNoteError(
        'maximum-length',
        t('common:validation.maximum-length', { field: t('notes:note'), value: MAX_NOTE_LENGTH }),
      );

      return false;
    }

    return true;
  }, [noteInput, t, setNoteError]);

  const onSubmit = useCallback(
    async (isPublic: boolean) => {
      if (!validateNoteInput()) return;

      try {
        setLoading(isPublic ? LoadingState.Public : LoadingState.Private);
        await onSaveNote({ note: noteInput, isPublic });
        setNoteInput('');
        onMyNotes?.();
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
    validateNoteInput,
    onNoteInputChange,
    onPrivateSave,
    onPublicSaveRequest,
  };
};
